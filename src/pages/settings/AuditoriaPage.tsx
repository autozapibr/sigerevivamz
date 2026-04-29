import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Shield, Search, Filter, Loader2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

type AuditRow = {
  id: number;
  occurred_at: string;
  actor_email: string | null;
  actor_role: string | null;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  table_name: string;
  record_id: string | null;
  old_data: any;
  new_data: any;
};

const actionStyles: Record<string, string> = {
  INSERT: 'bg-success/15 text-success border-success/30',
  UPDATE: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  DELETE: 'bg-destructive/15 text-destructive border-destructive/30',
};

const actionLabel: Record<string, string> = {
  INSERT: 'Criação',
  UPDATE: 'Edição',
  DELETE: 'Eliminação',
};

export default function AuditoriaPage() {
  const { user } = useAuth();
  const [search, setSearch] = React.useState('');
  const [tableFilter, setTableFilter] = React.useState<string>('todas');
  const [actionFilter, setActionFilter] = React.useState<string>('todas');

  if (user?.role !== 'ADMIN' && user?.role !== 'DIRETORIA') {
    return <Navigate to="/dashboard" replace />;
  }

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['audit_log'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_log' as any)
        .select('*')
        .order('occurred_at', { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as unknown as AuditRow[];
    },
    staleTime: 60_000,
  });

  const tableNames = React.useMemo(() => {
    const s = new Set(rows.map(r => r.table_name));
    return Array.from(s).sort();
  }, [rows]);

  const filtered = rows.filter(r => {
    if (tableFilter !== 'todas' && r.table_name !== tableFilter) return false;
    if (actionFilter !== 'todas' && r.action !== actionFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.actor_email?.toLowerCase().includes(q) ||
        r.table_name.toLowerCase().includes(q) ||
        r.record_id?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <MainLayout title="Auditoria do Sistema" subtitle="Histórico de acções críticas registadas automaticamente">
      <div className="space-y-4 max-w-6xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle>Registo de Auditoria</CardTitle>
                <CardDescription>
                  Últimas {rows.length} acções (criação, edição e eliminação) em tabelas críticas
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar por utilizador, tabela ou ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={tableFilter} onValueChange={setTableFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as tabelas</SelectItem>
                  {tableNames.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as acções</SelectItem>
                  <SelectItem value="INSERT">Criação</SelectItem>
                  <SelectItem value="UPDATE">Edição</SelectItem>
                  <SelectItem value="DELETE">Eliminação</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">
                Nenhum registo encontrado.
              </p>
            ) : (
              <div className="space-y-2 max-h-[70vh] overflow-y-auto">
                {filtered.map(row => (
                  <div key={row.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/30 transition-colors">
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={actionStyles[row.action]}>
                          {actionLabel[row.action] ?? row.action}
                        </Badge>
                        <span className="text-sm font-medium text-foreground">{row.table_name}</span>
                        {row.record_id && (
                          <span className="text-xs text-muted-foreground font-mono">#{row.record_id}</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Por <span className="font-medium text-foreground">{row.actor_email ?? 'sistema'}</span>
                        {row.actor_role && <> · {row.actor_role}</>}
                        {' · '}
                        {format(new Date(row.occurred_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm:ss", { locale: pt })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}