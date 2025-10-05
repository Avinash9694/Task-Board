const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Load environment variables
require('dotenv').config();

// Suppress deprecation warnings
process.removeAllListeners('warning');

const app = express();
const server = http.createServer(app);

// Environment variables with defaults
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

const io = socketIo(server, {
  cors: {
    origin: ["https://task-board-seven-theta.vercel.app", "http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors({
  origin: ["https://task-board-seven-theta.vercel.app", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Task Board API Server', 
    status: 'running',
    socketIO: true 
  });
});

// Serve favicon.ico to prevent proxy errors
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// Initialize SQLite database
const db = new sqlite3.Database('./taskboard.db');

// Create tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS boards (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS columns (
    id TEXT PRIMARY KEY,
    board_id TEXT NOT NULL,
    title TEXT NOT NULL,
    position INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (board_id) REFERENCES boards (id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    column_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    position INTEGER NOT NULL,
    assigned_to TEXT,
    due_date TEXT,
    priority TEXT DEFAULT 'medium',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (column_id) REFERENCES columns (id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks (id)
  )`);

  // Create default board and columns if they don't exist
  db.get("SELECT COUNT(*) as count FROM boards", (err, row) => {
    if (err) {
      console.error(err);
    } else if (row.count === 0) {
      const boardId = uuidv4();
      db.run("INSERT INTO boards (id, name) VALUES (?, ?)", [boardId, "My Task Board"]);
      
      const defaultColumns = [
        { title: "To Do", position: 0 },
        { title: "In Progress", position: 1 },
        { title: "Done", position: 2 }
      ];
      
      defaultColumns.forEach((column, index) => {
        const columnId = uuidv4();
        db.run("INSERT INTO columns (id, board_id, title, position) VALUES (?, ?, ?, ?)", 
          [columnId, boardId, column.title, column.position]);
      });
    }
  });
});

// Store connected users
const connectedUsers = new Map();

// Generate user colors
const userColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];

let colorIndex = 0;

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Add user to connected users
  const userColor = userColors[colorIndex % userColors.length];
  colorIndex++;
  
  connectedUsers.set(socket.id, {
    id: socket.id,
    name: `User ${socket.id.substring(0, 6)}`,
    color: userColor,
    connectedAt: new Date(),
    isActive: true
  });

  // Broadcast updated user count
  io.emit('users_updated', Array.from(connectedUsers.values()));

  // Load initial board data
  socket.on('load_board', () => {
    loadBoardData(socket);
  });

  // Create new column
  socket.on('create_column', (data) => {
    const { title, position } = data;
    const columnId = uuidv4();
    
    db.run("INSERT INTO columns (id, board_id, title, position) VALUES (?, ?, ?, ?)", 
      [columnId, 'default', title, position], function(err) {
        if (err) {
          socket.emit('error', { message: 'Failed to create column' });
        } else {
          const newColumn = {
            id: columnId,
            title,
            position,
            tasks: []
          };
          io.emit('column_created', newColumn);
        }
      });
  });

  // Update column
  socket.on('update_column', (data) => {
    const { id, title } = data;
    
    db.run("UPDATE columns SET title = ? WHERE id = ?", [title, id], function(err) {
      if (err) {
        socket.emit('error', { message: 'Failed to update column' });
      } else {
        io.emit('column_updated', { id, title });
      }
    });
  });

  // Delete column
  socket.on('delete_column', (data) => {
    const { id } = data;
    
    db.run("DELETE FROM tasks WHERE column_id = ?", [id], function(err) {
      if (err) {
        socket.emit('error', { message: 'Failed to delete tasks' });
        return;
      }
      
      db.run("DELETE FROM columns WHERE id = ?", [id], function(err) {
        if (err) {
          socket.emit('error', { message: 'Failed to delete column' });
        } else {
          io.emit('column_deleted', { id });
        }
      });
    });
  });

  // Create new task
  socket.on('create_task', (data) => {
    const { columnId, title, description, position, assignedTo, dueDate, priority } = data;
    const taskId = uuidv4();
    
    db.run("INSERT INTO tasks (id, column_id, title, description, position, assigned_to, due_date, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))", 
      [taskId, columnId, title, description || '', position, assignedTo || null, dueDate || null, priority || 'medium'], function(err) {
        if (err) {
          socket.emit('error', { message: 'Failed to create task' });
        } else {
          const newTask = {
            id: taskId,
            title,
            description: description || '',
            position,
            assignedTo: assignedTo || null,
            dueDate: dueDate || null,
            priority: priority || 'medium',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            comments: []
          };
          io.emit('task_created', { columnId, task: newTask });
        }
      });
  });

  // Update task
  socket.on('update_task', (data) => {
    const { id, title, description, assignedTo, dueDate, priority } = data;
    
    db.run("UPDATE tasks SET title = ?, description = ?, assigned_to = ?, due_date = ?, priority = ?, updated_at = datetime('now') WHERE id = ?", 
      [title, description || '', assignedTo || null, dueDate || null, priority || 'medium', id], function(err) {
        if (err) {
          socket.emit('error', { message: 'Failed to update task' });
        } else {
          io.emit('task_updated', { id, title, description: description || '', assignedTo, dueDate, priority });
        }
      });
  });

  // Delete task
  socket.on('delete_task', (data) => {
    const { id } = data;
    
    db.run("DELETE FROM tasks WHERE id = ?", [id], function(err) {
      if (err) {
        socket.emit('error', { message: 'Failed to delete task' });
      } else {
        io.emit('task_deleted', { id });
      }
    });
  });

  // Move task
  socket.on('move_task', (data) => {
    const { taskId, sourceColumnId, destinationColumnId, sourceIndex, destinationIndex } = data;
    
    // Update task position and column
    db.run("UPDATE tasks SET column_id = ?, position = ? WHERE id = ?", 
      [destinationColumnId, destinationIndex, taskId], function(err) {
        if (err) {
          socket.emit('error', { message: 'Failed to move task' });
          return;
        }
        
        // Update positions of other tasks in source column
        db.all("SELECT id FROM tasks WHERE column_id = ? AND position > ? ORDER BY position", 
          [sourceColumnId, sourceIndex], (err, tasks) => {
            if (err) {
              socket.emit('error', { message: 'Failed to update source column' });
              return;
            }
            
            tasks.forEach((task, index) => {
              db.run("UPDATE tasks SET position = ? WHERE id = ?", 
                [sourceIndex + index, task.id]);
            });
          });
        
        // Update positions of other tasks in destination column
        db.all("SELECT id FROM tasks WHERE column_id = ? AND position >= ? AND id != ? ORDER BY position", 
          [destinationColumnId, destinationIndex, taskId], (err, tasks) => {
            if (err) {
              socket.emit('error', { message: 'Failed to update destination column' });
              return;
            }
            
            tasks.forEach((task, index) => {
              db.run("UPDATE tasks SET position = ? WHERE id = ?", 
                [destinationIndex + index + 1, task.id]);
            });
          });
        
        io.emit('task_moved', {
          taskId,
          sourceColumnId,
          destinationColumnId,
          sourceIndex,
          destinationIndex
        });
      });
  });

  // Reorder columns
  socket.on('reorder_columns', (data) => {
    const { columnOrder } = data;
    
    columnOrder.forEach((columnId, index) => {
      db.run("UPDATE columns SET position = ? WHERE id = ?", [index, columnId]);
    });
    
    io.emit('columns_reordered', { columnOrder });
  });

  // Add comment to task
  socket.on('add_comment', (data) => {
    const { taskId, content } = data;
    const commentId = uuidv4();
    const userId = socket.id;
    
    db.run("INSERT INTO comments (id, task_id, user_id, content, created_at, updated_at) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))", 
      [commentId, taskId, userId, content], function(err) {
        if (err) {
          socket.emit('error', { message: 'Failed to add comment' });
        } else {
          const user = connectedUsers.get(userId);
          const newComment = {
            id: commentId,
            taskId,
            userId,
            content,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            user: user ? { id: user.id, name: user.name, color: user.color } : null
          };
          io.emit('comment_added', { taskId, comment: newComment });
        }
      });
  });

  // Delete comment
  socket.on('delete_comment', (data) => {
    const { commentId } = data;
    
    db.run("DELETE FROM comments WHERE id = ?", [commentId], function(err) {
      if (err) {
        socket.emit('error', { message: 'Failed to delete comment' });
      } else {
        io.emit('comment_deleted', { commentId });
      }
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    connectedUsers.delete(socket.id);
    io.emit('users_updated', Array.from(connectedUsers.values()));
  });
});

// Load board data function
function loadBoardData(socket) {
  db.all(`
    SELECT c.id, c.title, c.position,
           t.id as task_id, t.title as task_title, t.description, t.position as task_position,
           t.assigned_to, t.due_date, t.priority,
           t.created_at as task_created_at, t.updated_at as task_updated_at
    FROM columns c
    LEFT JOIN tasks t ON c.id = t.column_id
    ORDER BY c.position, t.position
  `, (err, rows) => {
    if (err) {
      socket.emit('error', { message: 'Failed to load board data' });
      return;
    }
    
    const columns = {};
    
    rows.forEach(row => {
      if (!columns[row.id]) {
        columns[row.id] = {
          id: row.id,
          title: row.title,
          position: row.position,
          tasks: []
        };
      }
      
      if (row.task_id) {
        columns[row.id].tasks.push({
          id: row.task_id,
          title: row.task_title,
          description: row.description,
          position: row.task_position,
          assignedTo: row.assigned_to,
          dueDate: row.due_date,
          priority: row.priority || 'medium',
          createdAt: row.task_created_at,
          updatedAt: row.task_updated_at,
          comments: []
        });
      }
    });
    
    const boardData = {
      columns: Object.values(columns).sort((a, b) => a.position - b.position)
    };
    
    socket.emit('board_loaded', boardData);
  });
}

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
