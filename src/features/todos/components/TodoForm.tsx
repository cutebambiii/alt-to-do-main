import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogClose } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { TimePicker } from '@/components/ui/time-picker';
import { AlertCircle, Calendar as CalendarIcon, Flag } from 'lucide-react';
import { Todo, CreateTodoData } from '../types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const todoSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .trim(),
  completed: z.boolean().optional(),
  userId: z.number()
    .min(1, 'User ID must be at least 1')
    .max(999, 'User ID must be less than 1000')
    .optional(),
  dueDate: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
});

type TodoFormData = z.infer<typeof todoSchema>;

interface TodoFormProps {
  todo?: Todo;
  onSubmit: (data: CreateTodoData | Todo) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const TodoForm = ({ todo, onSubmit, onCancel, isLoading }: TodoFormProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    todo?.dueDate ? new Date(todo.dueDate) : undefined
  );
  const [selectedTime, setSelectedTime] = useState<string>(
    todo?.dueDate ? format(new Date(todo.dueDate), 'HH:mm') : '09:00'
  );
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TodoFormData>({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      title: todo?.title || '',
      completed: todo?.completed || false,
      userId: todo?.userId || 1,
      dueDate: todo?.dueDate || '',
      priority: todo?.priority || 'medium',
    },
  });

  const completed = watch('completed');
  const priority = watch('priority');

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    updateDueDate(date, selectedTime);
  };

  const handleTimeChange = (time: string) => {
    setSelectedTime(time);
    updateDueDate(selectedDate, time);
  };

  const updateDueDate = (date: Date | undefined, time: string) => {
    if (date && time) {
      const [hours, minutes] = time.split(':').map(Number);
      const dateTime = new Date(date);
      dateTime.setHours(hours, minutes, 0, 0);
      setValue('dueDate', dateTime.toISOString());
    } else if (date) {
      // If only date is selected, use the current time
      const dateTime = new Date(date);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      dateTime.setHours(hours, minutes, 0, 0);
      setValue('dueDate', dateTime.toISOString());
    } else {
      setValue('dueDate', '');
    }
  };

  const clearDateTime = () => {
    setSelectedDate(undefined);
    setSelectedTime('09:00');
    setValue('dueDate', '');
    setIsCalendarOpen(false);
  };

  const onFormSubmit = (data: TodoFormData) => {
    if (todo) {
      onSubmit({ 
        ...todo, 
        ...data,
        dueDate: data.dueDate || undefined,
      });
    } else {
      onSubmit({
        title: data.title,
        userId: data.userId || 1,
        dueDate: data.dueDate || undefined,
        priority: data.priority || 'medium',
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Title Field */}
      <div className={`form-field ${errors.title ? 'error' : ''}`}>
        <Label htmlFor="title" className="text-sm font-medium">
          Todo Title *
        </Label>
        <Input
          id="title"
          {...register('title')}
          placeholder="Enter a descriptive title for your todo..."
          aria-describedby={errors.title ? 'title-error' : 'title-help'}
          className={errors.title ? 'border-destructive focus:ring-destructive' : ''}
        />
        {errors.title ? (
          <p id="title-error" className="error-message" role="alert">
            <AlertCircle className="w-4 h-4" aria-hidden="true" />
            {errors.title.message}
          </p>
        ) : (
          <p id="title-help" className="text-xs text-muted-foreground">
            Keep it clear and concise (max 200 characters)
          </p>
        )}
      </div>

      {/* Priority Field */}
      <div className="form-field">
        <Label htmlFor="priority" className="text-sm font-medium">
          Priority
        </Label>
        <Select value={priority} onValueChange={(value) => setValue('priority', value as 'low' | 'medium' | 'high')}>
          <SelectTrigger id="priority" aria-describedby="priority-help">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-green-600" />
                <span>Low Priority</span>
              </div>
            </SelectItem>
            <SelectItem value="medium">
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-yellow-600" />
                <span>Medium Priority</span>
              </div>
            </SelectItem>
            <SelectItem value="high">
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-red-600" />
                <span>High Priority</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <p id="priority-help" className="text-xs text-muted-foreground">
          Set the importance level for this todo
        </p>
      </div>

      {/* Due Date & Time Field */}
      <div className="form-field">
        <Label className="text-sm font-medium">
          Due Date & Time
        </Label>
        <div className="space-y-3">
          {/* Date Selection */}
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-11",
                  !selectedDate && "text-muted-foreground"
                )}
                aria-describedby="dueDate-help"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                initialFocus
              />
              <div className="p-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearDateTime}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setIsCalendarOpen(false)}
                  >
                    Done
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Time Selection */}
          {selectedDate && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Time
              </Label>
              <TimePicker
                value={selectedTime}
                onChange={handleTimeChange}
                placeholder="Select time"
              />
              <p className="text-xs text-muted-foreground">
                Set the specific time for this deadline
              </p>
            </div>
          )}
        </div>
        
        <p id="dueDate-help" className="text-xs text-muted-foreground">
          Optional: Set a deadline with specific date and time for this todo
        </p>
      </div>

      {/* User ID Field */}
      <div className={`form-field ${errors.userId ? 'error' : ''}`}>
        <Label htmlFor="userId" className="text-sm font-medium">
          User ID *
        </Label>
        <Input
          id="userId"
          type="number"
          min="1"
          max="999"
          {...register('userId', { valueAsNumber: true })}
          placeholder="Enter user ID (1-999)..."
          aria-describedby={errors.userId ? 'userId-error' : 'userId-help'}
          className={errors.userId ? 'border-destructive focus:ring-destructive' : ''}
        />
        {errors.userId ? (
          <p id="userId-error" className="error-message" role="alert">
            <AlertCircle className="w-4 h-4" aria-hidden="true" />
            {errors.userId.message}
          </p>
        ) : (
          <p id="userId-help" className="text-xs text-muted-foreground">
            Assign this todo to a user (1-999)
          </p>
        )}
      </div>

      {/* Completion Status (only for editing) */}
      {todo && (
        <div className="form-field">
          <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
            <Checkbox
              id="completed"
              checked={completed}
              onCheckedChange={(checked) => setValue('completed', !!checked)}
              aria-describedby="completed-help"
            />
            <div className="space-y-1">
              <Label htmlFor="completed" className="text-sm font-medium cursor-pointer">
                Mark as completed
              </Label>
              <p id="completed-help" className="text-xs text-muted-foreground">
                Check this box if the todo has been finished
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t">
        <DialogClose asChild>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </DialogClose>
        <Button 
          type="submit" 
          disabled={isLoading}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              {todo ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            todo ? 'Update Todo' : 'Create Todo'
          )}
        </Button>
      </div>
    </form>
  );
};