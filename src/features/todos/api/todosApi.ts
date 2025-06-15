import axios from 'axios';
import { Todo, CreateTodoData, UpdateTodoData } from '../types';

const API_BASE_URL = 'https://jsonplaceholder.typicode.com';

export const todosApi = {
  async fetchTodos(): Promise<Todo[]> {
    const response = await axios.get<Todo[]>(`${API_BASE_URL}/todos`);
    return response.data;
  },

  async fetchTodoById(id: number): Promise<Todo> {
    const response = await axios.get<Todo>(`${API_BASE_URL}/todos/${id}`);
    return response.data;
  },

  async createTodo(data: CreateTodoData): Promise<Todo> {
    const response = await axios.post<Todo>(`${API_BASE_URL}/todos`, {
      ...data,
      completed: false,
      userId: data.userId || 1,
    });
    return response.data;
  },

  async updateTodo(data: UpdateTodoData): Promise<Todo> {
    const response = await axios.put<Todo>(`${API_BASE_URL}/todos/${data.id}`, data);
    return response.data;
  },

  async deleteTodo(id: number): Promise<void> {
    await axios.delete(`${API_BASE_URL}/todos/${id}`);
  },
};