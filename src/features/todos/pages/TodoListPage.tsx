import { useState, useMemo, useEffect } from 'react';
import { Plus, ListTodo, CheckCircle2, Clock, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TodoCard } from '../components/TodoCard';
import { TodoBoard } from '../components/TodoBoard';
import { TodoFiltersComponent } from '../components/TodoFilters';
import { TodoPagination } from '../components/TodoPagination';
import { TodoFormDialog } from '../components/TodoFormDialog';
import { DeleteConfirmDialog } from '../components/DeleteConfirmDialog';
import { BulkActionBar } from '../components/BulkActionBar';
import { BulkDeleteConfirmDialog } from '../components/BulkDeleteConfirmDialog';
import { ViewToggle, ViewMode } from '../components/ViewToggle';
import { useTodos, useCreateTodo, useUpdateTodo, useDeleteTodo, useBulkUpdateTodos, useBulkDeleteTodos } from '../hooks/useTodos';
import { Todo, TodoFilters, FilterStatus, CreateTodoData, PaginationState, BulkSelectionState, BulkAction } from '../types';

const ITEMS_PER_PAGE = 21;

export const TodoListPage = () => {
  const [filters, setFilters] = useState<TodoFilters>({
    search: '',
    status: 'all',
  });
  
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: ITEMS_PER_PAGE,
    total: 0,
  });

  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const [bulkSelection, setBulkSelection] = useState<BulkSelectionState>({
    selectedIds: new Set(),
    isAllSelected: false,
    isIndeterminate: false,
  });

  const [showBulkSelection, setShowBulkSelection] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [deletingTodo, setDeletingTodo] = useState<Todo | null>(null);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);

  const { data: todos = [], isLoading, error } = useTodos();
  const createTodoMutation = useCreateTodo();
  const updateTodoMutation = useUpdateTodo();
  const deleteTodoMutation = useDeleteTodo();
  const bulkUpdateMutation = useBulkUpdateTodos();
  const bulkDeleteMutation = useBulkDeleteTodos();

  // Listen for header button clicks
  useEffect(() => {
    const handleOpenCreateDialog = () => {
      setIsCreateDialogOpen(true);
    };

    window.addEventListener('openCreateDialog', handleOpenCreateDialog);
    return () => window.removeEventListener('openCreateDialog', handleOpenCreateDialog);
  }, []);

  // Filter and paginate todos
  const filteredTodos = useMemo(() => {
    let filtered = todos;

    // Apply search filter
    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(todo =>
        todo.title.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter only in list view
    if (viewMode === 'list' && filters.status !== 'all') {
      filtered = filtered.filter(todo => {
        if (filters.status === 'completed') return todo.completed;
        if (filters.status === 'incomplete') return !todo.completed;
        return true;
      });
    }

    return filtered;
  }, [todos, filters, viewMode]);

  const paginatedTodos = useMemo(() => {
    // In board view, show all filtered todos without pagination
    if (viewMode === 'board') {
      return filteredTodos;
    }
    
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    
    return filteredTodos.slice(startIndex, endIndex);
  }, [filteredTodos, pagination.page, pagination.limit, viewMode]);

  // Update bulk selection state based on current selection
  useEffect(() => {
    const visibleTodoIds = paginatedTodos.map(todo => todo.id);
    const selectedVisibleIds = visibleTodoIds.filter(id => bulkSelection.selectedIds.has(id));
    
    const isAllSelected = visibleTodoIds.length > 0 && selectedVisibleIds.length === visibleTodoIds.length;
    const isIndeterminate = selectedVisibleIds.length > 0 && selectedVisibleIds.length < visibleTodoIds.length;

    setBulkSelection(prev => ({
      ...prev,
      isAllSelected,
      isIndeterminate,
    }));
  }, [paginatedTodos, bulkSelection.selectedIds]);

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleCreateTodo = async (data: CreateTodoData) => {
    await createTodoMutation.mutateAsync(data);
    setIsCreateDialogOpen(false);
  };

  const handleEditTodo = async (data: Todo) => {
    await updateTodoMutation.mutateAsync(data);
    setEditingTodo(null);
  };

  const handleToggleComplete = async (todo: Todo) => {
    await updateTodoMutation.mutateAsync({
      ...todo,
      completed: !todo.completed,
    });
  };

  const handleUpdateTodo = async (todo: Todo) => {
    await updateTodoMutation.mutateAsync(todo);
  };

  const handleDeleteTodo = async () => {
    if (deletingTodo) {
      await deleteTodoMutation.mutateAsync(deletingTodo.id);
      setDeletingTodo(null);
    }
  };

  const handleSelectionChange = (id: number, selected: boolean) => {
    setBulkSelection(prev => {
      const newSelectedIds = new Set(prev.selectedIds);
      if (selected) {
        newSelectedIds.add(id);
      } else {
        newSelectedIds.delete(id);
      }
      return {
        ...prev,
        selectedIds: newSelectedIds,
      };
    });
  };

  const handleBulkSelectionChange = (selectAll: boolean) => {
    const visibleTodoIds = paginatedTodos.map(todo => todo.id);
    setBulkSelection(prev => {
      const newSelectedIds = new Set(prev.selectedIds);
      
      if (selectAll) {
        visibleTodoIds.forEach(id => newSelectedIds.add(id));
      } else {
        visibleTodoIds.forEach(id => newSelectedIds.delete(id));
      }
      
      return {
        ...prev,
        selectedIds: newSelectedIds,
      };
    });
  };

  const handleToggleBulkSelection = () => {
    setShowBulkSelection(prev => !prev);
    if (showBulkSelection) {
      // Clear selection when exiting bulk mode
      setBulkSelection({
        selectedIds: new Set(),
        isAllSelected: false,
        isIndeterminate: false,
      });
    }
  };

  const handleClearSelection = () => {
    setBulkSelection({
      selectedIds: new Set(),
      isAllSelected: false,
      isIndeterminate: false,
    });
  };

  const handleBulkAction = async (action: BulkAction) => {
    const selectedIds = Array.from(bulkSelection.selectedIds);
    
    if (selectedIds.length === 0) return;

    switch (action) {
      case 'complete':
        await bulkUpdateMutation.mutateAsync({
          ids: selectedIds,
          updates: { completed: true }
        });
        break;
      case 'incomplete':
        await bulkUpdateMutation.mutateAsync({
          ids: selectedIds,
          updates: { completed: false }
        });
        break;
      case 'delete':
        setIsBulkDeleteDialogOpen(true);
        return;
    }

    handleClearSelection();
  };

  const handleBulkDelete = async () => {
    const selectedIds = Array.from(bulkSelection.selectedIds);
    await bulkDeleteMutation.mutateAsync(selectedIds);
    setIsBulkDeleteDialogOpen(false);
    handleClearSelection();
  };

  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="empty-state">
          <div className="empty-state-icon">
            <Search className="w-16 h-16" />
          </div>
          <h2 className="empty-state-title">Failed to load todos</h2>
          <p className="empty-state-description">
            There was an error loading your todos. Please try again.
          </p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* View Toggle */}
      <div className="flex justify-center">
        <ViewToggle currentView={viewMode} onViewChange={setViewMode} />
      </div>

      {/* Filters */}
      <TodoFiltersComponent 
        filters={filters} 
        onFiltersChange={setFilters}
        bulkSelection={bulkSelection}
        onBulkSelectionChange={handleBulkSelectionChange}
        showBulkSelection={showBulkSelection}
        onToggleBulkSelection={handleToggleBulkSelection}
        totalVisibleTodos={paginatedTodos.length}
        viewMode={viewMode}
      />

      {/* Stats */}
      <div className="flex items-center justify-center flex-wrap gap-4 py-3">
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm px-3 py-1">
            <ListTodo className="w-4 h-4 mr-1" aria-hidden="true" />
            {totalCount} total
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="text-sm px-3 py-1 bg-green-100 text-green-800 border border-green-200">
            <CheckCircle2 className="w-4 h-4 mr-1" aria-hidden="true" />
            {completedCount} completed
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm px-3 py-1 bg-yellow-100 text-yellow-800 border border-yellow-200">
            <Clock className="w-4 h-4 mr-1" aria-hidden="true" />
            {totalCount - completedCount} pending
          </Badge>
        </div>
      </div>

      {/* Todo Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 21 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="h-40 w-full loading-shimmer" />
            </div>
          ))}
        </div>
      ) : paginatedTodos.length === 0 ? (
        <div className="empty-state">
          {filteredTodos.length === 0 && filters.search.trim() ? (
            <>
              <div className="empty-state-icon">
                <Search className="w-16 h-16" />
              </div>
              <h2 className="empty-state-title">No todos found</h2>
              <p className="empty-state-description">
                No todos match your search for "{filters.search}". Try adjusting your search terms.
              </p>
              <Button 
                variant="outline" 
                onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
              >
                Clear Search
              </Button>
            </>
          ) : filteredTodos.length === 0 && filters.status !== 'all' ? (
            <>
              <div className="empty-state-icon">
                <ListTodo className="w-16 h-16" />
              </div>
              <h2 className="empty-state-title">No {filters.status} todos</h2>
              <p className="empty-state-description">
                You don't have any {filters.status} todos yet.
              </p>
              <Button 
                variant="outline" 
                onClick={() => setFilters(prev => ({ ...prev, status: 'all' }))}
              >
                Show All Todos
              </Button>
            </>
          ) : filteredTodos.length === 0 ? (
            <>
              <div className="empty-state-icon">
                <ListTodo className="w-16 h-16" />
              </div>
              <h2 className="empty-state-title">No todos yet</h2>
              <p className="empty-state-description">
                Get started by creating your first todo. Stay organized and productive!
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                Create Your First Todo
              </Button>
            </>
          ) : (
            <>
              <div className="empty-state-icon">
                <ListTodo className="w-16 h-16" />
              </div>
              <h2 className="empty-state-title">No todos on this page</h2>
              <p className="empty-state-description">
                Try going to a different page or adjusting your filters.
              </p>
            </>
          )}
        </div>
      ) : viewMode === 'board' ? (
        <TodoBoard
          todos={paginatedTodos}
          onEdit={setEditingTodo}
          onDelete={(id) => setDeletingTodo(todos.find(t => t.id === id) || null)}
          onToggleComplete={handleToggleComplete}
          onUpdateTodo={handleUpdateTodo}
          onCreateTodo={() => setIsCreateDialogOpen(true)}
          bulkSelection={bulkSelection}
          onSelectionChange={handleSelectionChange}
          showBulkSelection={showBulkSelection}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedTodos.map((todo) => (
              <TodoCard
                key={todo.id}
                todo={todo}
                onEdit={setEditingTodo}
                onDelete={(id) => setDeletingTodo(todos.find(t => t.id === id) || null)}
                onToggleComplete={handleToggleComplete}
                isSelected={bulkSelection.selectedIds.has(todo.id)}
                onSelectionChange={handleSelectionChange}
                showSelection={showBulkSelection}
              />
            ))}
          </div>

          {/* Pagination - only show in list view */}
          <TodoPagination
            pagination={{
              ...pagination,
              total: filteredTodos.length
            }}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={bulkSelection.selectedIds.size}
        onBulkAction={handleBulkAction}
        onClearSelection={handleClearSelection}
        isLoading={bulkUpdateMutation.isPending || bulkDeleteMutation.isPending}
      />

      {/* Dialogs */}
      <TodoFormDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateTodo}
        isLoading={createTodoMutation.isPending}
      />

      <TodoFormDialog
        isOpen={!!editingTodo}
        onClose={() => setEditingTodo(null)}
        todo={editingTodo || undefined}
        onSubmit={handleEditTodo}
        isLoading={updateTodoMutation.isPending}
      />

      <DeleteConfirmDialog
        isOpen={!!deletingTodo}
        onClose={() => setDeletingTodo(null)}
        onConfirm={handleDeleteTodo}
        todoTitle={deletingTodo?.title}
        isLoading={deleteTodoMutation.isPending}
      />

      <BulkDeleteConfirmDialog
        isOpen={isBulkDeleteDialogOpen}
        onClose={() => setIsBulkDeleteDialogOpen(false)}
        onConfirm={handleBulkDelete}
        selectedCount={bulkSelection.selectedIds.size}
        isLoading={bulkDeleteMutation.isPending}
      />
    </div>
  );
};