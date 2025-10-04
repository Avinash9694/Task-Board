import { useState, useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { Column, Task, User } from '../types';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const lastMoveRef = useRef<number>(0);

  useEffect(() => {
    const serverUrl = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';
    const newSocket = io(serverUrl);
    setSocket(newSocket);

    // Load initial board data
    newSocket.emit('load_board');

    // Listen for board data
    newSocket.on('board_loaded', (data: { columns: Column[] }) => {
      setColumns(data.columns);
      setLoading(false);
    });

    // Listen for column events
    newSocket.on('column_created', (column: Column) => {
      setColumns(prev => [...prev, column].sort((a, b) => a.position - b.position));
    });

    newSocket.on('column_updated', (data: { id: string; title: string }) => {
      setColumns(prev => prev.map(col => 
        col.id === data.id ? { ...col, title: data.title } : col
      ));
    });

    newSocket.on('column_deleted', (data: { id: string }) => {
      setColumns(prev => prev.filter(col => col.id !== data.id));
    });

    // Listen for task events
    newSocket.on('task_created', (data: { columnId: string; task: Task }) => {
      // Add a small delay to ensure React has time to render the new droppable
      setTimeout(() => {
        setColumns(prev => prev.map(col => 
          col.id === data.columnId 
            ? { 
                ...col, 
                tasks: [...col.tasks, {
                  ...data.task,
                  priority: (data.task.priority as 'low' | 'medium' | 'high' | undefined) || 'medium',
                  comments: data.task.comments || []
                }].sort((a, b) => a.position - b.position) 
              }
            : col
        ));
      }, 100);
    });

    newSocket.on('task_updated', (data: { id: string; title: string; description: string; assignedTo?: string; dueDate?: string; priority?: string }) => {
      setColumns(prev => prev.map(col => ({
        ...col,
        tasks: col.tasks.map(task => 
          task.id === data.id 
            ? { 
                ...task, 
                title: data.title, 
                description: data.description, 
                assignedTo: data.assignedTo, 
                dueDate: data.dueDate, 
                priority: (data.priority as 'low' | 'medium' | 'high' | undefined) || 'medium'
              }
            : task
        )
      })));
    });

    newSocket.on('task_deleted', (data: { id: string }) => {
      setColumns(prev => prev.map(col => ({
        ...col,
        tasks: col.tasks.filter(task => task.id !== data.id)
      })));
    });

    newSocket.on('task_moved', (data: {
      taskId: string;
      sourceColumnId: string;
      destinationColumnId: string;
      sourceIndex: number;
      destinationIndex: number;
    }) => {
      // Debounce rapid updates to prevent droppable issues
      const now = Date.now();
      lastMoveRef.current = now;
      
      setTimeout(() => {
        if (lastMoveRef.current === now) {
          // Apply server update (this handles moves from other users)
          setColumns(prev => {
            const newColumns = prev.map(col => ({ ...col, tasks: [...col.tasks] }));
            const sourceColumn = newColumns.find(col => col.id === data.sourceColumnId);
            const destColumn = newColumns.find(col => col.id === data.destinationColumnId);
            
            if (sourceColumn && destColumn) {
              // Find the task by ID (more reliable than index)
              const taskIndex = sourceColumn.tasks.findIndex(task => task.id === data.taskId);
              if (taskIndex !== -1) {
                const [movedTask] = sourceColumn.tasks.splice(taskIndex, 1);
                destColumn.tasks.splice(data.destinationIndex, 0, movedTask);
                
                // Update positions
                sourceColumn.tasks.forEach((t, index) => {
                  t.position = index;
                });
                destColumn.tasks.forEach((t, index) => {
                  t.position = index;
                });
              }
            }
            
            return newColumns;
          });
        }
      }, 50);
    });

    newSocket.on('columns_reordered', (data: { columnOrder: string[] }) => {
      setColumns(prev => {
        const columnMap = new Map(prev.map(col => [col.id, col]));
        return data.columnOrder.map(id => columnMap.get(id)).filter(Boolean) as Column[];
      });
    });

    // Listen for user events
    newSocket.on('users_updated', (updatedUsers: User[]) => {
      setUsers(updatedUsers);
    });

    newSocket.on('comment_added', (data: { taskId: string; comment: any }) => {
      setColumns(prev => prev.map(col => ({
        ...col,
        tasks: col.tasks.map(task => 
          task.id === data.taskId 
            ? { ...task, comments: [...(task.comments || []), data.comment] }
            : task
        )
      })));
    });

    newSocket.on('comment_deleted', (data: { commentId: string }) => {
      setColumns(prev => prev.map(col => ({
        ...col,
        tasks: col.tasks.map(task => ({
          ...task,
          comments: (task.comments || []).filter(comment => comment.id !== data.commentId)
        }))
      })));
    });

    newSocket.on('error', (error: { message: string }) => {
      console.error('Socket error:', error.message);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  return {
    socket,
    columns,
    setColumns,
    users,
    loading
  };
};