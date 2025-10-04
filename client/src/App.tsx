import React from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { AppContainer, Header, Title } from './styles/AppStyles';
import TaskBoard from './components/TaskBoard';
import UserPresence from './components/UserPresence';
import { useSocket } from './hooks/useSocket';
import { Column } from './types';

const App: React.FC = () => {
  const { socket, columns, setColumns, users, loading } = useSocket();

  const handleDragEnd = (result: DropResult) => {
    if (!socket || !result.destination) return;

    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    if (result.type === 'TASK') {
      // Find the task being moved
      const sourceColumn = columns.find(col => col.id === source.droppableId);
      const task = sourceColumn?.tasks[source.index];
      
      if (!task || task.id !== draggableId) {
        console.warn('Task not found or ID mismatch during drag');
        return;
      }

      // Optimistically update the local state first
      setColumns(prev => {
        const newColumns = prev.map(col => ({ ...col, tasks: [...col.tasks] }));
        const sourceCol = newColumns.find(col => col.id === source.droppableId);
        const destCol = newColumns.find(col => col.id === destination.droppableId);
        
        if (sourceCol && destCol) {
          // Remove from source
          const [movedTask] = sourceCol.tasks.splice(source.index, 1);
          // Add to destination
          destCol.tasks.splice(destination.index, 0, movedTask);
          
          // Update positions
          sourceCol.tasks.forEach((t, index) => {
            t.position = index;
          });
          destCol.tasks.forEach((t, index) => {
            t.position = index;
          });
        }
        
        return newColumns;
      });

      // Then send to server
      socket.emit('move_task', {
        taskId: draggableId,
        sourceColumnId: source.droppableId,
        destinationColumnId: destination.droppableId,
        sourceIndex: source.index,
        destinationIndex: destination.index
      });
    }

    if (result.type === 'COLUMN') {
      // Optimistically update column order
      setColumns(prev => {
        const newColumnOrder = [...prev];
        const [reorderedColumn] = newColumnOrder.splice(source.index, 1);
        newColumnOrder.splice(destination.index, 0, reorderedColumn);
        return newColumnOrder;
      });

      socket.emit('reorder_columns', {
        columnOrder: columns.map(col => col.id)
      });
    }
  };

  const handleCreateColumn = (title: string) => {
    socket?.emit('create_column', { title, position: columns.length });
  };

  const handleUpdateColumn = (id: string, title: string) => {
    socket?.emit('update_column', { id, title });
  };

  const handleDeleteColumn = (id: string) => {
    socket?.emit('delete_column', { id });
  };

  const handleCreateTask = (columnId: string, title: string, description?: string, assignedTo?: string, dueDate?: string, priority?: 'low' | 'medium' | 'high') => {
    const column = columns.find(col => col.id === columnId);
    const position = column ? column.tasks.length : 0;
    socket?.emit('create_task', { 
      columnId, 
      title, 
      description, 
      position,
      assignedTo,
      dueDate,
      priority: priority || 'medium'
    });
  };

  const handleUpdateTask = (id: string, title: string, description?: string) => {
    socket?.emit('update_task', { id, title, description });
  };

  const handleUpdateTaskFull = (id: string, updates: Partial<Column>) => {
    socket?.emit('update_task', { id, ...updates });
  };

  const handleAddComment = (taskId: string, content: string) => {
    socket?.emit('add_comment', { taskId, content });
  };

  const handleDeleteComment = (commentId: string) => {
    socket?.emit('delete_comment', { commentId });
  };

  const handleDeleteTask = (id: string) => {
    socket?.emit('delete_task', { id });
  };

  if (loading) {
    return (
      <AppContainer>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            color: 'white',
            fontSize: '1.5rem'
          }}
        >
          Loading your collaborative task board...
        </div>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <Header>
        <Title>Collaborative Task Board</Title>
        <UserPresence users={users} />
      </Header>

      <DragDropContext onDragEnd={handleDragEnd}>
        <TaskBoard
          columns={columns}
          users={users}
          onCreateColumn={handleCreateColumn}
          onUpdateColumn={handleUpdateColumn}
          onDeleteColumn={handleDeleteColumn}
          onCreateTask={handleCreateTask}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          onUpdateTaskFull={handleUpdateTaskFull}
          onAddComment={handleAddComment}
          onDeleteComment={handleDeleteComment}
        />
      </DragDropContext>
    </AppContainer>
  );
};

export default App;
