import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Users, GraduationCap, BookOpen, Calendar, ClipboardCheck,
  DollarSign, BarChart3, Settings, UserCheck, Building2, FileText,
  Bell, LogOut, Wallet, TrendingUp, CreditCard, UsersRound, LibraryBig,
  CalendarDays, ChartBar, BookMarked, NotebookPen, FileSpreadsheet,
  FileCheck, Briefcase, ChevronRight, MessageSquare, Palette, User,
  Brain, Plug, Database, ArrowLeft, ArrowRight, RotateCw
  , Map as MapIcon, Shield, HardDrive
} from 'lucide-react';

 import {
   Sidebar,
   SidebarContent,
   SidebarGroup,
   SidebarGroupContent,
   SidebarGroupLabel,
   SidebarMenu,
   SidebarMenuButton,
   SidebarMenuItem,
   useSidebar,
   SidebarTrigger,
 } from '@/components/ui/sidebar';
 import { useAuth } from '@/contexts/AuthContext';
 import { useUnreadNotificationCount } from '@/hooks/useNotifications';
import { ROLE_PERMISSIONS } from '@/types/auth';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

// Estrutura modular do sistema
const systemModules = {
  gestao_escolar: {
    label: 'Gestão Escolar',
    permission: 'gestao_escolar',
    icon: GraduationCap,
    items: [
      { title: 'Dashboard', url: '/dashboard', icon: Home },
      { title: 'Estudantes', url: '/students', icon: Users },
      { title: 'Matrículas', url: '/matriculas', icon: FileText },
      { title: 'Turmas', url: '/turmas', icon: Building2 },
      { title: 'Disciplinas', url: '/disciplinas', icon: BookOpen },
      { title: 'Calendário', url: '/calendario', icon: CalendarDays },
      { title: 'Biblioteca', url: '/biblioteca', icon: LibraryBig },
    ],
  },
  gestao_pedagogica: {
    label: 'Pedagógico',
    permission: 'gestao_pedagogica',
    icon: NotebookPen,
    items: [
      { title: 'Pauta Digital', url: '/avaliacoes', icon: NotebookPen },
      { title: 'Assiduidade', url: '/presencas', icon: ClipboardCheck },
      { title: 'Calendário', url: '/calendario-provas', icon: Calendar },
      { title: 'Plano de Aula', url: '/plano-aulas', icon: BookMarked },
      { title: 'Arquivos', url: '/arquivos', icon: FileCheck },
      { title: 'Currículo', url: '/curriculo', icon: FileSpreadsheet },
    ],
  },
  gestao_financeira: {
    label: 'Financeiro',
    permission: 'gestao_financeira',
    icon: DollarSign,
    items: [
      { title: 'Visão Geral', url: '/financeiro', icon: DollarSign },
      { title: 'Livro Caixa', url: '/financeiro/caixa', icon: Wallet },
      { title: 'Propinas', url: '/financeiro/propinas', icon: CreditCard },
      { title: 'Cobranças', url: '/financeiro/cobrancas', icon: TrendingUp },
      { title: 'Relatórios', url: '/financeiro/relatorios', icon: ChartBar },
    ],
  },
  gestao_rh: {
    label: 'Recursos Humanos',
    permission: 'gestao_rh',
    icon: UsersRound,
    items: [
      { title: 'Professores', url: '/teachers', icon: UserCheck },
      { title: 'Colaboradores', url: '/colaboradores', icon: UsersRound },
      { title: 'Documentação', url: '/rh/documentacao', icon: FileCheck },
      { title: 'Contratos', url: '/rh/contratos', icon: Briefcase },
    ],
  },
};

// Módulo de configurações (apenas ADMIN/DIRETORIA)
const configModule = {
  label: 'Configurações',
  icon: Settings,
  items: [
    { title: 'Perfis e Utilizadores', url: '/configuracoes/perfis-utilizadores', icon: Users },
    { title: 'Aparência', url: '/configuracoes/aparencia', icon: Palette },
    { title: 'Perfil & Região', url: '/configuracoes/perfil', icon: User },
    { title: 'Notificações', url: '/configuracoes/notificacoes', icon: Bell },
    { title: 'Inteligência Artificial', url: '/configuracoes/ia', icon: Brain },
    { title: 'Plano de Aula', url: '/configuracoes/plano-aulas', icon: BookMarked },
    { title: 'Integrações', url: '/configuracoes/integracoes', icon: Plug },
    { title: 'Sistema', url: '/configuracoes/sistema', icon: Database },
    { title: 'Roadmap', url: '/configuracoes/roadmap', icon: MapIcon },
    { title: 'Auditoria', url: '/configuracoes/auditoria', icon: Shield },
    { title: 'Backups', url: '/configuracoes/backups', icon: HardDrive },
  ],
};

const systemItems = [
  { title: 'Comunicação', url: '/comunicacao', icon: MessageSquare, roles: null },
  { title: 'Notificações', url: '/notificacoes', icon: Bell, roles: null },
  { title: 'Relatórios', url: '/relatorios', icon: BarChart3, roles: ['ADMIN', 'DIRETORIA', 'SECRETARIA'] as string[] },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
   const { user, logout } = useAuth();
   const unreadCount = useUnreadNotificationCount();
  const location = useLocation();
   const [openModules, setOpenModules] = React.useState<string[]>([]);
  const sidebarScrollRef = React.useRef<HTMLDivElement | null>(null);

  const saveSidebarScroll = React.useCallback(() => {
    if (typeof window === 'undefined' || !sidebarScrollRef.current) return;
    sessionStorage.setItem('siger_sidebar_scroll_top', String(sidebarScrollRef.current.scrollTop));
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedScrollTop = sessionStorage.getItem('siger_sidebar_scroll_top');
    if (!savedScrollTop) return;

    requestAnimationFrame(() => {
      if (sidebarScrollRef.current) {
        sidebarScrollRef.current.scrollTop = Number(savedScrollTop);
      }
    });
  }, [location.pathname]);

  React.useEffect(() => {
    return () => {
      saveSidebarScroll();
    };
  }, [saveSidebarScroll]);

  const hasPermission = (permission: string) => {
    if (!user) return false;
    const userPermissions = ROLE_PERMISSIONS[user.role];
    if (userPermissions.includes('*' as never)) return true;
    return userPermissions.includes(permission as never);
  };

  const isActive = (path: string) => location.pathname === path;
  const isModuleActive = (items: { url: string }[]) => 
    items.some(item => location.pathname === item.url || location.pathname.startsWith(item.url + '/'));

   const toggleModule = (key: string) => {
     setOpenModules(prev => 
       prev.includes(key) 
         ? [] 
         : [key]
     );
   };

  const accessibleModules = Object.entries(systemModules).filter(
    ([_, module]) => hasPermission(module.permission)
  );

  const getInitials = (name: string) => 
    name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();

  return (
    <Sidebar 
      className="border-r border-border/50 transition-all duration-300"
      collapsible="icon"
    >
      <SidebarContent className="bg-sidebar">
         {/* Logo and Collapse Toggle */}
         <div className={cn("p-4 border-b border-border/50 flex items-center justify-center h-16", collapsed && "p-3")}>
           <motion.div 
             className="flex items-center gap-3"
             layout
           >
             <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
               <GraduationCap className="w-5 h-5 text-primary-foreground" />
             </div>
             <AnimatePresence>
               {!collapsed && (
                 <motion.div
                   initial={{ opacity: 0, width: 0 }}
                   animate={{ opacity: 1, width: 'auto' }}
                   exit={{ opacity: 0, width: 0 }}
                   transition={{ duration: 0.2 }}
                 >
                   <h1 className="text-lg font-bold text-foreground font-inter tracking-tight">SiGER</h1>
                   <p className="text-[10px] text-muted-foreground leading-none">Sistema de Gestão Escolar Reviva</p>
                 </motion.div>
               )}
             </AnimatePresence>
           </motion.div>
           
         </div>

        {/* Navigation Icons */}
        {user && !collapsed && (
          <div className="border-b border-border/50 py-3">
            <div className="flex items-center justify-center gap-1 px-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                onClick={() => window.history.back()}
                title="Voltar"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                onClick={() => window.history.forward()}
                title="Avançar"
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                onClick={() => window.location.reload()}
                title="Actualizar"
              >
                <RotateCw className="w-4 h-4" />
              </Button>
               <Button
                 variant="ghost"
                 size="icon"
                 className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                 onClick={() => window.location.href = '/dashboard'}
                 title="Início"
               >
                 <Home className="w-4 h-4" />
               </Button>
               <Button
                 variant="ghost"
                 size="icon"
                 className="h-8 w-8 relative rounded-lg text-muted-foreground hover:text-foreground"
                 onClick={() => window.location.href = '/notificacoes'}
                 title="Notificações"
               >
                 <Bell className="w-4 h-4" />
                 {unreadCount > 0 && (
                   <motion.span 
                     className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-0.5 bg-destructive text-destructive-foreground text-[8px] font-bold rounded-full flex items-center justify-center"
                     initial={{ scale: 0 }}
                     animate={{ scale: 1 }}
                     transition={{ type: "spring", stiffness: 500 }}
                   >
                     {unreadCount > 99 ? '99+' : unreadCount}
                   </motion.span>
                 )}
               </Button>
            </div>
          </div>
        )}

         {/* Navigation */}
         <div
           ref={sidebarScrollRef}
           onScroll={saveSidebarScroll}
           className="flex-1 overflow-y-auto px-3 py-4 sidebar-scrollbar"
         >
          <div className="space-y-2">
            {accessibleModules.map(([key, module]) => {
              const moduleIsActive = isModuleActive(module.items);
              const isOpen = openModules.includes(key) || (openModules.length === 0 && moduleIsActive);
              const ModuleIcon = module.icon;

              return (
                <Collapsible 
                  key={key} 
                  open={isOpen && !collapsed}
                  onOpenChange={() => !collapsed && toggleModule(key)}
                >
                  <CollapsibleTrigger asChild>
                    <button
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                        moduleIsActive 
                          ? "bg-primary/10 text-primary shadow-sm" 
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                    >
                      <ModuleIcon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left">{module.label}</span>
                          <ChevronRight 
                            className={cn(
                              "w-4 h-4 transition-transform duration-200 opacity-50",
                              isOpen && "rotate-90 opacity-100"
                            )} 
                          />
                        </>
                      )}
                    </button>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <motion.div 
                      className="mt-1 ml-4 pl-4 border-l border-border/50 space-y-1"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.2 }}
                    >
                      {module.items.map((item) => {
                        const ItemIcon = item.icon;
                        return (
                          <NavLink
                            key={item.url}
                            to={item.url}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200",
                              isActive(item.url)
                                ? "bg-primary text-primary-foreground font-medium shadow-sm"
                                : "text-muted-foreground hover:bg-accent hover:text-foreground"
                            )}
                          >
                            <ItemIcon className="w-4 h-4" />
                            <span>{item.title}</span>
                          </NavLink>
                        );
                      })}
                    </motion.div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>

          {/* System Items */}
          <div className="mt-6 pt-4 border-t border-border/50">
            <p className="px-3 mb-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              {!collapsed && 'Sistema'}
            </p>
            <div className="space-y-1">
              {systemItems.filter(item => !item.roles || (user && item.roles.includes(user.role))).map((item) => {
                const ItemIcon = item.icon;
                return (
                  <NavLink
                    key={item.url}
                    to={item.url}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200",
                      isActive(item.url)
                        ? "bg-primary text-primary-foreground font-medium shadow-sm"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <ItemIcon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span>{item.title}</span>}
                  </NavLink>
                );
              })}

              {/* Configurações - collapsible, apenas ADMIN/DIRETORIA */}
              {(user?.role === 'ADMIN' || user?.role === 'DIRETORIA') && (() => {
                const configIsActive = isModuleActive(configModule.items);
                const configIsOpen = openModules.includes('configuracoes') || (openModules.length === 0 && configIsActive);
                const ConfigIcon = configModule.icon;

                return (
                  <Collapsible
                    open={configIsOpen && !collapsed}
                    onOpenChange={() => !collapsed && toggleModule('configuracoes')}
                  >
                    <CollapsibleTrigger asChild>
                      <button
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                          configIsActive
                            ? "bg-primary/10 text-primary shadow-sm"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        )}
                      >
                        <ConfigIcon className="w-5 h-5 flex-shrink-0" />
                        {!collapsed && (
                          <>
                            <span className="flex-1 text-left">{configModule.label}</span>
                            <ChevronRight
                              className={cn(
                                "w-4 h-4 transition-transform duration-200 opacity-50",
                                configIsOpen && "rotate-90 opacity-100"
                              )}
                            />
                          </>
                        )}
                      </button>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <motion.div
                        className="mt-1 ml-4 pl-4 border-l border-border/50 space-y-1"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.2 }}
                      >
                        {configModule.items.map((item) => {
                          const ItemIcon = item.icon;
                          return (
                            <NavLink
                              key={item.url}
                              to={item.url}
                              className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200",
                                isActive(item.url)
                                  ? "bg-primary text-primary-foreground font-medium shadow-sm"
                                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
                              )}
                            >
                              <ItemIcon className="w-4 h-4" />
                              <span>{item.title}</span>
                            </NavLink>
                          );
                        })}
                      </motion.div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-border/50">
          <Button
            onClick={logout}
            variant="ghost"
            size={collapsed ? "icon" : "default"}
            className={cn(
              "w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10",
              collapsed && "justify-center"
            )}
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span>Terminar Sessão</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
