import { useState } from 'react';
import { Plus, Check, X, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Subtask } from '../types';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

interface SubtaskListProps {
  subtasks: Subtask[];
  onSubtasksChange: (subtasks: Subtask[]) => void;
  isLoading?: boolean;
}

export const SubtaskList = ({ subtasks, onSubtasksChange, isLoading }: SubtaskListProps) => {
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const completedCount = subtasks.filter(subtask => subtask.completed).length;
  const totalCount = subtasks.length;

  const generateSubtaskId = () => {
    return `subtask_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      const now = new Date().toISOString();
      const newSubtask: Subtask = {
        id: generateSubtaskId(),
        title: newSubtaskTitle.trim(),
        completed: false,
        createdAt: now,
        updatedAt: now,
      };
      
      onSubtasksChange([...subtasks, newSubtask]);
      setNewSubtaskTitle('');
      setIsAddingSubtask(false);
    }
  };

  const handleToggleSubtask = (subtaskId: string) => {
    const updatedSubtasks = subtasks.map(subtask =>
      subtask.id === subtaskId
        ? { ...subtask, completed: !subtask.completed, updatedAt: new Date().toISOString() }
        : subtask
    );
    onSubtasksChange(updatedSubtasks);
  };

  const handleEditSubtask = (subtaskId: string, newTitle: string) => {
    if (newTitle.trim()) {
      const updatedSubtasks = subtasks.map(subtask =>
        subtask.id === subtaskId
          ? { ...subtask, title: newTitle.trim(), updatedAt: new Date().toISOString() }
          : subtask
      );
      onSubtasksChange(updatedSubtasks);
    }
    setEditingSubtaskId(null);
    setEditingTitle('');
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    const updatedSubtasks = subtasks.filter(subtask => subtask.id !== subtaskId);
    onSubtasksChange(updatedSubtasks);
  };

  const startEditing = (subtask: Subtask) => {
    setEditingSubtaskId(subtask.id);
    setEditingTitle(subtask.title);
  };

  const cancelEditing = () => {
    setEditingSubtaskId(null);
    setEditingTitle('');
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            Subtasks
            {totalCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {completedCount}/{totalCount}
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingSubtask(true)}
            disabled={isLoading || isAddingSubtask}
            className="hover:bg-primary/10"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Subtask
          </Button>
        </div>
        
        {totalCount > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round((completedCount / totalCount) * 100)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Add new subtask form */}
        {isAddingSubtask && (
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-dashed border-border">
            <Input
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              placeholder="Enter subtask title..."
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddSubtask();
                } else if (e.key === 'Escape') {
                  setIsAddingSubtask(false);
                  setNewSubtaskTitle('');
                }
              }}
              autoFocus
            />
            <Button
              size="sm"
              onClick={handleAddSubtask}
              disabled={!newSubtaskTitle.trim()}
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsAddingSubtask(false);
                setNewSubtaskTitle('');
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Subtasks list */}
        {subtasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="w-12 h-12 mx-auto mb-3 bg-muted rounded-full flex items-center justify-center">
              <Plus className="w-6 h-6" />
            </div>
            <p className="text-sm">No subtasks yet</p>
            <p className="text-xs mt-1">Break down this todo into smaller tasks</p>
          </div>
        ) : (
          <div className="space-y-2">
            {subtasks.map((subtask) => (
              <div
                key={subtask.id}
                className={cn(
                  "group flex items-center gap-3 p-3 rounded-lg border transition-all duration-200",
                  subtask.completed 
                    ? "bg-green-50/50 border-green-200" 
                    : "bg-background border-border hover:bg-muted/30"
                )}
              >
                <Checkbox
                  checked={subtask.completed}
                  onCheckedChange={() => handleToggleSubtask(subtask.id)}
                  className="w-4 h-4"
                />
                
                <div className="flex-1 min-w-0">
                  {editingSubtaskId === subtask.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        className="flex-1 h-8"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleEditSubtask(subtask.id, editingTitle);
                          } else if (e.key === 'Escape') {
                            cancelEditing();
                          }
                        }}
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={() => handleEditSubtask(subtask.id, editingTitle)}
                        disabled={!editingTitle.trim()}
                        className="h-8 w-8 p-0"
                      >
                        <Check className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={cancelEditing}
                        className="h-8 w-8 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className={cn(
                        "text-sm font-medium",
                        subtask.completed && "line-through text-muted-foreground"
                      )}>
                        {subtask.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Created {format(parseISO(subtask.createdAt), 'MMM d, h:mm a')}
                        {subtask.updatedAt !== subtask.createdAt && (
                          <> • Updated {format(parseISO(subtask.updatedAt), 'MMM d, h:mm a')}</>
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {editingSubtaskId !== subtask.id && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditing(subtask)}
                      className="h-7 w-7 p-0 hover:bg-amber-50 hover:text-amber-600"
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSubtask(subtask.id)}
                      className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};