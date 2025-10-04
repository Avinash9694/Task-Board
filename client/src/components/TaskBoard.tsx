import React, { useState } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import styled from 'styled-components';
import Column from './Column';
import AddColumnModal from './AddColumnModal';
import { Column as ColumnType, User, Task as TaskType } from '../types';

const BoardContainer = styled.div`
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding: 20px 0;
  min-height: calc(100vh - 200px);
`;

const AddColumnButton = styled.button`
  min-width: 280px;
  height: 60px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  color: white;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-2px);
  }
`;

interface TaskBoardProps {
  columns: ColumnType[];
  users: User[];
  onCreateColumn: (title: string) => void;
  onUpdateColumn: (id: string, title: string) => void;
  onDeleteColumn: (id: string) => void;
  onCreateTask: (columnId: string, title: string, description?: string, assignedTo?: string, dueDate?: string, priority?: 'low' | 'medium' | 'high') => void;
  onUpdateTask: (id: string, title: string, description?: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTaskFull: (id: string, updates: Partial<TaskType>) => void;
  onAddComment: (taskId: string, content: string) => void;
  onDeleteComment: (commentId: string) => void;
}

const TaskBoard: React.FC<TaskBoardProps> = ({
  columns,
  users,
  onCreateColumn,
  onUpdateColumn,
  onDeleteColumn,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onUpdateTaskFull,
  onAddComment,
  onDeleteComment
}) => {
  const [showAddColumnModal, setShowAddColumnModal] = useState(false);

  const handleAddColumn = () => {
    setShowAddColumnModal(true);
  };

  const handleCreateColumn = (title: string) => {
    onCreateColumn(title);
  };

  return (
    <>
      <Droppable droppableId="board" type="COLUMN" direction="horizontal">
        {(provided) => (
          <BoardContainer ref={provided.innerRef} {...provided.droppableProps}>
            {columns.map((column, index) => (
              <Column
                key={column.id}
                column={column}
                index={index}
                users={users}
                onUpdate={onUpdateColumn}
                onDelete={onDeleteColumn}
                onCreateTask={onCreateTask}
                onUpdateTask={onUpdateTask}
                onDeleteTask={onDeleteTask}
                onUpdateTaskFull={onUpdateTaskFull}
                onAddComment={onAddComment}
                onDeleteComment={onDeleteComment}
              />
            ))}
            {provided.placeholder}
            <AddColumnButton onClick={handleAddColumn}>
              <span>+</span>
              Add Column
            </AddColumnButton>
          </BoardContainer>
        )}
      </Droppable>
      
      {showAddColumnModal && (
        <AddColumnModal
          isOpen={showAddColumnModal}
          onClose={() => setShowAddColumnModal(false)}
          onSubmit={handleCreateColumn}
        />
      )}
    </>
  );
};

export default TaskBoard;
