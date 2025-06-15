import { LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ViewMode = 'list' | 'board';

interface ViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export const ViewToggle = ({ currentView, onViewChange }: ViewToggleProps) => {
  return (
    <div className="flex items-center bg-muted rounded-lg p-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewChange('list')}
        className={cn(
          "h-8 px-3 rounded-md transition-all",
          currentView === 'list' 
            ? "bg-background text-foreground shadow-sm" 
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="List view"
      >
        <List className="w-4 h-4 mr-2" />
        List
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewChange('board')}
        className={cn(
          "h-8 px-3 rounded-md transition-all",
          currentView === 'board' 
            ? "bg-background text-foreground shadow-sm" 
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="Board view"
      >
        <LayoutGrid className="w-4 h-4 mr-2" />
        Board
      </Button>
    </div>
  );
};