import React from 'react';
import { motion } from 'framer-motion';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { SearchProvider } from '@/contexts/SearchContext';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function MainLayout({ children, title, subtitle }: MainLayoutProps) {
  useRealtimeNotifications();
  return (
    <SearchProvider>
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background overflow-x-hidden">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col min-w-0">
          <AppHeader title={title} subtitle={subtitle} />
          
          <motion.main 
            className="flex-1 p-3 sm:p-4 md:p-6 overflow-x-hidden overflow-y-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="w-full max-w-full">
              {children}
            </div>
          </motion.main>

          <footer className="py-3 px-4 text-center text-xs text-muted-foreground/60 border-t border-border">
            © 2026 SiGER - Sistema de Gestão Escolar Reviva
            <span className="mx-1">·</span>
            Feito com ❤️ por{' '}
            <a href="https://autozapi.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              AutoZapi
            </a>{' '}
            Soluções em TI, AI e Automações.
          </footer>
        </div>
      </div>
    </SidebarProvider>
    </SearchProvider>
  );
}