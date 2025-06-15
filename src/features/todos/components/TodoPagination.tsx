import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { PaginationState } from '../types';

interface TodoPaginationProps {
  pagination: PaginationState;
  onPageChange: (page: number) => void;
}

export const TodoPagination = ({ pagination, onPageChange }: TodoPaginationProps) => {
  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const currentPage = pagination.page;

  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <nav 
      className="flex items-center justify-center mt-12"
      role="navigation"
      aria-label="Pagination navigation"
    >
      <div className="flex items-center space-x-2 bg-white rounded-lg border shadow-sm p-2">
        {/* Previous Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Go to previous page"
          className="pagination-button"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          <span className="sr-only">Previous</span>
        </Button>
        
        {/* Page Numbers */}
        <div className="flex items-center space-x-1">
          {getPageNumbers().map((page, index) => (
            <div key={index}>
              {typeof page === 'number' ? (
                <Button
                  variant={page === currentPage ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  className={`pagination-button ${page === currentPage ? 'active' : ''}`}
                  aria-label={`Go to page ${page}`}
                  aria-current={page === currentPage ? 'page' : undefined}
                >
                  {page}
                </Button>
              ) : (
                <div className="flex items-center justify-center min-w-[40px] h-10">
                  <MoreHorizontal className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  <span className="sr-only">More pages</span>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Next Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Go to next page"
          className="pagination-button"
        >
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
          <span className="sr-only">Next</span>
        </Button>
      </div>
      
      {/* Page Info */}
      <div className="ml-4 text-sm text-muted-foreground">
        <span className="sr-only">Page information: </span>
        Page {currentPage} of {totalPages}
      </div>
    </nav>
  );
};