
import React, { useState, useEffect } from 'react';
import { Task } from '@estagiario/Entities/all';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { Plus, Clock, AlertCircle, CheckCircle, Target } from 'lucide-react';
import { format } from 'date-fns';
import { useI18n } from '@estagiario/Components/utils/i18n';

const columnsFromBackend = {
  Pendente: {
    name: 'todo',
    items: [],
  },
  'Em Andamento': {
    name: 'inProgress',
    items: [],
  },
  'Aguardando Revisao': {
    name: 'inReview',
    items: [],
  },
  Concluida: {
    name: 'done',
    items: [],
  },
};

const TaskCard = ({ item, index }) => {
  const { t } = useI18n();
  const priorityConfig = {
    low: { color: 'bg-blue-500', labelKey: 'low' },
    medium: { color: 'bg-yellow-500', labelKey: 'medium' },
    high: { color: 'bg-orange-500', labelKey: 'high' },
    urgent: { color: 'bg-red-500', labelKey: 'urgent' }
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
                title={t('priorityLevelLabel', { level: t(priority.labelKey) })}
              ></div>
              <span className="text-xs text-slate-400 font-medium">{t(priority.labelKey)}</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 mb-3 line-clamp-2">{item.descricao}</p>

          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-1 text-slate-400">
              <Clock className="w-3 h-3" />
              <span>{t('due', { date: format(new Date(item.data_limite), 'MMM d') })}</span>
            </div>
            <span className="font-bold text-orange-400">+{item.pontos_gamificacao_associados} {t('pointsSuffix')}</span>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default function TasksPage() {
  const [columns, setColumns] = useState(columnsFromBackend);
  const [sortBy, setSortBy] = useState('none'); // 'none', 'priority', 'due_date'
  const { t } = useI18n();
  
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
        <h1 className="text-3xl font-bold">{t('myTasks')}</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">{t('tasksSortBy')}</span>
            <select
              value={sortBy}
              onChange={(e) => handleSort(e.target.value)}
              className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-1 text-sm text-white"
            >
              <option value="none">{t('tasksSortNone')}</option>
              <option value="priority">{t('tasksSortPriority')}</option>
              <option value="due_date">{t('tasksSortDueDate')}</option>
            </select>
          </div>
          <button className="cosmic-gradient text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> {t('newTask')}
          </button>
        </div>
      </div>

      {/* Priority Legend */}
      <div className="mb-6 cosmic-card rounded-lg p-4 cosmic-glow">
        <h3 className="text-sm font-medium text-slate-300 mb-3">{t('tasksPriorityLegend')}</h3>
        <div className="flex flex-wrap gap-4">
          {Object.entries({
            urgent: { color: 'bg-red-500', labelKey: 'urgent' },
            high: { color: 'bg-orange-500', labelKey: 'high' },
            medium: { color: 'bg-yellow-500', labelKey: 'medium' },
            low: { color: 'bg-blue-500', labelKey: 'low' }
          }).map(([key, priority]) => (
            <div key={key} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${priority.color}`}></div>
              <span className="text-xs text-slate-400">{t(priority.labelKey)}</span>
            </div>
          ))}
        </div>
      </div>

      <DragDropContext onDragEnd={result => onDragEnd(result, columns, setColumns)}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(columns).map(([columnId, column]) => (
            <div key={columnId} className="flex flex-col">
              <h3 className="font-semibold mb-4 text-slate-300">{t(column.name)} ({column.items.length})</h3>
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
