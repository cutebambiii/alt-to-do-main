import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  UniqueIdentifier,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, Edit, Trash2, Clock, Calendar, AlertTriangle, Flag, Plus, GripVertical } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { format, isAfter, isBefore, isToday, parseISO } from 'date-fns';
import { Todo, BulkSelectionState } from '../types';

interface TodoBoardProps {
  todos: Todo[];
  onEdit: (todo: Todo) => void;
  onDelete: (id: number) => void;
  onToggleComplete: (todo: Todo) => void;
  onCreateTodo: () => void;
  onUpdateTodo: (todo: Todo) => void;
  bulkSelection: BulkSelectionState;
  onSelectionChange: (id: number, selected: boolean) => void;
  showBulkSelection: boolean;
}

interface BoardColumnProps {
  id: string;
  title: string;
  todos: Todo[];
  status: 'not-started' | 'pending' | 'completed';
  onEdit: (todo: Todo) => void;
  onDelete: (id: number) => void;
  onToggleComplete: (todo: Todo) => void;
  onCreateTodo?: () => void;
  bulkSelection: BulkSelectionState;
  onSelectionChange: (id: number, selected: boolean) => void;
  showBulkSelection: boolean;
}

interface DraggableTodoCardProps {
  todo: Todo;
  onEdit: (todo: Todo) => void;
  onDelete: (id: number) => void;
  onToggleComplete: (todo: Todo) => void;
  isSelected: boolean;
  onSelectionChange: (id: number, selected: boolean) => void;
  showBulkSelection: boolean;
  isDragging?: boolean;
}

const DraggableTodoCard = ({ 
  todo, 
  onEdit, 
  onDelete, 
  onToggleComplete,
  isSelected,
  onSelectionChange,
  showBulkSelection,
  isDragging = false
}: DraggableTodoCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: todo.id,
    data: {
      type: 'todo',
      todo,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isOverdue = todo.dueDate && !todo.completed && isBefore(parseISO(todo.dueDate), new Date());
  const isDueToday = todo.dueDate && isToday(parseISO(todo.dueDate));

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

  const cardContent = (
    <Card className={cn(
      "group cursor-pointer transition-all duration-200 hover:shadow-md",
      isSelected && "ring-2 ring-primary ring-offset-2 bg-primary/5",
      isOverdue && !todo.completed && "border-red-200 bg-red-50/50",
      (isDragging || isSortableDragging) && "opacity-50 rotate-3 scale-105 shadow-lg z-50"
    )}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header with drag handle, selection and title */}
          <div className="flex items-start gap-3">
            <div 
              {...attributes} 
              {...listeners}
              className="flex-shrink-0 mt-1 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <GripVertical className="w-4 h-4 text-muted-foreground" />
            </div>

            {showBulkSelection && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => onSelectionChange(todo.id, !!checked)}
                className="w-4 h-4 mt-1"
                aria-label={`Select "${todo.title}" for bulk actions`}
              />
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2">
                <h3 className={cn(
                  "text-sm font-semibold leading-5 flex-1",
                  todo.completed && "line-through text-muted-foreground"
                )}>
                  {todo.title}
                </h3>
                {isOverdue && (
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" aria-label="Overdue" />
                )}
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="flex items-center flex-wrap gap-1.5">
            <Badge 
              variant="outline" 
              className={cn("text-xs", getPriorityColor(todo.priority))}
            >
              <Flag className="w-3 h-3 mr-1" />
              {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
            </Badge>

            {todo.dueDate && (
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs",
                  isOverdue && !todo.completed && "bg-red-100 text-red-800 border-red-200",
                  isDueToday && !todo.completed && "bg-orange-100 text-orange-800 border-orange-200",
                  !isOverdue && !isDueToday && "bg-blue-100 text-blue-800 border-blue-200",
                  todo.completed && "bg-gray-100 text-gray-600 border-gray-200"
                )}
              >
                <Calendar className="w-3 h-3 mr-1" />
                {isOverdue && !todo.completed ? 'Overdue' : 
                 isDueToday ? 'Today' : 
                 format(parseISO(todo.dueDate), 'MMM d')}
              </Badge>
            )}
          </div>

          {/* Timestamps */}
          <div className="text-xs text-muted-foreground">
            <div>Created: {format(parseISO(todo.createdAt), 'MMM d, h:mm a')}</div>
            {todo.updatedAt !== todo.createdAt && (
              <div>Updated: {format(parseISO(todo.updatedAt), 'MMM d, h:mm a')}</div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <Checkbox
              checked={todo.completed}
              onCheckedChange={() => onToggleComplete(todo)}
              className="w-4 h-4"
              aria-label={`Mark "${todo.title}" as ${todo.completed ? 'incomplete' : 'complete'}`}
            />
            
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 hover:bg-blue-50 hover:text-blue-600"
              >
                <Link to={`/todos/${todo.id}`} aria-label={`View details for "${todo.title}"`}>
                  <Eye className="w-3.5 h-3.5" />
                </Link>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 hover:bg-amber-50 hover:text-amber-600"
                onClick={() => onEdit(todo)}
                aria-label={`Edit "${todo.title}"`}
              >
                <Edit className="w-3.5 h-3.5" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600"
                onClick={() => onDelete(todo.id)}
                aria-label={`Delete "${todo.title}"`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div ref={setNodeRef} style={style}>
      {cardContent}
    </div>
  );
};

const BoardColumn = ({ 
  id,
  title, 
  todos, 
  status, 
  onEdit, 
  onDelete, 
  onToggleComplete,
  onCreateTodo,
  bulkSelection,
  onSelectionChange,
  showBulkSelection
}: BoardColumnProps) => {
  const getColumnColor = () => {
    switch (status) {
      case 'not-started':
        return 'border-gray-200 bg-gray-50/50';
      case 'pending':
        return 'border-yellow-200 bg-yellow-50/50';
      case 'completed':
        return 'border-green-200 bg-green-50/50';
      default:
        return 'border-gray-200 bg-gray-50/50';
    }
  };

  const getHeaderColor = () => {
    switch (status) {
      case 'not-started':
        return 'text-gray-700';
      case 'pending':
        return 'text-yellow-700';
      case 'completed':
        return 'text-green-700';
      default:
        return 'text-gray-700';
    }
  };

  return (
    <div className={cn("flex flex-col h-full border-2 rounded-lg", getColumnColor())}>
      <div className="p-4 border-b border-current/20">
        <div className="flex items-center justify-between">
          <h2 className={cn("text-lg font-semibold", getHeaderColor())}>
            {title}
          </h2>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {todos.length}
            </Badge>
            {status === 'not-started' && onCreateTodo && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onCreateTodo}
                className="h-7 w-7 p-0 hover:bg-primary/10"
                aria-label="Add new todo"
              >
                <Plus className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <SortableContext items={todos.map(todo => todo.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[calc(100vh-300px)] min-h-[200px]">
          {todos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No todos in this category</p>
              <p className="text-xs mt-1">Drag todos here to change their status</p>
            </div>
          ) : (
            todos.map((todo) => (
              <DraggableTodoCard
                key={todo.id}
                todo={todo}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleComplete={onToggleComplete}
                isSelected={bulkSelection.selectedIds.has(todo.id)}
                onSelectionChange={onSelectionChange}
                showBulkSelection={showBulkSelection}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
};

export const TodoBoard = ({ 
  todos, 
  onEdit, 
  onDelete, 
  onToggleComplete,
  onCreateTodo,
  onUpdateTodo,
  bulkSelection,
  onSelectionChange,
  showBulkSelection
}: TodoBoardProps) => {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [draggedTodo, setDraggedTodo] = useState<Todo | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Categorize todos
  const notStartedTodos = todos.filter(todo => 
    !todo.completed && (!todo.updatedAt || todo.updatedAt === todo.createdAt)
  );
  const pendingTodos = todos.filter(todo => 
    !todo.completed && todo.updatedAt !== todo.createdAt
  );
  const completedTodos = todos.filter(todo => todo.completed);

  const columns = [
    { id: 'not-started', title: 'Not Started', todos: notStartedTodos, status: 'not-started' as const },
    { id: 'pending', title: 'In Progress', todos: pendingTodos, status: 'pending' as const },
    { id: 'completed', title: 'Completed', todos: completedTodos, status: 'completed' as const },
  ];

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id);
    
    const todo = todos.find(t => t.id === active.id);
    if (todo) {
      setDraggedTodo(todo);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeId = active.id;
    const overId = over.id;
    
    if (activeId === overId) return;
    
    // Handle dropping over a column
    const overColumn = columns.find(col => col.id === overId);
    if (overColumn) {
      const todo = todos.find(t => t.id === activeId);
      if (!todo) return;
      
      // Update todo status based on column
      let updates: Partial<Todo> = {};
      
      switch (overColumn.id) {
        case 'not-started':
          updates = { 
            completed: false,
            // Reset updatedAt to createdAt to mark as "not started"
            updatedAt: todo.createdAt
          };
          break;
        case 'pending':
          updates = { 
            completed: false,
            updatedAt: new Date().toISOString()
          };
          break;
        case 'completed':
          updates = { 
            completed: true,
            updatedAt: new Date().toISOString()
          };
          break;
      }
      
      onUpdateTodo({ ...todo, ...updates });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);
    setDraggedTodo(null);
    
    if (!over) return;
    
    const activeId = active.id;
    const overId = over.id;
    
    if (activeId === overId) return;
    
    // Handle dropping over a column (if not already handled in dragOver)
    const overColumn = columns.find(col => col.id === overId);
    if (overColumn) {
      const todo = todos.find(t => t.id === activeId);
      if (!todo) return;
      
      // Update todo status based on column
      let updates: Partial<Todo> = {};
      
      switch (overColumn.id) {
        case 'not-started':
          updates = { 
            completed: false,
            // Reset updatedAt to createdAt to mark as "not started"
            updatedAt: todo.createdAt
          };
          break;
        case 'pending':
          updates = { 
            completed: false,
            updatedAt: new Date().toISOString()
          };
          break;
        case 'completed':
          updates = { 
            completed: true,
            updatedAt: new Date().toISOString()
          };
          break;
      }
      
      onUpdateTodo({ ...todo, ...updates });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {columns.map((column) => (
          <BoardColumn
            key={column.id}
            id={column.id}
            title={column.title}
            todos={column.todos}
            status={column.status}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleComplete={onToggleComplete}
            onCreateTodo={column.id === 'not-started' ? onCreateTodo : undefined}
            bulkSelection={bulkSelection}
            onSelectionChange={onSelectionChange}
            showBulkSelection={showBulkSelection}
          />
        ))}
      </div>

      <DragOverlay>
        {activeId && draggedTodo ? (
          <DraggableTodoCard
            todo={draggedTodo}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleComplete={onToggleComplete}
            isSelected={bulkSelection.selectedIds.has(draggedTodo.id)}
            onSelectionChange={onSelectionChange}
            showBulkSelection={showBulkSelection}
            isDragging={true}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};