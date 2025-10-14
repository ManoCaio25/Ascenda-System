
import React, { useState, useEffect } from 'react';
import { Task } from '@estagiario/Entities/all';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { Plus, Clock, AlertCircle, CheckCircle, Target } from 'lucide-react';
import { format } from 'date-fns';

const columnsFromBackend = {
  Pendente: {
    name: 'To Do',
    items: [],
  },
  'Em Andamento': {
    name: 'In Progress',
    items: [],
  },
  'Aguardando Revisao': {
    name: 'In Review',
    items: [],
  },
  Concluida: {
    name: 'Done',
    items: [],
  },
};

const TaskCard = ({ item, index }) => {
  const priorityConfig = {
    low: { color: 'bg-blue-500', label: 'Low' },
    medium: { color: 'bg-yellow-500', label: 'Medium' },
    high: { color: 'bg-orange-500', label: 'High' },
    urgent: { color: 'bg-red-500', label: 'Urgent' }
  };

  // Default to medium if priority is not defined or unrecognized
  const priority = priorityConfig[item.priority] || priorityConfig.medium;

  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`cosmic-card rounded-lg p-4 mb-3 text-white transition-all duration-200 ${snapshot.isDragging ? 'shadow-lg shadow-purple-500/50 rotate-2' : 'hover:shadow-md hover:shadow-purple-500/30'}`}
        >
          <div className="flex justify-between items-start mb-3">
            <h4 className="font-semibold text-sm flex-1 pr-2">{item.titulo_demanda}</h4>
            <div className="flex items-center gap-2">
              <div 
                className={`w-3 h-3 rounded-full ${priority.color}`}
                title={`${priority.label} Priority`}
              ></div>
              <span className="text-xs text-slate-400 font-medium">{priority.label}</span>
            </div>
          </div>
          
          <p className="text-xs text-slate-400 mb-3 line-clamp-2">{item.descricao}</p>
          
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-1 text-slate-400">
              <Clock className="w-3 h-3" />
              <span>{format(new Date(item.data_limite), 'MMM d')}</span>
            </div>
            <span className="font-bold text-orange-400">+{item.pontos_gamificacao_associados} pts</span>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default function TasksPage() {
  const [columns, setColumns] = useState(columnsFromBackend);
  const [sortBy, setSortBy] = useState('none'); // 'none', 'priority', 'due_date'
  
  useEffect(() => {
    Task.list().then(tasks => {
      const newColumns = { ...columnsFromBackend };
      for (const col of Object.keys(newColumns)) {
        newColumns[col] = { ...newColumns[col], items: [] };
      }
      
      tasks.forEach(task => {
        if (newColumns[task.status_demanda]) {
          newColumns[task.status_demanda].items.push(task);
        }
      });
      
      // Apply initial sorting if needed
      if (sortBy !== 'none') {
        applySorting(newColumns, sortBy);
      }
      
      setColumns(newColumns);
    });
  }, [sortBy]); // Re-run effect when sortBy changes to re-fetch/re-sort

  const applySorting = (cols, sortType) => {
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
    
    // Create a deep copy of columns to avoid direct state mutation
    const updatedCols = { ...cols }; 

    Object.keys(updatedCols).forEach(colKey => {
      updatedCols[colKey] = { ...updatedCols[colKey], items: [...updatedCols[colKey].items] }; // Deep copy items array
      if (sortType === 'priority') {
        updatedCols[colKey].items.sort((a, b) => 
          (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
        );
      } else if (sortType === 'due_date') {
        updatedCols[colKey].items.sort((a, b) => 
          new Date(a.data_limite).getTime() - new Date(b.data_limite).getTime()
        );
      }
    });
    return updatedCols;
  };

  const handleSort = (sortType) => {
    setSortBy(sortType);
    const newColumns = applySorting(columns, sortType);
    setColumns(newColumns);
  };

  const onDragEnd = (result, columns, setColumns) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];
      const sourceItems = [...sourceColumn.items];
      const destItems = [...destColumn.items];
      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);
      
      const updatedTask = { ...removed, status_demanda: destination.droppableId };
      Task.update(updatedTask.id, { status_demanda: destination.droppableId }); // Persist status change
      
      // Update state and then re-apply sorting if active
      let newColsState = {
        ...columns,
        [source.droppableId]: { ...sourceColumn, items: sourceItems },
        [destination.droppableId]: { ...destColumn, items: destItems },
      };

      if (sortBy !== 'none') {
        newColsState = applySorting(newColsState, sortBy);
      }
      setColumns(newColsState);

    } else {
      const column = columns[source.droppableId];
      const copiedItems = [...column.items];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);
      
      // Update state and then re-apply sorting if active
      let newColsState = {
        ...columns,
        [source.droppableId]: { ...column, items: copiedItems },
      };
      if (sortBy !== 'none') {
        newColsState = applySorting(newColsState, sortBy);
      }
      setColumns(newColsState);
    }
  };

  return (
    <div className="p-8 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Tasks</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => handleSort(e.target.value)}
              className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-1 text-sm text-white"
            >
              <option value="none">None</option>
              <option value="priority">Priority</option>
              <option value="due_date">Due Date</option>
            </select>
          </div>
          <button className="cosmic-gradient text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> New Task
          </button>
        </div>
      </div>

      {/* Priority Legend */}
      <div className="mb-6 cosmic-card rounded-lg p-4 cosmic-glow">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Priority Legend:</h3>
        <div className="flex flex-wrap gap-4">
          {Object.entries({
            urgent: { color: 'bg-red-500', label: 'Urgent' },
            high: { color: 'bg-orange-500', label: 'High' },
            medium: { color: 'bg-yellow-500', label: 'Medium' },
            low: { color: 'bg-blue-500', label: 'Low' }
          }).map(([key, priority]) => (
            <div key={key} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${priority.color}`}></div>
              <span className="text-xs text-slate-400">{priority.label}</span>
            </div>
          ))}
        </div>
      </div>
      
      <DragDropContext onDragEnd={result => onDragEnd(result, columns, setColumns)}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(columns).map(([columnId, column]) => (
            <div key={columnId} className="flex flex-col">
              <h3 className="font-semibold mb-4 text-slate-300">{column.name} ({column.items.length})</h3>
              <Droppable droppableId={columnId}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`bg-slate-900/50 p-4 rounded-lg min-h-[500px] transition-colors ${snapshot.isDraggingOver ? 'bg-purple-900/30' : ''}`}
                  >
                    {column.items.map((item, index) => (
                      <TaskCard key={item.id} item={item} index={index} />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
