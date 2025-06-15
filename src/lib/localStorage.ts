import { Todo } from '@/features/todos/types';

const TODOS_STORAGE_KEY = 'todos-app-data';

export const localStorageUtils = {
  getTodos(): Todo[] | null {
    try {
      const stored = localStorage.getItem(TODOS_STORAGE_KEY);
      if (!stored) return null;
      
      const todos = JSON.parse(stored);
      
      // Migrate old todos to new format
      return todos.map((todo: any) => ({
        ...todo,
        createdAt: todo.createdAt || new Date().toISOString(),
        updatedAt: todo.updatedAt || todo.createdAt || new Date().toISOString(),
        priority: todo.priority || 'medium',
        subtasks: todo.subtasks || [],
        // dueDate is optional, so we don't need to set a default
      }));
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },

  setTodos(todos: Todo[]): void {
    try {
      localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(todos));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },

  addTodo(todo: Todo): void {
    const todos = this.getTodos() || [];
    const newTodos = [...todos, todo];
    this.setTodos(newTodos);
  },

  updateTodo(updatedTodo: Todo): void {
    const todos = this.getTodos() || [];
    const newTodos = todos.map(todo => 
      todo.id === updatedTodo.id ? updatedTodo : todo
    );
    this.setTodos(newTodos);
  },

  deleteTodo(id: number): void {
    const todos = this.getTodos() || [];
    const newTodos = todos.filter(todo => todo.id !== id);
    this.setTodos(newTodos);
  },

  getNextId(): number {
    const todos = this.getTodos() || [];
    return todos.length > 0 ? Math.max(...todos.map(t => t.id)) + 1 : 1;
  },
};