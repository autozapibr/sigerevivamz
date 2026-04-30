import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import {
  Database, Download, RefreshCw, Trash2, Calendar, HardDrive,
  AlertTriangle, CheckCircle2, Copy, ExternalLink,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const PROJECT_REF = "ghwhbdpdkstxejofztny";
const FUNCTION_URL = `https://${PROJECT_REF}.supabase.co/functions/v1/database-backup`;

const CRON_SQL = `-- Agendar backup semanal automático (domingos 02:00 Maputo = 00:00 UTC)
-- Substitua <SERVICE_ROLE_KEY> pela sua service_role_key
-- (Settings → API → service_role secret)

select cron.schedule(
  'siger-database-backup-weekly',
  '0 0 * * 0',
  $$
  select net.http_post(
    url := '${FUNCTION_URL}',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer <SERVICE_ROLE_KEY>'
    ),
    body := jsonb_build_object('source', 'pg_cron')
  );
  $$
);`;

interface BackupFile {
  name: string;
  created_at: string;
  metadata?: { size?: number };
}

export default function BackupsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [running, setRunning] = useState(false);

  const isAuthorized = user?.role === "ADMIN" || user?.role === "DIRETORIA";

  const { data: backups = [], isLoading } = useQuery({
    queryKey: ["database-backups"],
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from("database-backups")
        .list("", { limit: 100, sortBy: { column: "created_at", order: "desc" } });
      if (error) throw error;
      return (data ?? []) as BackupFile[];
    },
    enabled: isAuthorized,
  });

  const runBackup = useMutation({
    mutationFn: async () => {
      setRunning(true);
      const { data, error } = await supabase.functions.invoke("database-backup", {
        body: { source: "manual" },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      toast({
        title: "Backup criado com sucesso",
        description: `${data?.tables ?? "?"} tabelas · ${data?.total_rows ?? 0} registos · ${data?.filename}`,
      });
      qc.invalidateQueries({ queryKey: ["database-backups"] });
    },
    onError: (err: any) => {
      toast({
        variant: "destructive",
        title: "Erro ao criar backup",
        description: err?.message ?? "Ocorreu um erro inesperado.",
      });
    },
    onSettled: () => setRunning(false),
  });

  const deleteBackup = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase.storage.from("database-backups").remove([name]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Backup eliminado" });
      qc.invalidateQueries({ queryKey: ["database-backups"] });
    },
  });

  const downloadBackup = async (name: string) => {
    const { data, error } = await supabase.storage
      .from("database-backups")
      .createSignedUrl(name, 300);
    if (error || !data) {
      toast({ variant: "destructive", title: "Erro", description: error?.message });
      return;
    }
    window.open(data.signedUrl, "_blank");
  };

  const copySql = () => {
    navigator.clipboard.writeText(CRON_SQL);
    toast({ title: "SQL copiado para a área de transferência" });
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  if (!isAuthorized) {
    return (
      <MainLayout title="Backups" subtitle="Cópias de segurança da base de dados">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Acesso negado</AlertTitle>
          <AlertDescription>
            Apenas utilizadores com perfil ADMIN ou DIRETORIA podem aceder a esta secção.
          </AlertDescription>
        </Alert>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title="Backups"
      subtitle="Cópias de segurança automáticas da base de dados"
    >
      <motion.div
        className="space-y-6 max-w-5xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Estado e acção manual */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Database className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle>Backup Manual</CardTitle>
                <CardDescription>
                  Crie uma cópia de segurança imediata (JSON com todas as tabelas).
                </CardDescription>
              </div>
              <Button
                onClick={() => runBackup.mutate()}
                disabled={running}
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${running ? "animate-spin" : ""}`} />
                {running ? "A executar..." : "Fazer backup agora"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Total de backups</p>
                <p className="text-2xl font-semibold">{backups.length}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Último backup</p>
                <p className="text-sm font-medium">
                  {backups[0]
                    ? format(new Date(backups[0].created_at), "dd 'de' MMMM, HH:mm", { locale: pt })
                    : "—"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Retenção</p>
                <p className="text-sm font-medium">12 backups (≈ 3 meses)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agendamento */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Calendar className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <CardTitle>Agendamento Automático</CardTitle>
                <CardDescription>
                  Para activar backups semanais automáticos, execute o SQL abaixo uma única vez no SQL Editor do Supabase.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Acção manual necessária (uma vez)</AlertTitle>
              <AlertDescription>
                Por motivos de segurança, a chave <code className="text-xs">service_role</code> nunca é guardada
                no código da aplicação. Substitua <code className="text-xs">&lt;SERVICE_ROLE_KEY&gt;</code> pela
                sua chave (Dashboard → Settings → API → <em>service_role secret</em>) antes de executar.
              </AlertDescription>
            </Alert>

            <div className="relative rounded-lg border bg-muted/30 p-4">
              <ScrollArea className="h-[260px]">
                <pre className="text-xs font-mono whitespace-pre-wrap pr-12">
                  {CRON_SQL}
                </pre>
              </ScrollArea>
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2 gap-2"
                onClick={copySql}
              >
                <Copy className="w-3.5 h-3.5" />
                Copiar
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm" className="gap-2">
                <a
                  href={`https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Abrir SQL Editor
                </a>
              </Button>
              <Button asChild variant="outline" size="sm" className="gap-2">
                <a
                  href={`https://supabase.com/dashboard/project/${PROJECT_REF}/settings/api`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Obter service_role key
                </a>
              </Button>
            </div>

            <Separator />

            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                <span><strong>Frequência:</strong> Semanal — domingos 02:00 (hora de Maputo)</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                <span><strong>Conteúdo:</strong> 32 tabelas de domínio em formato JSON</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                <span><strong>Armazenamento:</strong> Bucket privado <code className="text-xs">database-backups</code></span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                <span><strong>Limpeza:</strong> Mantém os últimos 12 backups</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de backups */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <HardDrive className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <CardTitle>Histórico de Backups</CardTitle>
                <CardDescription>
                  Lista dos ficheiros JSON guardados no bucket privado.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground py-8 text-center">A carregar...</p>
            ) : backups.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <Database className="w-10 h-10 text-muted-foreground/40 mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Ainda não existem backups. Crie o primeiro com "Fazer backup agora".
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {backups.map((b) => (
                  <div
                    key={b.name}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-md bg-muted">
                        <Database className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{b.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(b.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: pt })}
                          {" · "}
                          {formatBytes(b.metadata?.size)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className="hidden sm:inline-flex">JSON</Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => downloadBackup(b.name)}
                        className="gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Descarregar</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (confirm(`Eliminar definitivamente "${b.name}"?`)) {
                            deleteBackup.mutate(b.name);
                          }
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </MainLayout>
  );
}
