import { Todo } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, Edit, Trash2, Clock, Calendar, AlertTriangle, Flag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { format, isAfter, isBefore, isToday, parseISO } from 'date-fns';

interface TodoCardProps {
  todo: Todo;
  onEdit: (todo: Todo) => void;
  onDelete: (id: number) => void;
  onToggleComplete: (todo: Todo) => void;
  isSelected?: boolean;
  onSelectionChange?: (id: number, selected: boolean) => void;
  showSelection?: boolean;
}

export const TodoCard = ({ 
  todo, 
  onEdit, 
  onDelete, 
  onToggleComplete,
  isSelected = false,
  onSelectionChange,
  showSelection = false
}: TodoCardProps) => {
  const handleSelectionChange = (checked: boolean) => {
    onSelectionChange?.(todo.id, checked);
  };

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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Flag className="w-3 h-3 mr-1" />;
      case 'medium':
        return <Flag className="w-3 h-3 mr-1" />;
      case 'low':
        return <Flag className="w-3 h-3 mr-1" />;
      default:
        return <Flag className="w-3 h-3 mr-1" />;
    }
  };

  return (
    <Card className={cn(
      "todo-card group h-full transition-all duration-200",
      isSelected && "ring-2 ring-primary ring-offset-2 bg-primary/5",
      isOverdue && !todo.completed && "border-red-200 bg-red-50/50"
    )}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          {/* Bulk Selection Checkbox */}
          {showSelection && (
            <div className="flex-shrink-0 pt-1">
              <Checkbox
                checked={isSelected}
                onCheckedChange={handleSelectionChange}
                className="w-5 h-5"
                aria-label={`Select "${todo.title}" for bulk actions`}
              />
            </div>
          )}

          {/* Completion Checkbox */}
          <div className="flex-shrink-0 pt-1">
            <Checkbox
              checked={todo.completed}
              onCheckedChange={() => onToggleComplete(todo)}
              className="w-5 h-5"
              aria-label={`Mark "${todo.title}" as ${todo.completed ? 'incomplete' : 'complete'}`}
            />
          </div>
          
          <div className="flex-1 min-w-0 space-y-3">
            {/* Title with Overdue Indicator */}
            <div className="flex items-start gap-2">
              <h3 className={cn(
                "text-base font-semibold leading-6 transition-colors group-hover:text-primary flex-1",
                todo.completed && "line-through text-muted-foreground"
              )}>
                {todo.title}
              </h3>
              {isOverdue && (
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" aria-label="Overdue" />
              )}
            </div>
            
            {/* Priority and Status Badges */}
            <div className="flex items-center flex-wrap gap-2">
              <Badge 
                variant="outline" 
                className={cn("text-xs font-medium", getPriorityColor(todo.priority))}
              >
                {getPriorityIcon(todo.priority)}
                {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
              </Badge>
              
              <Badge 
                variant={todo.completed ? "secondary" : "default"} 
                className={cn(
                  "text-xs font-medium",
                  todo.completed 
                    ? "bg-green-100 text-green-800 border border-green-200" 
                    : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                )}
              >
                {todo.completed ? (
                  <>
                    <Clock className="w-3 h-3 mr-1" aria-hidden="true" />
                    Completed
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3 mr-1" aria-hidden="true" />
                    Pending
                  </>
                )}
              </Badge>

              {/* Due Date Badge */}
              {todo.dueDate && (
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs font-medium",
                    isOverdue && !todo.completed && "bg-red-100 text-red-800 border-red-200",
                    isDueToday && !todo.completed && "bg-orange-100 text-orange-800 border-orange-200",
                    isDueSoon && "bg-blue-100 text-blue-800 border-blue-200",
                    todo.completed && "bg-gray-100 text-gray-600 border-gray-200"
                  )}
                >
                  <Calendar className="w-3 h-3 mr-1" aria-hidden="true" />
                  {isOverdue && !todo.completed ? 'Overdue' : 
                   isDueToday ? 'Due Today' : 
                   format(parseISO(todo.dueDate), 'MMM d')}
                </Badge>
              )}
            </div>

            {/* Timestamps */}
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Created: {format(parseISO(todo.createdAt), 'MMM d, yyyy \'at\' h:mm a')}</div>
              {todo.updatedAt !== todo.createdAt && (
                <div>Updated: {format(parseISO(todo.updatedAt), 'MMM d, yyyy \'at\' h:mm a')}</div>
              )}
            </div>
            
            {/* Actions */}
            <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
              >
                <Link 
                  to={`/todos/${todo.id}`} 
                  aria-label={`View details for "${todo.title}"`}
                >
                  <Eye className="w-4 h-4" aria-hidden="true" />
                </Link>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-amber-50 hover:text-amber-600"
                onClick={() => onEdit(todo)}
                aria-label={`Edit "${todo.title}"`}
              >
                <Edit className="w-4 h-4" aria-hidden="true" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                onClick={() => onDelete(todo.id)}
                aria-label={`Delete "${todo.title}"`}
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};