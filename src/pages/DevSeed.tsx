import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Database, Users, GraduationCap, Wallet } from "lucide-react";
import { Link } from "react-router-dom";

interface SeedUserRow {
  email: string;
  password: string;
  role: string;
  status?: string;
}

interface SeedDataResult {
  success: boolean;
  message?: string;
  totals?: Record<string, number>;
  error?: string;
}

const DevSeed: React.FC = () => {
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [rows, setRows] = useState<SeedUserRow[] | null>(null);
  const [dataResult, setDataResult] = useState<SeedDataResult | null>(null);

  const handleSeedUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase.functions.invoke("seed-users", {
        method: "POST",
      });
      if (error) throw error;

      if (data?.ok) {
        const mapped = (data.credentials as any[]).map((u: any) => ({
          email: u.email,
          password: u.password,
          role: u.role,
        }));
        setRows(mapped);
        toast.success("Usuários de teste prontos!");
      } else {
        throw new Error(data?.error || "Falha ao criar usuários");
      }
    } catch (e: any) {
      toast.error(e?.message || "Erro ao criar usuários de teste");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSeedData = async () => {
    setLoadingData(true);
    try {
      const { data, error } = await supabase.functions.invoke("seed-data", {
        method: "POST",
      });
      if (error) throw error;

      if (data?.success) {
        setDataResult(data);
        toast.success("Dados de teste criados com sucesso!");
      } else {
        throw new Error(data?.error || "Falha ao criar dados");
      }
    } catch (e: any) {
      toast.error(e?.message || "Erro ao criar dados de teste");
    } finally {
      setLoadingData(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-4xl space-y-6">
        {/* Header */}
        <Card className="bg-card/50 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Database className="h-6 w-6 text-primary" /> 
              Ambiente de Desenvolvimento
            </CardTitle>
            <CardDescription>
              Ferramentas para popular o banco de dados com dados de teste realistas para o sistema escolar moçambicano.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Seed Users Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" /> 
              1. Usuários de Teste
            </CardTitle>
            <CardDescription>
              Cria 4 contas (DIRETORIA, SECRETARIA, FINANCEIRO, PROFESSOR) com senha 123456.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-3">
              <Button onClick={handleSeedUsers} disabled={loadingUsers}>
                {loadingUsers ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Criando...
                  </span>
                ) : (
                  <>
                    <Users className="h-4 w-4 mr-2" />
                    Criar Usuários
                  </>
                )}
              </Button>
            </div>

            {rows && (
              <Table>
                <TableCaption>Use estas credenciais para entrar no sistema.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Senha</TableHead>
                    <TableHead>Papel</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.email}>
                      <TableCell className="font-medium">{r.email}</TableCell>
                      <TableCell>
                        <code className="px-1.5 py-0.5 rounded bg-muted">{r.password}</code>
                      </TableCell>
                      <TableCell>{r.role}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Seed Data Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" /> 
              2. Dados Escolares
            </CardTitle>
            <CardDescription>
              Popula o banco com: 50 educandos, 10 professores, turmas, disciplinas, matrículas, propinas e transações.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-3">
              <Button onClick={handleSeedData} disabled={loadingData} variant="secondary">
                {loadingData ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Populando...
                  </span>
                ) : (
                  <>
                    <Database className="h-4 w-4 mr-2" />
                    Popular Dados
                  </>
                )}
              </Button>
            </div>

            {dataResult?.totals && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(dataResult.totals).map(([key, value]) => (
                  <div key={key} className="p-4 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-bold text-primary">{value}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {key.replace('_', ' ')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/login">Ir para Login</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/matriculas">Matrículas</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/students">Estudantes</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/financeiro">Financeiro</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default DevSeed;
