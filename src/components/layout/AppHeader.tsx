import React from 'react';
import { motion } from 'framer-motion';
 import { Search, Sun, Moon, ChevronDown, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
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
import { useUnreadNotificationCount } from '@/hooks/useNotifications';
import { useSearch } from '@/contexts/SearchContext';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
}

export function AppHeader({ title, subtitle }: AppHeaderProps) {
  const { user, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const unreadCount = useUnreadNotificationCount();
  const { searchQuery, setSearchQuery, placeholder } = useSearch();

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
      {/* Page Title */}
      {title && (
        <div className="hidden sm:block flex-shrink-0">
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      )}

      {/* Search Bar */}
      <div className="flex-1 max-w-xl mx-auto">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 bg-muted/50 border-0 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <kbd className="hidden md:inline-flex absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Sidebar Toggle */}
        <SidebarTrigger className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg" />

        {/* Notifications Icon */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 relative rounded-lg text-muted-foreground hover:text-foreground"
          onClick={() => navigate('/notificacoes')}
          title="Notificações"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <motion.span 
              className="absolute top-1.5 right-1.5 min-w-[14px] h-[14px] px-0.5 bg-destructive text-destructive-foreground text-[8px] font-bold rounded-full flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500 }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </Button>

        {/* Theme Toggle */}
         <Button
           variant="ghost"
           size="icon"
           onClick={toggleTheme}
           className="rounded-lg text-muted-foreground hover:text-foreground"
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
