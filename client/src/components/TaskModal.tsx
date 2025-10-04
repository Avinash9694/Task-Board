import React, { useState } from 'react';
import styled from 'styled-components';
import { FiX, FiUser, FiCalendar, FiFlag, FiMessageSquare, FiTrash2 } from 'react-icons/fi';
import { Task, User, Comment } from '../types';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: #f0f0f0;
    color: #333;
  }
`;

const TaskDetails = styled.div`
  margin-bottom: 24px;
`;

const DetailRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const DetailLabel = styled.span`
  font-weight: 500;
  color: #666;
  min-width: 80px;
`;

const DetailValue = styled.span`
  color: #333;
`;

const PriorityBadge = styled.span<{ priority: string }>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
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
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  background: ${props => props.isOverdue ? '#fee2e2' : '#d1fae5'};
  color: ${props => props.isOverdue ? '#dc2626' : '#059669'};
`;

const AssignedUser = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 12px;
  background: ${props => props.color}20;
  color: ${props => props.color};
  font-size: 0.8rem;
  font-weight: 500;
`;

const UserAvatar = styled.div<{ color: string }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
`;

const CommentsSection = styled.div`
  margin-top: 24px;
  padding-top: 20px;
  border-top: 2px solid #f0f0f0;
`;

const CommentsHeader = styled.h3`
  margin: 0 0 16px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CommentList = styled.div`
  margin-bottom: 16px;
`;

const CommentItem = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
`;

const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const CommentAuthor = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  color: ${props => props.color};
`;

const CommentTime = styled.span`
  font-size: 0.8rem;
  color: #666;
`;

const CommentContent = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: #333;
  line-height: 1.4;
`;

const CommentForm = styled.form`
  display: flex;
  gap: 8px;
`;

const CommentInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const CommentButton = styled.button`
  padding: 8px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: #5a6fd8;
  }
`;

interface TaskModalProps {
  task: Task;
  users: User[];
  onClose: () => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onAddComment: (taskId: string, content: string) => void;
  onDeleteComment: (commentId: string) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({
  task,
  users,
  onClose,
  onUpdateTask,
  onAddComment,
  onDeleteComment
}) => {
  const [newComment, setNewComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');

  const assignedUser = users.find(user => user.id === task.assignedTo);
  const isOverdue = task.dueDate ? new Date(task.dueDate) < new Date() : false;

  const handleSave = () => {
    onUpdateTask(task.id, {
      title: editTitle,
      description: editDescription
    });
    setIsEditing(false);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(task.id, newComment.trim());
      setNewComment('');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              style={{
                border: '2px solid #667eea',
                borderRadius: '4px',
                padding: '8px 12px',
                fontSize: '1.5rem',
                fontWeight: '600',
                width: '100%'
              }}
            />
          ) : (
            <ModalTitle>{task.title}</ModalTitle>
          )}
          <CloseButton onClick={onClose}>
            <FiX />
          </CloseButton>
        </ModalHeader>

        <TaskDetails>
          <DetailRow>
            <DetailLabel>Priority:</DetailLabel>
            <PriorityBadge priority={task.priority || 'medium'}>
              {task.priority || 'medium'}
            </PriorityBadge>
          </DetailRow>

          {task.assignedTo && assignedUser && (
            <DetailRow>
              <DetailLabel>Assigned:</DetailLabel>
              <AssignedUser color={assignedUser.color}>
                <UserAvatar color={assignedUser.color}>
                  {assignedUser.name.substring(0, 2).toUpperCase()}
                </UserAvatar>
                {assignedUser.name}
              </AssignedUser>
            </DetailRow>
          )}

          {task.dueDate && (
            <DetailRow>
              <DetailLabel>Due Date:</DetailLabel>
              <DueDateBadge isOverdue={isOverdue}>
                {formatDate(task.dueDate)}
              </DueDateBadge>
            </DetailRow>
          )}

          <DetailRow>
            <DetailLabel>Created:</DetailLabel>
            <DetailValue>{formatDate(task.createdAt)} at {formatTime(task.createdAt)}</DetailValue>
          </DetailRow>
        </TaskDetails>

        <div>
          <DetailLabel>Description:</DetailLabel>
          {isEditing ? (
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              style={{
                width: '100%',
                minHeight: '100px',
                border: '2px solid #667eea',
                borderRadius: '8px',
                padding: '12px',
                marginTop: '8px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          ) : (
            <p style={{ marginTop: '8px', color: '#333', lineHeight: '1.5' }}>
              {task.description || 'No description provided'}
            </p>
          )}
        </div>

        {isEditing && (
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setIsEditing(false)}
              style={{
                padding: '8px 16px',
                background: '#f3f4f6',
                color: '#666',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              style={{
                padding: '8px 16px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Save
            </button>
          </div>
        )}

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              background: '#f3f4f6',
              color: '#666',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Edit Task
          </button>
        )}

        <CommentsSection>
          <CommentsHeader>
            <FiMessageSquare />
            Comments ({task.comments?.length || 0})
          </CommentsHeader>

          <CommentList>
            {task.comments?.map((comment) => {
              const commentUser = users.find(user => user.id === comment.userId);
              return (
                <CommentItem key={comment.id}>
                  <CommentHeader>
                    <CommentAuthor color={commentUser?.color || '#666'}>
                      <UserAvatar color={commentUser?.color || '#666'}>
                        {commentUser?.name.substring(0, 2).toUpperCase() || '??'}
                      </UserAvatar>
                      {commentUser?.name || 'Unknown User'}
                    </CommentAuthor>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CommentTime>{formatTime(comment.createdAt)}</CommentTime>
                      <button
                        onClick={() => onDeleteComment(comment.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#dc2626',
                          cursor: 'pointer',
                          padding: '2px'
                        }}
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </CommentHeader>
                  <CommentContent>{comment.content}</CommentContent>
                </CommentItem>
              );
            })}
          </CommentList>

          <CommentForm onSubmit={handleAddComment}>
            <CommentInput
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <CommentButton type="submit">Add</CommentButton>
          </CommentForm>
        </CommentsSection>
      </ModalContent>
    </ModalOverlay>
  );
};

export default TaskModal;
