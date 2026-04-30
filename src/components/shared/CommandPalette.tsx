import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Command, Home, Users, GraduationCap, BookOpen, Calendar,
  ClipboardCheck, Wallet, TrendingUp, CreditCard, FileSpreadsheet,
  Bell, Settings, Palette, User, MessageSquare, Briefcase,
  NotebookPen, FileCheck, Database, Shield, Map as MapIcon,
  HardDrive, LogOut, BookMarked, CalendarDays, FileText, Sun, Moon,
} from "lucide-react";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput,
  CommandItem, CommandList, CommandSeparator, CommandShortcut,
} from "@/components/ui/command";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/useTheme";

interface PaletteItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  group: string;
  roles?: string[];
  action: () => void;
  keywords?: string;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { setTheme } = useTheme();

  // Atalho global: Cmd+K / Ctrl+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (path: string) => () => {
    navigate(path);
    setOpen(false);
  };

  const items: PaletteItem[] = useMemo(() => {
    const role = user?.role;
    const base: PaletteItem[] = [
      { id: "dash", label: "Dashboard", icon: Home, group: "Navegação", action: go("/dashboard") },
      { id: "students", label: "Educandos", icon: Users, group: "Navegação", action: go("/students"), keywords: "alunos estudantes" },
      { id: "teachers", label: "Professores", icon: GraduationCap, group: "Navegação", action: go("/teachers"), keywords: "docentes" },
      { id: "turmas", label: "Turmas", icon: Users, group: "Navegação", action: go("/turmas") },
      { id: "subjects", label: "Disciplinas", icon: BookOpen, group: "Navegação", action: go("/disciplinas"), keywords: "matérias" },
      { id: "matriculas", label: "Matrículas", icon: ClipboardCheck, group: "Navegação", action: go("/matriculas"), keywords: "inscrições" },
      { id: "calendario", label: "Calendário Escolar", icon: Calendar, group: "Navegação", action: go("/calendario") },
      { id: "biblioteca", label: "Biblioteca", icon: BookMarked, group: "Navegação", action: go("/biblioteca") },
      { id: "notif", label: "Notificações", icon: Bell, group: "Navegação", action: go("/notificacoes") },
      { id: "comm", label: "Comunicação / Tickets", icon: MessageSquare, group: "Navegação", action: go("/comunicacao"), keywords: "mensagens chamados" },

      // Pedagógico
      { id: "ped-cal", label: "Calendário de Provas", icon: CalendarDays, group: "Pedagógico", action: go("/calendario-provas"), keywords: "exames testes" },
      { id: "ped-plan", label: "Plano de Aulas (AEP)", icon: NotebookPen, group: "Pedagógico", action: go("/plano-aulas"), keywords: "PRRR planificação" },
      { id: "ped-cur", label: "Currículo", icon: FileText, group: "Pedagógico", action: go("/curriculo") },
      { id: "ped-arq", label: "Arquivos Pedagógicos", icon: FileSpreadsheet, group: "Pedagógico", action: go("/arquivos") },
      { id: "presencas", label: "Presenças", icon: ClipboardCheck, group: "Pedagógico", action: go("/presencas"), keywords: "frequência faltas" },
      { id: "avaliacoes", label: "Avaliações / Pauta", icon: FileCheck, group: "Pedagógico", action: go("/avaliacoes"), keywords: "notas pauta" },

      // Financeiro
      { id: "fin-dash", label: "Dashboard Financeiro", icon: TrendingUp, group: "Financeiro", action: go("/financeiro/dashboard"), roles: ["ADMIN", "DIRETORIA", "FINANCEIRO", "SECRETARIA"] },
      { id: "fin-caixa", label: "Caixa", icon: Wallet, group: "Financeiro", action: go("/financeiro/caixa"), roles: ["ADMIN", "DIRETORIA", "FINANCEIRO", "SECRETARIA"] },
      { id: "fin-prop", label: "Propinas", icon: CreditCard, group: "Financeiro", action: go("/financeiro/propinas"), roles: ["ADMIN", "DIRETORIA", "FINANCEIRO", "SECRETARIA"], keywords: "mensalidades" },
      { id: "fin-cob", label: "Cobranças", icon: Wallet, group: "Financeiro", action: go("/financeiro/cobrancas"), roles: ["ADMIN", "DIRETORIA", "FINANCEIRO", "SECRETARIA"] },
      { id: "fin-rel", label: "Relatórios Financeiros", icon: FileSpreadsheet, group: "Financeiro", action: go("/financeiro/relatorios"), roles: ["ADMIN", "DIRETORIA", "FINANCEIRO"] },

      // RH
      { id: "rh-col", label: "Colaboradores", icon: Briefcase, group: "Recursos Humanos", action: go("/colaboradores"), roles: ["ADMIN", "DIRETORIA"] },
      { id: "rh-doc", label: "Documentação RH", icon: FileText, group: "Recursos Humanos", action: go("/rh/documentacao"), roles: ["ADMIN", "DIRETORIA"] },
      { id: "rh-cont", label: "Contratos", icon: FileCheck, group: "Recursos Humanos", action: go("/rh/contratos"), roles: ["ADMIN", "DIRETORIA"] },

      // Configurações
      { id: "cfg", label: "Configurações", icon: Settings, group: "Configurações", action: go("/configuracoes") },
      { id: "cfg-aparencia", label: "Aparência", icon: Palette, group: "Configurações", action: go("/configuracoes/aparencia") },
      { id: "cfg-perfil", label: "Meu Perfil", icon: User, group: "Configurações", action: go("/configuracoes/perfil") },
      { id: "cfg-roadmap", label: "Roadmap do Projeto", icon: MapIcon, group: "Configurações", action: go("/configuracoes/roadmap"), roles: ["ADMIN", "DIRETORIA"] },
      { id: "cfg-audit", label: "Auditoria", icon: Shield, group: "Configurações", action: go("/configuracoes/auditoria"), roles: ["ADMIN", "DIRETORIA"] },
      { id: "cfg-back", label: "Backups", icon: HardDrive, group: "Configurações", action: go("/configuracoes/backups"), roles: ["ADMIN", "DIRETORIA"] },
      { id: "cfg-int", label: "Integrações", icon: Database, group: "Configurações", action: go("/configuracoes/integracoes"), roles: ["ADMIN", "DIRETORIA"] },

      // Acções
      { id: "act-dark", label: "Tema escuro", icon: Moon, group: "Acções", action: () => { setTheme("dark"); setOpen(false); } },
      { id: "act-light", label: "Tema claro", icon: Sun, group: "Acções", action: () => { setTheme("light"); setOpen(false); } },
      { id: "act-logout", label: "Terminar sessão", icon: LogOut, group: "Acções", action: () => { logout(); setOpen(false); } },
    ];

    return base.filter((it) => !it.roles || (role && it.roles.includes(role)));
  }, [user, navigate, logout, setTheme]);

  // Não mostrar palette em contextos sem auth
  if (!isAuthenticated) return null;

  // Agrupar
  const groups = useMemo(() => {
    const map = new Map<string, PaletteItem[]>();
    items.forEach((i) => {
      if (!map.has(i.group)) map.set(i.group, []);
      map.get(i.group)!.push(i);
    });
    return Array.from(map.entries());
  }, [items]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Pesquisar páginas, acções, atalhos..." />
      <CommandList>
        <CommandEmpty>Nada encontrado.</CommandEmpty>
        {groups.map(([group, list], idx) => (
          <div key={group}>
            {idx > 0 && <CommandSeparator />}
            <CommandGroup heading={group}>
              {list.map((it) => {
                const Icon = it.icon;
                return (
                  <CommandItem
                    key={it.id}
                    value={`${it.label} ${it.keywords ?? ""}`}
                    onSelect={it.action}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <span>{it.label}</span>
                    {it.shortcut && <CommandShortcut>{it.shortcut}</CommandShortcut>}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </div>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
