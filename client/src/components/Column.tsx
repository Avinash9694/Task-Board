import React, { useState, useEffect } from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import styled from 'styled-components';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import Task from './Task';
import AddTaskModal from './AddTaskModal';
import { Column as ColumnType, User, Task as TaskType } from '../types';

const ColumnContainer = styled.div<{ isDragging: boolean }>`
  min-width: 280px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  transform: ${props => props.isDragging ? 'rotate(5deg)' : 'none'};
  transition: all 0.2s ease;
`;

const ColumnHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
`;

const ColumnTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  flex: 1;
`;

const ColumnActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  color: #666;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #f0f0f0;
    color: #333;
  }
`;

const TasksContainer = styled.div<{ isDraggingOver: boolean }>`
  min-height: 100px;
  background: ${props => props.isDraggingOver ? 'rgba(102, 126, 234, 0.1)' : 'transparent'};
  border-radius: 8px;
  transition: background 0.2s ease;
`;

const AddTaskButton = styled.button`
  width: 100%;
  padding: 12px;
  background: rgba(102, 126, 234, 0.1);
  border: 2px dashed rgba(102, 126, 234, 0.3);
  border-radius: 8px;
  color: #667eea;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;

  &:hover {
    background: rgba(102, 126, 234, 0.2);
    border-color: rgba(102, 126, 234, 0.5);
  }
`;

const TaskCount = styled.span`
  background: #667eea;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
`;

interface ColumnProps {
  column: ColumnType;
  index: number;
  users: User[];
  onUpdate: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onCreateTask: (columnId: string, title: string, description?: string, assignedTo?: string, dueDate?: string, priority?: 'low' | 'medium' | 'high') => void;
  onUpdateTask: (id: string, title: string, description?: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTaskFull: (id: string, updates: Partial<TaskType>) => void;
  onAddComment: (taskId: string, content: string) => void;
  onDeleteComment: (commentId: string) => void;
}

const Column: React.FC<ColumnProps> = ({
  column,
  index,
  users,
  onUpdate,
  onDelete,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onUpdateTaskFull,
  onAddComment,
  onDeleteComment
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [droppableKey, setDroppableKey] = useState(0);

  // Force re-render of droppable when tasks change
  useEffect(() => {
    setDroppableKey(prev => prev + 1);
  }, [column.tasks.length]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditTitle(column.title);
  };

  const handleSave = () => {
    if (editTitle.trim() && editTitle !== column.title) {
      onUpdate(column.id, editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(column.title);
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleAddTask = () => {
    setShowAddTaskModal(true);
  };

  const handleCreateTask = (taskData: {
    title: string;
    description?: string;
    assignedTo?: string;
    dueDate?: string;
    priority?: 'low' | 'medium' | 'high';
  }) => {
    // Close modal first
    setShowAddTaskModal(false);
    
    // Then create task with a small delay to ensure modal is closed
    setTimeout(() => {
      onCreateTask(column.id, taskData.title, taskData.description, taskData.assignedTo, taskData.dueDate, taskData.priority);
    }, 50);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete the column "${column.title}"? This will also delete all tasks in this column.`)) {
      onDelete(column.id);
    }
  };

  return (
    <>
      <Draggable draggableId={column.id} index={index}>
        {(provided, snapshot) => (
          <ColumnContainer
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            isDragging={snapshot.isDragging}
          >
            <ColumnHeader>
              {isEditing ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={handleSave}
                  onKeyDown={handleKeyPress}
                  autoFocus
                  style={{
                    flex: 1,
                    border: '2px solid #667eea',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '1.1rem',
                    fontWeight: '600'
                  }}
                />
              ) : (
                <>
                  <ColumnTitle>{column.title}</ColumnTitle>
                  <TaskCount>{column.tasks.length}</TaskCount>
                </>
              )}
              <ColumnActions>
                <ActionButton onClick={handleEdit} title="Edit column">
                  <FiEdit2 size={16} />
                </ActionButton>
                <ActionButton onClick={handleDelete} title="Delete column">
                  <FiTrash2 size={16} />
                </ActionButton>
              </ColumnActions>
            </ColumnHeader>

            <Droppable 
              droppableId={column.id} 
              type="TASK"
              key={`${column.id}-${droppableKey}`}
            >
              {(provided, snapshot) => (
                <TasksContainer
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  isDraggingOver={snapshot.isDraggingOver}
                >
                  {column.tasks && column.tasks.length > 0 ? (
                    column.tasks.map((task, taskIndex) => (
                      <Task
                        key={task.id}
                        task={task}
                        index={taskIndex}
                        users={users}
                        onUpdate={onUpdateTask}
                        onDelete={onDeleteTask}
                        onUpdateTask={onUpdateTaskFull}
                        onAddComment={onAddComment}
                        onDeleteComment={onDeleteComment}
                      />
                    ))
                  ) : null}
                  {provided.placeholder}
                </TasksContainer>
              )}
            </Droppable>

            <AddTaskButton onClick={handleAddTask}>
              <FiPlus size={16} />
              Add Task
            </AddTaskButton>
          </ColumnContainer>
        )}
      </Draggable>
      
      {showAddTaskModal && (
        <AddTaskModal
          isOpen={showAddTaskModal}
          onClose={() => setShowAddTaskModal(false)}
          onSubmit={handleCreateTask}
          users={users}
        />
      )}
    </>
  );
};

export default Column;
