import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Calendar, CheckCircle2, Clock, Hash, Flag, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useTodoById, useUpdateTodo, useDeleteTodo } from '../hooks/useTodos';
import { useState } from 'react';
import { TodoFormDialog } from '../components/TodoFormDialog';
import { DeleteConfirmDialog } from '../components/DeleteConfirmDialog';
import { SubtaskList } from '../components/SubtaskList';
import { Todo, Subtask } from '../types';
import { format, isAfter, isBefore, isToday, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

export const TodoDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const todoId = id ? parseInt(id, 10) : 0;
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: todo, isLoading, error } = useTodoById(todoId);
  const updateTodoMutation = useUpdateTodo();
  const deleteTodoMutation = useDeleteTodo();

  const handleEditTodo = async (data: Todo) => {
    await updateTodoMutation.mutateAsync(data);
    setIsEditDialogOpen(false);
  };

  const handleDeleteTodo = async () => {
    if (todo) {
      await deleteTodoMutation.mutateAsync(todo.id);
      navigate('/todos');
    }
  };

  const handleSubtasksChange = async (subtasks: Subtask[]) => {
    if (todo) {
      await updateTodoMutation.mutateAsync({
        ...todo,
        subtasks,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center space-x-4 mb-8">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !todo) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="empty-state">
          <div className="empty-state-icon">
            <Hash className="w-16 h-16" />
          </div>
          <h1 className="empty-state-title">Todo Not Found</h1>
          <p className="empty-state-description">
            The todo you're looking for doesn't exist or has been deleted.
          </p>
          <Button asChild>
            <Link to="/todos">
              <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
              Back to Todos
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const isOverdue = todo.dueDate && !todo.completed && isBefore(parseISO(todo.dueDate), new Date());
  const isDueToday = todo.dueDate && isToday(parseISO(todo.dueDate));
  const isDueSoon = todo.dueDate && !todo.completed && isAfter(parseISO(todo.dueDate), new Date()) && !isDueToday;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm" aria-label="Breadcrumb">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/todos" className="flex items-center hover:bg-blue-50">
            <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
            Back to Todos
          </Link>
        </Button>
        <span className="text-muted-foreground">/</span>
        <span className="font-medium">Todo #{todo.id}</span>
      </nav>

      {/* Header */}
      <div className="text-center space-y-4">
        <div className={cn(
          "inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg",
          isOverdue ? "bg-gradient-to-br from-red-600 to-red-700" : "bg-gradient-to-br from-blue-600 to-indigo-600"
        )}>
          {isOverdue ? (
            <AlertTriangle className="w-8 h-8 text-white" aria-hidden="true" />
          ) : todo.completed ? (
            <CheckCircle2 className="w-8 h-8 text-white" aria-hidden="true" />
          ) : (
            <Clock className="w-8 h-8 text-white" aria-hidden="true" />
          )}
        </div>
        
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Todo Details
          </h1>
          <p className="text-muted-foreground">
            Detailed view of todo #{todo.id}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Todo Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card className={cn(
            "shadow-lg",
            isOverdue && !todo.completed && "border-red-200 bg-red-50/30"
          )}>
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CardTitle className="text-2xl leading-tight flex-1">
                      {todo.title}
                    </CardTitle>
                    {isOverdue && (
                      <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" aria-label="Overdue" />
                    )}
                  </div>
                  <div className="flex items-center flex-wrap gap-3">
                    {/* Priority Badge */}
                    <Badge 
                      variant="outline" 
                      className={cn("text-sm px-3 py-1", getPriorityColor(todo.priority))}
                    >
                      <Flag className="w-4 h-4 mr-1" aria-hidden="true" />
                      {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)} Priority
                    </Badge>

                    {/* Status Badge */}
                    <Badge 
                      variant={todo.completed ? "default" : "secondary"}
                      className={cn(
                        "text-sm px-3 py-1",
                        todo.completed 
                          ? "bg-green-100 text-green-800 border border-green-200" 
                          : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                      )}
                    >
                      {todo.completed ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-1" aria-hidden="true" />
                          Completed
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4 mr-1" aria-hidden="true" />
                          Pending
                        </>
                      )}
                    </Badge>

                    {/* Due Date Badge */}
                    {todo.dueDate && (
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-sm px-3 py-1",
                          isOverdue && !todo.completed && "bg-red-100 text-red-800 border-red-200",
                          isDueToday && !todo.completed && "bg-orange-100 text-orange-800 border-orange-200",
                          isDueSoon && "bg-blue-100 text-blue-800 border-blue-200",
                          todo.completed && "bg-gray-100 text-gray-600 border-gray-200"
                        )}
                      >
                        <Calendar className="w-4 h-4 mr-1" aria-hidden="true" />
                        {isOverdue && !todo.completed ? 'Overdue' : 
                         isDueToday ? 'Due Today' : 
                         `Due ${format(parseISO(todo.dueDate), 'MMM d, yyyy')}`}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditDialogOpen(true)}
                    className="hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200"
                  >
                    <Edit className="w-4 h-4 mr-2" aria-hidden="true" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                  >
                    <Trash2 className="w-4 h-4 mr-2" aria-hidden="true" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Full Description */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-foreground leading-relaxed">
                    {todo.title}
                  </p>
                </div>
              </div>

              {/* Timestamps */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">Timeline</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <span className="font-medium">Created:</span>
                    <span>{format(parseISO(todo.createdAt), 'MMM d, yyyy \'at\' h:mm a')}</span>
                  </div>
                  {todo.updatedAt !== todo.createdAt && (
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <span className="font-medium">Last Updated:</span>
                      <span>{format(parseISO(todo.updatedAt), 'MMM d, yyyy \'at\' h:mm a')}</span>
                    </div>
                  )}
                  {todo.dueDate && (
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <span className="font-medium">Due Date:</span>
                      <span className={cn(
                        isOverdue && !todo.completed && "text-red-600 font-semibold",
                        isDueToday && !todo.completed && "text-orange-600 font-semibold"
                      )}>
                        {format(parseISO(todo.dueDate), 'MMM d, yyyy \'at\' h:mm a')}
                        {isOverdue && !todo.completed && " (Overdue)"}
                        {isDueToday && !todo.completed && " (Due Today)"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subtasks */}
          <SubtaskList
            subtasks={todo.subtasks || []}
            onSubtasksChange={handleSubtasksChange}
            isLoading={updateTodoMutation.isPending}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <div className="flex items-center space-x-2">
                  <Hash className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  <span className="text-sm font-medium">Todo ID</span>
                </div>
                <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                  {todo.id}
                </span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-border">
                <div className="flex items-center space-x-2">
                  <Flag className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  <span className="text-sm font-medium">Priority</span>
                </div>
                <Badge variant="outline" className={cn("text-xs", getPriorityColor(todo.priority))}>
                  {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-border">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  <span className="text-sm font-medium">Status</span>
                </div>
                <span className={cn(
                  "text-sm",
                  todo.completed && "text-green-600",
                  !todo.completed && isOverdue && "text-red-600",
                  !todo.completed && !isOverdue && "text-yellow-600"
                )}>
                  {todo.completed ? 'Completed' : 
                   isOverdue ? 'Overdue' : 
                   'In Progress'}
                </span>
              </div>

              {/* Subtasks Progress */}
              {todo.subtasks && todo.subtasks.length > 0 && (
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                    <span className="text-sm font-medium">Subtasks</span>
                  </div>
                  <span className="text-sm">
                    {todo.subtasks.filter(s => s.completed).length}/{todo.subtasks.length}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <TodoFormDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        todo={todo}
        onSubmit={handleEditTodo}
        isLoading={updateTodoMutation.isPending}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteTodo}
        todoTitle={todo.title}
        isLoading={deleteTodoMutation.isPending}
      />
    </div>
  );
};