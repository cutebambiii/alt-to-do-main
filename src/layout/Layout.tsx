import { ReactNode } from 'react';
import { Header } from './Header';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Skip link for accessibility */}
      <a 
        href="#main-content" 
        className="skip-link"
        tabIndex={0}
      >
        Skip to main content
      </a>
      
      <Header />
      
      <main 
        id="main-content"
        className="container mx-auto px-4 py-8 max-w-7xl"
        role="main"
      >
        <div className="animate-fade-in">
          {children}
        </div>
      </main>
      
      {/* Footer for better page structure */}
      <footer className="border-t bg-white/80 backdrop-blur-sm mt-16" role="contentinfo">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Built with React, TypeScript, and Tailwind CSS</p>
        </div>
      </footer>
    </div>
  );
};