export interface Task {
  id: string; // UUID
  title: string;
  description?: string;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
  position: number; // For backward compatibility with current implementation
  assignedTo?: string; // User ID
  dueDate?: string; // ISO date
  priority?: 'low' | 'medium' | 'high';
  comments?: Comment[];
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string; // UUID
  title: string; // Column name
  taskIds: string[]; // Ordered array of task IDs
  position: number; // For backward compatibility with current implementation
  tasks: Task[]; // For backward compatibility with current implementation
}

export interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  color: string;
  connectedAt: Date;
  lastSeen?: Date;
  isActive?: boolean;
}

export interface Board {
  id: string;
  name: string;
  columns: Column[];
}
