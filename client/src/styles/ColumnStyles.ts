import styled from 'styled-components';

export const ColumnContainer = styled.div<{ isDragging: boolean }>`
  min-width: 280px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  transform: ${props => props.isDragging ? 'rotate(5deg)' : 'none'};
  transition: all 0.2s ease;
`;

export const ColumnHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
`;

export const ColumnTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  flex: 1;
`;

export const ColumnActions = styled.div`
  display: flex;
  gap: 8px;
`;

export const ActionButton = styled.button`
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

export const TasksContainer = styled.div<{ isDraggingOver: boolean }>`
  min-height: 100px;
  background: ${props => props.isDraggingOver ? 'rgba(102, 126, 234, 0.1)' : 'transparent'};
  border-radius: 8px;
  transition: background 0.2s ease;
`;

export const AddTaskButton = styled.button`
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

export const TaskCount = styled.span`
  background: #667eea;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
`;
