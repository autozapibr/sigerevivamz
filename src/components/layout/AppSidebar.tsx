import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Users, GraduationCap, BookOpen, Calendar, ClipboardCheck,
  DollarSign, BarChart3, Settings, UserCheck, Building2, FileText,
  Bell, LogOut, Wallet, TrendingUp, CreditCard, UsersRound, LibraryBig,
  CalendarDays, ChartBar, BookMarked, NotebookPen, FileSpreadsheet,
  FileCheck, Briefcase, ChevronRight, MessageSquare, Palette, User,
  Brain, Plug, Database
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
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_PERMISSIONS } from '@/types/auth';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
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
      { title: 'Plano de Aulas', url: '/plano-aulas', icon: BookMarked },
      { title: 'Currículo', url: '/curriculo', icon: FileSpreadsheet },
      { title: 'Arquivos', url: '/arquivos', icon: FileCheck },
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
    { title: 'Aparência', url: '/configuracoes/aparencia', icon: Palette },
    { title: 'Perfil & Região', url: '/configuracoes/perfil', icon: User },
    { title: 'Notificações', url: '/configuracoes/notificacoes', icon: Bell },
    { title: 'Inteligência Artificial', url: '/configuracoes/ia', icon: Brain },
    { title: 'Plano de Aulas', url: '/configuracoes/plano-aulas', icon: BookMarked },
    { title: 'Integrações', url: '/configuracoes/integracoes', icon: Plug },
    { title: 'Utilizadores', url: '/configuracoes/utilizadores', icon: UsersRound },
    { title: 'Sistema', url: '/configuracoes/sistema', icon: Database },
  ],
};

const systemItems = [
  { title: 'Comunicação', url: '/comunicacao', icon: MessageSquare, restricted: false },
  { title: 'Notificações', url: '/notificacoes', icon: Bell, restricted: false },
  { title: 'Relatórios', url: '/relatorios', icon: BarChart3, restricted: false },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { user, logout } = useAuth();
  const location = useLocation();
  const [openModules, setOpenModules] = React.useState<string[]>(['gestao_escolar']);

  const hasPermission = (permission: string) => {
    if (!user) return false;
    const userPermissions = ROLE_PERMISSIONS[user.role];
    if (userPermissions.includes('*' as never)) return true;
    return userPermissions.includes(permission as never);
  };

  const isActive = (path: string) => location.pathname === path;
  const isModuleActive = (items: typeof systemModules.gestao_escolar.items) => 
    items.some(item => location.pathname.startsWith(item.url));

  const toggleModule = (key: string) => {
    setOpenModules(prev => 
      prev.includes(key) 
        ? prev.filter(k => k !== key) 
        : [...prev, key]
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
        {/* Logo */}
        <div className={cn("p-4 border-b border-border/50", collapsed && "flex justify-center p-3")}>
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

        {/* User Profile Card */}
        {user && !collapsed && (
          <div className="p-4 border-b border-border/50">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/50">
              <Avatar className="w-10 h-10 border-2 border-primary/20">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user.name}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {user.role.toLowerCase()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <div className="space-y-2">
            {accessibleModules.map(([key, module]) => {
              const isOpen = openModules.includes(key) || isModuleActive(module.items);
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
                        isModuleActive(module.items) 
                          ? "bg-primary/10 text-primary" 
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                    >
                      <ModuleIcon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left">{module.label}</span>
                          <ChevronRight 
                            className={cn(
                              "w-4 h-4 transition-transform duration-200",
                              isOpen && "rotate-90"
                            )} 
                          />
                        </>
                      )}
                    </button>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <motion.div 
                      className="mt-1 ml-4 pl-4 border-l-2 border-border/50 space-y-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
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
              {systemItems.map((item) => {
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
                const configIsActive = configModule.items.some(i => location.pathname.startsWith(i.url));
                const configIsOpen = openModules.includes('configuracoes') || configIsActive;
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
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        )}
                      >
                        <ConfigIcon className="w-5 h-5 flex-shrink-0" />
                        {!collapsed && (
                          <>
                            <span className="flex-1 text-left">{configModule.label}</span>
                            <ChevronRight
                              className={cn(
                                "w-4 h-4 transition-transform duration-200",
                                configIsOpen && "rotate-90"
                              )}
                            />
                          </>
                        )}
                      </button>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <motion.div
                        className="mt-1 ml-4 pl-4 border-l-2 border-border/50 space-y-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
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
        </ScrollArea>

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
