import React from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Map, CheckCircle2, Circle, Loader2, AlertCircle, Filter } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { PHASES, ROADMAP_SEED } from '@/data/roadmapSeed';
import { cn } from '@/lib/utils';

type RoadmapRow = {
  id: string;
  phase: string;
  title: string;
  description: string | null;
  category: string | null;
  priority: string;
  is_done: boolean;
  done_at: string | null;
  display_order: number;
};

const priorityStyles: Record<string, string> = {
  alta: 'bg-destructive/15 text-destructive border-destructive/30',
  media: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  baixa: 'bg-muted text-muted-foreground border-border',
};

const priorityLabel: Record<string, string> = {
  alta: 'Alta',
  media: 'Média',
  baixa: 'Baixa',
};

export default function RoadmapPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'DIRETORIA';
  const [filter, setFilter] = React.useState<'todos' | 'pendentes' | 'concluidos'>('todos');
  const [seeding, setSeeding] = React.useState(false);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['roadmap_items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roadmap_items')
        .select('*')
        .order('phase', { ascending: true })
        .order('display_order', { ascending: true });
      if (error) throw error;
      return (data ?? []) as RoadmapRow[];
    },
  });

  // Seed automático na primeira visita (apenas ADMIN/DIRETORIA)
  React.useEffect(() => {
    const run = async () => {
      if (!canEdit || isLoading || seeding) return;
      const existingIds = new Set(items.map(i => i.id));
      const missing = ROADMAP_SEED.filter(s => !existingIds.has(s.id));
      if (missing.length === 0) return;
      setSeeding(true);
      const { error } = await supabase.from('roadmap_items').upsert(
        missing.map(m => ({
          id: m.id,
          phase: m.phase,
          title: m.title,
          description: m.description,
          category: m.category,
          priority: m.priority,
          display_order: m.display_order,
        })),
        { onConflict: 'id' }
      );
      setSeeding(false);
      if (error) {
        toast({ title: 'Erro ao inicializar roadmap', description: error.message, variant: 'destructive' });
        return;
      }
      queryClient.invalidateQueries({ queryKey: ['roadmap_items'] });
    };
    run();
  }, [canEdit, isLoading, items, seeding, queryClient, toast]);

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_done }: { id: string; is_done: boolean }) => {
      const { error } = await supabase
        .from('roadmap_items')
        .update({
          is_done,
          done_at: is_done ? new Date().toISOString() : null,
          done_by: is_done ? user?.id ?? null : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap_items'] });
    },
    onError: (error: any) => {
      toast({ title: 'Erro', description: error?.message ?? 'Não foi possível actualizar.', variant: 'destructive' });
    },
  });

  const totals = React.useMemo(() => {
    const total = items.length;
    const done = items.filter(i => i.is_done).length;
    const pct = total === 0 ? 0 : Math.round((done / total) * 100);
    return { total, done, pct };
  }, [items]);

  const itemsByPhase = React.useMemo(() => {
    const map: Record<string, RoadmapRow[]> = {};
    for (const phase of PHASES) map[phase.key] = [];
    for (const item of items) {
      if (!map[item.phase]) map[item.phase] = [];
      map[item.phase].push(item);
    }
    return map;
  }, [items]);

  const filteredItems = (rows: RoadmapRow[]) => {
    if (filter === 'pendentes') return rows.filter(r => !r.is_done);
    if (filter === 'concluidos') return rows.filter(r => r.is_done);
    return rows;
  };

  return (
    <MainLayout title="Roadmap do Projecto" subtitle="Acompanhe o desenvolvimento e as próximas entregas do SiGER">
      <motion.div
        className="space-y-6 max-w-5xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Resumo */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Map className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle>Progresso Global</CardTitle>
                <CardDescription>
                  {totals.done} de {totals.total} tarefas concluídas — {totals.pct}% do roadmap completo
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-base font-semibold px-3 py-1">
                {totals.pct}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={totals.pct} className="h-3" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PHASES.slice(0, 4).map(phase => {
                const rows = itemsByPhase[phase.key] ?? [];
                const done = rows.filter(r => r.is_done).length;
                const total = rows.length;
                const pct = total === 0 ? 0 : Math.round((done / total) * 100);
                return (
                  <div key={phase.key} className="p-3 rounded-lg border bg-card/50">
                    <p className="text-xs text-muted-foreground truncate">{phase.label.split(' — ')[0]}</p>
                    <p className="text-lg font-bold text-foreground">{pct}%</p>
                    <p className="text-xs text-muted-foreground">{done}/{total} tarefas</p>
                  </div>
                );
              })}
            </div>
            {!canEdit && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border text-sm text-muted-foreground">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Modo somente leitura. Apenas ADMIN e DIRETORIA podem marcar tarefas como concluídas.</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Filtros */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
            {(['todos', 'pendentes', 'concluidos'] as const).map(f => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? 'default' : 'ghost'}
                onClick={() => setFilter(f)}
                className="capitalize h-8"
              >
                {f}
              </Button>
            ))}
          </div>
        </div>

        {/* Fases */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs defaultValue={PHASES[0].key} className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto h-auto flex-wrap gap-1 bg-muted/30 p-1">
              {PHASES.map(phase => {
                const rows = itemsByPhase[phase.key] ?? [];
                const done = rows.filter(r => r.is_done).length;
                const total = rows.length;
                return (
                  <TabsTrigger key={phase.key} value={phase.key} className="text-xs whitespace-nowrap">
                    {phase.label.split(' — ')[0]}
                    <span className="ml-1.5 text-muted-foreground">({done}/{total})</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {PHASES.map(phase => {
              const rows = filteredItems(itemsByPhase[phase.key] ?? []);
              const allRows = itemsByPhase[phase.key] ?? [];
              const done = allRows.filter(r => r.is_done).length;
              const total = allRows.length;
              const pct = total === 0 ? 0 : Math.round((done / total) * 100);
              return (
                <TabsContent key={phase.key} value={phase.key} className="mt-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <CardTitle className="text-lg">{phase.label}</CardTitle>
                          <CardDescription>{phase.subtitle}</CardDescription>
                        </div>
                        <Badge variant="outline" className="text-sm">{pct}%</Badge>
                      </div>
                      <Progress value={pct} className="h-2 mt-3" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {rows.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-6">Nenhuma tarefa nesta visualização.</p>
                      ) : rows.map(item => (
                        <div
                          key={item.id}
                          className={cn(
                            'flex items-start gap-3 p-3 rounded-lg border transition-colors',
                            item.is_done
                              ? 'bg-success/5 border-success/20'
                              : 'bg-card border-border hover:bg-accent/30'
                          )}
                        >
                          <Checkbox
                            checked={item.is_done}
                            disabled={!canEdit || toggleMutation.isPending}
                            onCheckedChange={(checked) =>
                              toggleMutation.mutate({ id: item.id, is_done: Boolean(checked) })
                            }
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-2 flex-wrap">
                              <p className={cn(
                                'text-sm font-medium leading-tight',
                                item.is_done ? 'line-through text-muted-foreground' : 'text-foreground'
                              )}>
                                {item.title}
                              </p>
                              <Badge
                                variant="outline"
                                className={cn('text-[10px] py-0 px-1.5 h-5', priorityStyles[item.priority])}
                              >
                                {priorityLabel[item.priority] ?? item.priority}
                              </Badge>
                              {item.category && (
                                <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-5">
                                  {item.category}
                                </Badge>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                {item.description}
                              </p>
                            )}
                            {item.is_done && item.done_at && (
                              <p className="text-[10px] text-success mt-1 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Concluído em {new Date(item.done_at).toLocaleDateString('pt-MZ')}
                              </p>
                            )}
                          </div>
                          {!item.is_done && <Circle className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>
              );
            })}
          </Tabs>
        )}
      </motion.div>
    </MainLayout>
  );
}