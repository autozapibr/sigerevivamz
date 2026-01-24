import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  ClipboardCheck,
  DollarSign,
  BarChart3,
  Settings,
  UserCheck,
  Building2,
  FileText,
  Bell,
  LogOut,
  Wallet,
  TrendingUp,
  CreditCard,
  Archive,
  UsersRound,
  LibraryBig,
  CalendarDays,
  ChartBar,
  BookMarked,
  NotebookPen,
  FileSpreadsheet,
  UserCog,
  FileCheck,
  Briefcase
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

// Estrutura modular do sistema
const systemModules = {
  gestao_financeira: {
    label: 'GESTÃO FINANCEIRA',
    permission: 'gestao_financeira',
    items: [
      {
        title: 'Dashboard Financeiro',
        url: '/financeiro',
        icon: DollarSign,
      },
      {
        title: 'Livro Caixa',
        url: '/financeiro/caixa',
        icon: Wallet,
      },
      {
        title: 'Matrículas & Propinas',
        url: '/financeiro/propinas',
        icon: CreditCard,
      },
      {
        title: 'Cobranças',
        url: '/financeiro/cobrancas',
        icon: TrendingUp,
      },
      {
        title: 'Relatórios Financeiros',
        url: '/financeiro/relatorios',
        icon: ChartBar,
      },
    ],
  },
  gestao_escolar: {
    label: 'GESTÃO ESCOLAR',
    permission: 'gestao_escolar',
    items: [
      {
        title: 'Dashboard',
        url: '/dashboard',
        icon: Home,
      },
      {
        title: 'Estudantes',
        url: '/students',
        icon: Users,
      },
      {
        title: 'Matrículas',
        url: '/matriculas',
        icon: FileText,
      },
      {
        title: 'Classes & Turmas',
        url: '/turmas',
        icon: Building2,
      },
      {
        title: 'Disciplinas',
        url: '/disciplinas',
        icon: BookOpen,
      },
      {
        title: 'Calendário',
        url: '/calendario',
        icon: CalendarDays,
      },
      {
        title: 'Biblioteca',
        url: '/biblioteca',
        icon: LibraryBig,
      },
      {
        title: 'Relatórios Escolares',
        url: '/relatorios',
        icon: BarChart3,
      },
    ],
  },
  gestao_pedagogica: {
    label: 'GESTÃO PEDAGÓGICA',
    permission: 'gestao_pedagogica',
    items: [
      {
        title: 'Cadernetas (Notas)',
        url: '/avaliacoes',
        icon: NotebookPen,
      },
      {
        title: 'Assiduidade',
        url: '/presencas',
        icon: ClipboardCheck,
      },
      {
        title: 'Calendário de Provas',
        url: '/calendario-provas',
        icon: Calendar,
      },
      {
        title: 'Plano de Aulas',
        url: '/plano-aulas',
        icon: BookMarked,
      },
      {
        title: 'Currículo Escolar',
        url: '/curriculo',
        icon: FileSpreadsheet,
      },
    ],
  },
  gestao_rh: {
    label: 'RECURSOS HUMANOS',
    permission: 'gestao_rh',
    items: [
      {
        title: 'Professores',
        url: '/teachers',
        icon: UserCheck,
      },
      {
        title: 'Colaboradores',
        url: '/colaboradores',
        icon: UsersRound,
      },
      {
        title: 'Documentação',
        url: '/rh/documentacao',
        icon: FileCheck,
      },
      {
        title: 'Contratos',
        url: '/rh/contratos',
        icon: Briefcase,
      },
    ],
  },
  configuracoes: {
    label: 'CONFIGURAÇÕES',
    permission: 'configuracoes',
    items: [
      {
        title: 'Configurações',
        url: '/configuracoes',
        icon: Settings,
      },
    ],
  },
};

const systemItems = [
  {
    title: 'Notificações',
    url: '/notificacoes',
    icon: Bell,
    permissions: ['*'],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { user, logout } = useAuth();
  const location = useLocation();

  const hasPermission = (permission: string) => {
    if (!user) return false;
    const userPermissions = ROLE_PERMISSIONS[user.role];
    
    // Verificar se o usuário tem acesso total
    if (userPermissions.includes('*' as never)) return true;
    
    // Verificar permissão específica
    return userPermissions.includes(permission as never);
  };

  const isActive = (path: string) => location.pathname === path;

  const getNavClassName = (path: string) => {
    return isActive(path) 
      ? "bg-primary text-primary-foreground font-medium shadow-md" 
      : "hover:bg-sidebar-accent text-sidebar-foreground";
  };

  // Filtrar módulos que o usuário tem permissão para acessar
  const accessibleModules = Object.entries(systemModules).filter(
    ([_, module]) => hasPermission(module.permission)
  );

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-sidebar border-r border-sidebar-border">
        {/* Logo e título */}
        <div className="p-4 border-b border-sidebar-border">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-lg font-bold text-primary">SGE REVIVA</h1>
                <p className="text-xs text-sidebar-foreground/70">Sistema de Gestão Escolar</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Perfil do usuário */}
        {user && (
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-sidebar-foreground/70 capitalize">
                    {user.role.toLowerCase()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Módulos do sistema */}
        <div className="flex-1 overflow-y-auto">
          {accessibleModules.map(([key, module]) => (
            <SidebarGroup key={key}>
              <SidebarGroupLabel className="text-sidebar-foreground/70 text-xs font-medium px-4 py-2">
                {!collapsed && module.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {module.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink 
                          to={item.url} 
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${getNavClassName(item.url)}`}
                        >
                          <item.icon className="w-5 h-5 flex-shrink-0" />
                          {!collapsed && <span className="text-sm">{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}

          {/* Navegação do sistema */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/70 text-xs font-medium px-4 py-2">
              {!collapsed && "SISTEMA"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {systemItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${getNavClassName(item.url)}`}
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        {!collapsed && <span className="text-sm">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        {/* Botão de logout */}
        <div className="mt-auto p-4 border-t border-sidebar-border">
          <Button
            onClick={logout}
            variant="outline"
            size={collapsed ? "sm" : "default"}
            className="w-full justify-start gap-3 border-sidebar-border hover:bg-sidebar-accent"
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && "Sair"}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
