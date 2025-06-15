import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from '@/layout/Layout';
import { TodoListPage } from '@/features/todos/pages/TodoListPage';
import { TodoDetailPage } from '@/features/todos/pages/TodoDetailPage';
import { ErrorTestPage } from '@/pages/ErrorTestPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/todos" replace />,
  },
  {
    path: '/todos',
    element: (
      <Layout>
        <TodoListPage />
      </Layout>
    ),
  },
  {
    path: '/todos/:id',
    element: (
      <Layout>
        <TodoDetailPage />
      </Layout>
    ),
  },
  {
    path: '/error-test',
    element: (
      <Layout>
        <ErrorTestPage />
      </Layout>
    ),
  },
  {
    path: '*',
    element: (
      <Layout>
        <NotFoundPage />
      </Layout>
    ),
  },
]);