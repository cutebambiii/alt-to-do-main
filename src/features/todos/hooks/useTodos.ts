import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Todo, CreateTodoData, UpdateTodoData } from '../types';
import { localStorageUtils } from '@/lib/localStorage';
import { toast } from 'sonner';

export const useTodos = () => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['todos'],
    queryFn: async (): Promise<Todo[]> => {
      // Only get from localStorage, no API fallback
      const storedTodos = localStorageUtils.getTodos();
      return storedTodos || [];
    },
    staleTime: Infinity, // Never stale since it's localStorage only
  });
};

export const useTodoById = (id: number) => {
  return useQuery({
    queryKey: ['todo', id],
    queryFn: async (): Promise<Todo> => {
      // Only get from localStorage
      const storedTodos = localStorageUtils.getTodos();
      const storedTodo = storedTodos?.find(todo => todo.id === id);
      
      if (!storedTodo) {
        throw new Error('Todo not found');
      }
      
      return storedTodo;
    },
    enabled: !!id,
  });
};

export const useCreateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTodoData): Promise<Todo> => {
      const now = new Date().toISOString();
      const newTodo: Todo = {
        id: localStorageUtils.getNextId(),
        title: data.title,
        completed: false,
        userId: data.userId || 1,
        createdAt: now,
        updatedAt: now,
        dueDate: data.dueDate,
        priority: data.priority || 'medium',
        subtasks: [],
      };
      
      localStorageUtils.addTodo(newTodo);
      return newTodo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      toast.success('Todo created successfully!');
    },
    onError: () => {
      toast.error('Failed to create todo');
    },
  });
};

export const useUpdateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateTodoData): Promise<Todo> => {
      const storedTodos = localStorageUtils.getTodos() || [];
      const existingTodo = storedTodos.find(todo => todo.id === data.id);
      
      if (!existingTodo) {
        throw new Error('Todo not found');
      }
      
      const updatedTodo: Todo = {
        ...existingTodo,
        ...data,
        updatedAt: new Date().toISOString(),
      };
      
      localStorageUtils.updateTodo(updatedTodo);
      return updatedTodo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['todo'] });
      toast.success('Todo updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update todo');
    },
  });
};

export const useDeleteTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      localStorageUtils.deleteTodo(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      toast.success('Todo deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete todo');
    },
  });
};

export const useBulkUpdateTodos = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ids, updates }: { ids: number[], updates: Partial<Todo> }): Promise<void> => {
      const storedTodos = localStorageUtils.getTodos() || [];
      const now = new Date().toISOString();
      const updatedTodos = storedTodos.map(todo => 
        ids.includes(todo.id) ? { ...todo, ...updates, updatedAt: now } : todo
      );
      localStorageUtils.setTodos(updatedTodos);
    },
    onSuccess: (_, { ids, updates }) => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['todo'] });
      
      if (updates.completed !== undefined) {
        const action = updates.completed ? 'completed' : 'marked as pending';
        toast.success(`${ids.length} todo${ids.length > 1 ? 's' : ''} ${action}!`);
      }
    },
    onError: () => {
      toast.error('Failed to update todos');
    },
  });
};

export const useBulkDeleteTodos = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: number[]): Promise<void> => {
      const storedTodos = localStorageUtils.getTodos() || [];
      const filteredTodos = storedTodos.filter(todo => !ids.includes(todo.id));
      localStorageUtils.setTodos(filteredTodos);
    },
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      toast.success(`${ids.length} todo${ids.length > 1 ? 's' : ''} deleted successfully!`);
    },
    onError: () => {
      toast.error('Failed to delete todos');
    },
  });
};