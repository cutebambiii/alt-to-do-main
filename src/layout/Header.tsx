import { CheckSquare, Plus } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const Header = () => {
  const location = useLocation();
  const isOnTodosPage = location.pathname === '/todos';

  return (
    <header 
      className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm"
      role="banner"
    >
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          <Link 
            to="/todos" 
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md p-1"
            aria-label="TodoApp - Go to home page"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <CheckSquare className="w-6 h-6 text-white" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                TodoApp
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Modern task management
              </p>
            </div>
          </Link>

          {/* Navigation */}
          <nav role="navigation" aria-label="Main navigation">
            <div className="flex items-center space-x-4">
              {isOnTodosPage && (
                <Button 
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md"
                  onClick={() => {
                    // This will be handled by the TodoListPage component
                    const event = new CustomEvent('openCreateDialog');
                    window.dispatchEvent(event);
                  }}
                  aria-label="Create new todo"
                >
                  <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                  <span className="hidden sm:inline">Add Todo</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};