import { Search, Filter, CheckSquare, Square, Minus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { TodoFilters, FilterStatus, BulkSelectionState } from '../types';
import { ViewMode } from './ViewToggle';

interface TodoFiltersProps {
  filters: TodoFilters;
  onFiltersChange: (filters: TodoFilters) => void;
  bulkSelection: BulkSelectionState;
  onBulkSelectionChange: (selectAll: boolean) => void;
  showBulkSelection: boolean;
  onToggleBulkSelection: () => void;
  totalVisibleTodos: number;
  viewMode: ViewMode;
}

export const TodoFiltersComponent = ({ 
  filters, 
  onFiltersChange,
  bulkSelection,
  onBulkSelectionChange,
  showBulkSelection,
  onToggleBulkSelection,
  totalVisibleTodos,
  viewMode
}: TodoFiltersProps) => {
  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search });
  };

  const handleStatusChange = (status: FilterStatus) => {
    onFiltersChange({ ...filters, status });
  };

  const handleSelectAllChange = (checked: boolean) => {
    onBulkSelectionChange(checked);
  };

  return (
    <Card className="animate-slide-in">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="w-5 h-5 text-primary" aria-hidden="true" />
            Filter & Search
          </CardTitle>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleBulkSelection}
            className="flex items-center gap-2"
          >
            {showBulkSelection ? (
              <>
                <CheckSquare className="w-4 h-4" />
                Exit Selection
              </>
            ) : (
              <>
                <Square className="w-4 h-4" />
                Select Multiple
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Bulk Selection Controls */}
          {showBulkSelection && (
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Checkbox
                      checked={bulkSelection.isAllSelected}
                      ref={(el) => {
                        if (el) {
                          el.indeterminate = bulkSelection.isIndeterminate;
                        }
                      }}
                      onCheckedChange={handleSelectAllChange}
                      className="w-5 h-5"
                      aria-label="Select all visible todos"
                    />
                    {bulkSelection.isIndeterminate && (
                      <Minus className="w-3 h-3 absolute top-1 left-1 text-primary pointer-events-none" />
                    )}
                  </div>
                  <Label className="text-sm font-medium">
                    Select all visible todos ({totalVisibleTodos})
                  </Label>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  {bulkSelection.selectedIds.size} selected
                </div>
              </div>
            </div>
          )}

          <div className={`grid gap-6 ${viewMode === 'board' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
            {/* Search Field */}
            <div className="space-y-2">
              <Label htmlFor="search-todos" className="text-sm font-medium text-foreground">
                Search todos
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </div>
                <Input
                  id="search-todos"
                  type="text"
                  placeholder="Search by title..."
                  value={filters.search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 h-11 border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-describedby="search-help"
                />
              </div>
              <p id="search-help" className="text-xs text-muted-foreground">
                Search is case-insensitive and matches todo titles
              </p>
            </div>
            
            {/* Status Filter - Only show in list view */}
            {viewMode === 'list' && (
              <div className="space-y-2">
                <Label htmlFor="status-filter" className="text-sm font-medium text-foreground">
                  Filter by status
                </Label>
                <Select value={filters.status} onValueChange={handleStatusChange}>
                  <SelectTrigger 
                    id="status-filter" 
                    className="h-11 border-input bg-background text-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    aria-describedby="status-help"
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Todos</SelectItem>
                    <SelectItem value="completed">Completed Only</SelectItem>
                    <SelectItem value="incomplete">Pending Only</SelectItem>
                  </SelectContent>
                </Select>
                <p id="status-help" className="text-xs text-muted-foreground">
                  Filter todos by their completion status
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};