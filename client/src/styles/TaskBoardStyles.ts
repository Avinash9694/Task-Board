import styled from 'styled-components';

export const BoardContainer = styled.div`
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding: 20px 0;
  min-height: calc(100vh - 200px);
`;

export const AddColumnButton = styled.button`
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
