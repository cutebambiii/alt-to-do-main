import { Trash2, CheckCircle2, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BulkAction } from '../types';

interface BulkActionBarProps {
  selectedCount: number;
  onBulkAction: (action: BulkAction) => void;
  onClearSelection: () => void;
  isLoading?: boolean;
}

export const BulkActionBar = ({ 
  selectedCount, 
  onBulkAction, 
  onClearSelection,
  isLoading 
}: BulkActionBarProps) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-slide-in">
      <Card className="shadow-lg border-primary/20 bg-white/95 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Selection Count */}
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="px-3 py-1">
                {selectedCount} selected
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
                disabled={isLoading}
                className="h-8 w-8 p-0 hover:bg-gray-100"
                aria-label="Clear selection"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-border" />

            {/* Bulk Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBulkAction('complete')}
                disabled={isLoading}
                className="hover:bg-green-50 hover:text-green-700 hover:border-green-200"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark Complete
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onBulkAction('incomplete')}
                disabled={isLoading}
                className="hover:bg-yellow-50 hover:text-yellow-700 hover:border-yellow-200"
              >
                <Clock className="w-4 h-4 mr-2" />
                Mark Pending
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onBulkAction('delete')}
                disabled={isLoading}
                className="hover:bg-red-50 hover:text-red-700 hover:border-red-200"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};