import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { UserPlus, Trash2, KeyRound, Shield, Search, Users, Link2 } from 'lucide-react';
import { UserLinkDialog } from '@/components/users/UserLinkDialog';
import { UserRole } from '@/types/auth';
import { InvitationManager } from '@/components/invitations/InvitationManager';

interface SystemUser {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed: boolean;
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  DIRETORIA: 'Diretoria',
  SECRETARIA: 'Secretária',
  FINANCEIRO: 'Financeiro',
  PROFESSOR: 'Professor',
  PEDAGOGICO: 'Pedagógico',
  ENCARREGADO: 'Encarregado',
  ALUNO: 'Aluno',
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-destructive/10 text-destructive',
  DIRETORIA: 'bg-primary/10 text-primary',
  SECRETARIA: 'bg-secondary/10 text-secondary',
  FINANCEIRO: 'bg-accent/50 text-accent-foreground',
  PROFESSOR: 'bg-muted text-muted-foreground',
  PEDAGOGICO: 'bg-muted text-muted-foreground',
  ENCARREGADO: 'bg-muted text-muted-foreground',
  ALUNO: 'bg-muted text-muted-foreground',
};

async function callManageUsers(action: string, payload: Record<string, any> = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Não autenticado');

  const res = await supabase.functions.invoke('manage-users', {
    body: { action, ...payload },
  });

  if (res.error) throw new Error(res.error.message);
  if (res.data?.error) throw new Error(res.data.error);
  return res.data;
}

export default function UtilizadoresPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState<string | null>(null);
  const [linkOpen, setLinkOpen] = useState<SystemUser | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // Form state
  const [form, setForm] = useState({ email: '', password: '', full_name: '', role: 'PROFESSOR' as string });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['system-users'],
    queryFn: async () => {
      const result = await callManageUsers('list');
      return (result.users || []) as SystemUser[];
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => callManageUsers('create', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-users'] });
      toast({ title: 'Sucesso', description: 'Utilizador criado com sucesso' });
      setCreateOpen(false);
      setForm({ email: '', password: '', full_name: '', role: 'PROFESSOR' });
    },
    onError: (err: Error) => {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (user_id: string) => callManageUsers('delete', { user_id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-users'] });
      toast({ title: 'Sucesso', description: 'Utilizador removido' });
    },
    onError: (err: Error) => {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ user_id, new_password }: { user_id: string; new_password: string }) =>
      callManageUsers('reset_password', { user_id, new_password }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-users'] });
      toast({ title: 'Sucesso', description: 'Palavra-passe redefinida' });
      setResetOpen(null);
      setNewPassword('');
    },
    onError: (err: Error) => {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    },
  });

  const filteredUsers = users.filter(u => {
    if (!search) return true;
    const s = search.toLowerCase();
    return u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s) || (ROLE_LABELS[u.role] || u.role).toLowerCase().includes(s);
  });

  const availableRoles: string[] = user?.role === 'SECRETARIA'
    ? ['SECRETARIA', 'FINANCEIRO', 'PROFESSOR', 'PEDAGOGICO', 'ENCARREGADO', 'ALUNO']
    : ['ADMIN', 'DIRETORIA', 'SECRETARIA', 'FINANCEIRO', 'PROFESSOR', 'PEDAGOGICO', 'ENCARREGADO', 'ALUNO'];

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="Gestão de Utilizadores"
          description="Criar e gerir contas de acesso ao sistema"
          icon={Users}
        />

        <Card className="surface-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg">Utilizadores do Sistema</CardTitle>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  Novo Utilizador
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Utilizador</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!form.email || !form.password || !form.full_name) {
                      toast({ title: 'Erro', description: 'Preencha todos os campos', variant: 'destructive' });
                      return;
                    }
                    if (form.password.length < 6) {
                      toast({ title: 'Erro', description: 'A palavra-passe deve ter no mínimo 6 caracteres', variant: 'destructive' });
                      return;
                    }
                    createMutation.mutate(form);
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label>Nome Completo</Label>
                    <Input
                      value={form.full_name}
                      onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))}
                      placeholder="Nome do utilizador"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Palavra-passe Inicial</Label>
                    <Input
                      type="text"
                      value={form.password}
                      onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                      placeholder="Mín. 6 caracteres"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Função / Perfil</Label>
                    <Select value={form.role} onValueChange={(v) => setForm(f => ({ ...f, role: v }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRoles.map(r => (
                          <SelectItem key={r} value={r}>{ROLE_LABELS[r] || r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline" type="button">Cancelar</Button>
                    </DialogClose>
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending ? 'Criando...' : 'Criar Utilizador'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por nome, email ou função..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Users Table */}
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando utilizadores...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Nenhum utilizador encontrado</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Nome</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Email</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Função</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Último Acesso</th>
                      <th className="text-right py-3 px-2 font-medium text-muted-foreground">Acções</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                        <td className="py-3 px-2 font-medium">{u.name}</td>
                        <td className="py-3 px-2 text-muted-foreground">{u.email}</td>
                        <td className="py-3 px-2">
                          <Badge variant="outline" className={ROLE_COLORS[u.role] || ''}>
                            <Shield className="w-3 h-3 mr-1" />
                            {ROLE_LABELS[u.role] || u.role}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-muted-foreground">
                          {u.last_sign_in_at
                            ? new Date(u.last_sign_in_at).toLocaleDateString('pt-MZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                            : 'Nunca'}
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center justify-end gap-1">
                            {/* Reset password */}
                            <Dialog open={resetOpen === u.id} onOpenChange={(open) => { setResetOpen(open ? u.id : null); setNewPassword(''); }}>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" title="Redefinir palavra-passe">
                                  <KeyRound className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Redefinir Palavra-passe</DialogTitle>
                                </DialogHeader>
                                <p className="text-sm text-muted-foreground">
                                  Redefinir a palavra-passe de <strong>{u.name}</strong> ({u.email})
                                </p>
                                <div className="space-y-2">
                                  <Label>Nova Palavra-passe</Label>
                                  <Input
                                    type="text"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Mín. 6 caracteres"
                                  />
                                </div>
                                <DialogFooter>
                                  <DialogClose asChild>
                                    <Button variant="outline">Cancelar</Button>
                                  </DialogClose>
                                  <Button
                                    disabled={resetPasswordMutation.isPending || newPassword.length < 6}
                                    onClick={() => resetPasswordMutation.mutate({ user_id: u.id, new_password: newPassword })}
                                  >
                                    {resetPasswordMutation.isPending ? 'Redefinindo...' : 'Redefinir'}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            {/* Delete */}
                            {u.id !== user?.id && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                title="Remover utilizador"
                                onClick={() => {
                                  if (confirm(`Tem a certeza que deseja remover ${u.name}?`)) {
                                    deleteMutation.mutate(u.id);
                                  }
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
        <InvitationManager />
      </div>
    </MainLayout>
  );
}
