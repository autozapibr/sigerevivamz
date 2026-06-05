import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, ChevronDown, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { useNavigate } from 'react-router-dom';
import { NotificationBell } from './NotificationBell';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
}

export function AppHeader({ title, subtitle }: AppHeaderProps) {
  const { user, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  };

  return (
    <motion.header 
      className="sticky top-0 z-40 h-16 bg-background/80 backdrop-blur-lg border-b border-border/50 flex items-center px-4 md:px-6 gap-4"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Mobile sidebar trigger - Left side */}
      <SidebarTrigger className="md:hidden h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent">
        <Menu className="w-5 h-5" />
      </SidebarTrigger>

      {/* Page Title */}
      {title && (
        <div className="hidden sm:block flex-shrink-0">
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right Actions - Theme and User Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications Bell */}
        <NotificationBell />

         {/* Theme Toggle */}
         <Button
           variant="ghost"
           size="icon"
           onClick={toggleTheme}
           className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
         >
            <motion.div
              initial={false}
              animate={{ rotate: isDark ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </motion.div>
          </Button>

         {/* User Menu */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center gap-2 px-2 rounded-lg hover:bg-accent"
              >
                <Avatar className="w-8 h-8 border-2 border-primary/20">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-foreground leading-none">{user.name.split(' ')[0]}</p>
                  <p className="text-xs text-muted-foreground capitalize mt-0.5">
                    {user.role.toLowerCase()}
                  </p>
                </div>
                <ChevronDown className="hidden md:block w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* Configurações apenas para ADMIN e DIRETORIA */}
              {(user.role === 'ADMIN' || user.role === 'DIRETORIA') && (
                <DropdownMenuItem onClick={() => navigate('/configuracoes')}>
                  Configurações
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => navigate('/notificacoes')}>
                Notificações
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={logout}
                className="text-destructive focus:text-destructive"
              >
                Terminar sessão
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </motion.header>
  );
}
