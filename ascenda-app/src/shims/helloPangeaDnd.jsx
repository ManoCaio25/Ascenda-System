import React from "react";

const noop = () => {};

export function DragDropContext({ children }) {
  return <>{children}</>;
}

export function Droppable({ droppableId, children }) {
  const provided = {
    droppableProps: { "data-droppable-id": droppableId },
    innerRef: noop,
    placeholder: null,
  };
  const snapshot = {
    isDraggingOver: false,
  };
  return <>{children(provided, snapshot)}</>;
}

export function Draggable({ draggableId, index, children }) {
  const provided = {
    draggableProps: { "data-draggable-id": draggableId, "data-index": index },
    dragHandleProps: {},
    innerRef: noop,
  };
  const snapshot = {
    isDragging: false,
  };
  return <>{children(provided, snapshot)}</>;
}
