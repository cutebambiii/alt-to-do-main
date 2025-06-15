import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TodoForm } from './TodoForm';
import { Todo, CreateTodoData } from '../types';

interface TodoFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  todo?: Todo;
  onSubmit: (data: CreateTodoData | Todo) => void;
  isLoading?: boolean;
}

export const TodoFormDialog = ({ 
  isOpen, 
  onClose, 
  todo, 
  onSubmit, 
  isLoading 
}: TodoFormDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {todo ? 'Edit Todo' : 'Create New Todo'}
          </DialogTitle>
          <DialogDescription>
            {todo 
              ? 'Make changes to your todo item here.' 
              : 'Add a new todo item to your list.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <TodoForm
          todo={todo}
          onSubmit={onSubmit}
          onCancel={onClose}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
};