import React from 'react';
import { motion } from 'framer-motion';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function MainLayout({ children, title, subtitle }: MainLayoutProps) {
  return (
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
        </div>
      </div>
    </SidebarProvider>
  );
}