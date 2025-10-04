import React, { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import styled from 'styled-components';
import { FiEdit2, FiTrash2, FiMessageSquare, FiUser, FiCalendar, FiFlag } from 'react-icons/fi';
import { Task as TaskType, User } from '../types';
import TaskModal from './TaskModal';

const TaskContainer = styled.div<{ isDragging: boolean }>`
  background: white;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  cursor: grab;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    transform: translateY(-1px);
  }

  &:active {
    cursor: grabbing;
  }
`;

const TaskHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const TaskTitle = styled.h4`
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
  flex: 1;
  margin-right: 8px;
`;

const TaskActions = styled.div`
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;

  ${TaskContainer}:hover & {
    opacity: 1;
  }
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

const TaskDescription = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: #666;
  line-height: 1.4;
  margin-bottom: 8px;
`;

const TaskMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  color: #999;
  flex-wrap: wrap;
`;

const TaskBadges = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
`;

const PriorityBadge = styled.span<{ priority: string }>`
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 500;
  background: ${props => {
    switch (props.priority) {
      case 'high': return '#fee2e2';
      case 'medium': return '#fef3c7';
      case 'low': return '#d1fae5';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.priority) {
      case 'high': return '#dc2626';
      case 'medium': return '#d97706';
      case 'low': return '#059669';
      default: return '#6b7280';
    }
  }};
`;

const DueDateBadge = styled.span<{ isOverdue: boolean }>`
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 500;
  background: ${props => props.isOverdue ? '#fee2e2' : '#d1fae5'};
  color: ${props => props.isOverdue ? '#dc2626' : '#059669'};
`;

const AssignedUser = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  border-radius: 8px;
  background: ${props => props.color}20;
  color: ${props => props.color};
  font-size: 0.7rem;
  font-weight: 500;
`;

const UserAvatar = styled.div<{ color: string }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.6rem;
  font-weight: 600;
`;

const CommentCount = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #667eea;
  font-size: 0.7rem;
  font-weight: 500;
`;

const EditForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const EditInput = styled.input`
  border: 2px solid #667eea;
  border-radius: 4px;
  padding: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  width: 100%;
  box-sizing: border-box;
`;

const EditTextarea = styled.textarea`
  border: 2px solid #667eea;
  border-radius: 4px;
  padding: 8px;
  font-size: 0.85rem;
  width: 100%;
  box-sizing: border-box;
  resize: vertical;
  min-height: 60px;
  font-family: inherit;
`;

const EditActions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
`;

const EditButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  ${props => props.variant === 'primary' ? `
    background: #667eea;
    color: white;
    
    &:hover {
      background: #5a6fd8;
    }
  ` : `
    background: #f0f0f0;
    color: #666;
    
    &:hover {
      background: #e0e0e0;
    }
  `}
`;

interface TaskProps {
  task: TaskType;
  index: number;
  users: User[];
  onUpdate: (id: string, title: string, description?: string) => void;
  onDelete: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<TaskType>) => void;
  onAddComment: (taskId: string, content: string) => void;
  onDeleteComment: (commentId: string) => void;
}

const Task: React.FC<TaskProps> = ({ 
  task, 
  index, 
  users, 
  onUpdate, 
  onDelete, 
  onUpdateTask, 
  onAddComment, 
  onDeleteComment 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description);
  const [showModal, setShowModal] = useState(false);

  const assignedUser = users.find(user => user.id === task.assignedTo);
  const isOverdue = task.dueDate ? new Date(task.dueDate) < new Date() : false;

  const handleEdit = () => {
    setIsEditing(true);
    setEditTitle(task.title);
    setEditDescription(task.description);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editTitle.trim()) {
      onUpdate(task.id, editTitle.trim(), editDescription?.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDescription(task.description);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete the task "${task.title}"?`)) {
      onDelete(task.id);
    }
  };

  if (isEditing) {
    return (
      <TaskContainer isDragging={false}>
        <EditForm onSubmit={handleSave}>
          <EditInput
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Task title"
            autoFocus
          />
          <EditTextarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Task description (optional)"
          />
          <EditActions>
            <EditButton type="button" onClick={handleCancel}>
              Cancel
            </EditButton>
            <EditButton type="submit" variant="primary">
              Save
            </EditButton>
          </EditActions>
        </EditForm>
      </TaskContainer>
    );
  }

  return (
    <>
      <Draggable draggableId={task.id} index={index}>
        {(provided, snapshot) => (
        <TaskContainer
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          isDragging={snapshot.isDragging}
          onClick={() => setShowModal(true)}
        >
            <TaskHeader>
              <TaskTitle>{task.title}</TaskTitle>
              <TaskActions>
                <ActionButton onClick={handleEdit} title="Edit task">
                  <FiEdit2 size={14} />
                </ActionButton>
                <ActionButton onClick={handleDelete} title="Delete task">
                  <FiTrash2 size={14} />
                </ActionButton>
              </TaskActions>
            </TaskHeader>
            
            {task.description && (
              <TaskDescription>{task.description}</TaskDescription>
            )}
            
            <TaskMeta>
              {task.description && (
                <>
                  <FiMessageSquare size={12} />
                  <span>Has description</span>
                </>
              )}
            </TaskMeta>

            <TaskBadges>
              {task.priority && task.priority !== 'medium' && (
                <PriorityBadge priority={task.priority}>
                  <FiFlag size={10} />
                  {task.priority}
                </PriorityBadge>
              )}
              
              {task.dueDate && (
                <DueDateBadge isOverdue={isOverdue}>
                  <FiCalendar size={10} />
                  {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </DueDateBadge>
              )}
              
              {assignedUser && (
                <AssignedUser color={assignedUser.color}>
                  <UserAvatar color={assignedUser.color}>
                    {assignedUser.name.substring(0, 2).toUpperCase()}
                  </UserAvatar>
                  {assignedUser.name}
                </AssignedUser>
              )}
              
              {task.comments && task.comments.length > 0 && (
                <CommentCount>
                  <FiMessageSquare size={10} />
                  {task.comments.length}
                </CommentCount>
            )}
          </TaskBadges>
        </TaskContainer>
        )}
      </Draggable>
      
      {showModal && (
        <TaskModal
          task={task}
          users={users}
          onClose={() => setShowModal(false)}
          onUpdateTask={onUpdateTask}
          onAddComment={onAddComment}
          onDeleteComment={onDeleteComment}
        />
      )}
    </>
  );
};

export default Task;
