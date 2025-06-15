export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  userId: number;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  subtasks?: Subtask[];
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoData {
  title: string;
  userId?: number;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface UpdateTodoData {
  id: number;
  title?: string;
  completed?: boolean;
  userId?: number;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  updatedAt?: string;
  subtasks?: Subtask[];
}

export type FilterStatus = 'all' | 'completed' | 'incomplete';

export interface TodoFilters {
  search: string;
  status: FilterStatus;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
}

export interface BulkSelectionState {
  selectedIds: Set<number>;
  isAllSelected: boolean;
  isIndeterminate: boolean;
}

export type BulkAction = 'complete' | 'incomplete' | 'delete';