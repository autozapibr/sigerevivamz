import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  Users, UserPlus, Trash2, KeyRound, Shield, Search,
  GraduationCap, NotebookPen, DollarSign, UsersRound, Settings,
  ShieldCheck, Lock
} from 'lucide-react';

// ─── Types ───
interface SystemUser {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed: boolean;
}

interface ModuleAccess {
  id: number;
  role: string;
  module_key: string;
  is_enabled: boolean;
}

// ─── Constants ───
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
  SECRETARIA: 'bg-secondary/10 text-secondary-foreground',
  FINANCEIRO: 'bg-accent/50 text-accent-foreground',
  PROFESSOR: 'bg-muted text-muted-foreground',
  PEDAGOGICO: 'bg-muted text-muted-foreground',
  ENCARREGADO: 'bg-muted text-muted-foreground',
  ALUNO: 'bg-muted text-muted-foreground',
};

const MODULE_INFO: Record<string, { label: string; icon: React.ElementType; description: string }> = {
  gestao_escolar: { label: 'Gestão Escolar', icon: GraduationCap, description: 'Estudantes, matrículas, turmas, disciplinas, calendário, biblioteca' },
  gestao_pedagogica: { label: 'Pedagógico', icon: NotebookPen, description: 'Pauta digital, assiduidade, planos de aula, currículo' },
  gestao_financeira: { label: 'Financeiro', icon: DollarSign, description: 'Livro caixa, propinas, cobranças, relatórios financeiros' },
  gestao_rh: { label: 'Recursos Humanos', icon: UsersRound, description: 'Professores, colaboradores, documentação, contratos' },
  configuracoes: { label: 'Configurações', icon: Settings, description: 'Aparência, integrações, IA, sistema' },
};

const ALL_ROLES = ['ADMIN', 'DIRETORIA', 'SECRETARIA', 'FINANCEIRO', 'PROFESSOR', 'PEDAGOGICO', 'ENCARREGADO', 'ALUNO'];
const MODULE_KEYS = ['gestao_escolar', 'gestao_pedagogica', 'gestao_financeira', 'gestao_rh', 'configuracoes'];

// ─── API ───
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

// ─── Page ───
export default function PerfisUtilizadoresPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="Perfis e Utilizadores"
          description="Gerir contas de acesso e permissões por perfil"
          icon={ShieldCheck}
        />

        {!isAdmin ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
              <Lock className="w-12 h-12 text-muted-foreground" />
              <p className="text-muted-foreground text-center">
                Apenas o perfil <strong>Administrador</strong> pode gerir utilizadores e permissões.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="users" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="users" className="gap-2">
                <Users className="w-4 h-4" />
                Utilizadores
              </TabsTrigger>
              <TabsTrigger value="permissions" className="gap-2">
                <Shield className="w-4 h-4" />
                Permissões por Perfil
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <UsersTab />
            </TabsContent>

            <TabsContent value="permissions">
              <PermissionsTab />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </MainLayout>
  );
}

// ─── Users Tab ───
function UsersTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [form, setForm] = useState({ email: '', password: '', full_name: '', role: 'PROFESSOR' });

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
      toast({ title: 'Sucesso', description: 'Palavra-passe redefinida' });
      setResetOpen(null);
      setNewPassword('');
    },
    onError: (err: Error) => {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ user_id, role }: { user_id: string; role: string }) =>
      callManageUsers('update_role', { user_id, role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-users'] });
      toast({ title: 'Sucesso', description: 'Perfil actualizado' });
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

  return (
    <Card className="surface-card">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        <div>
          <CardTitle className="text-lg">Utilizadores do Sistema</CardTitle>
          <CardDescription>Criar, editar e gerir contas de acesso</CardDescription>
        </div>
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
                <Input value={form.full_name} onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Nome do utilizador" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@exemplo.com" />
              </div>
              <div className="space-y-2">
                <Label>Palavra-passe Inicial</Label>
                <Input type="text" value={form.password} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Mín. 6 caracteres" />
              </div>
              <div className="space-y-2">
                <Label>Função / Perfil</Label>
                <Select value={form.role} onValueChange={(v) => setForm(f => ({ ...f, role: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ALL_ROLES.map(r => (
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
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Pesquisar por nome, email ou função..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>

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
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Perfil</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground hidden md:table-cell">Último Acesso</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">Acções</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                    <td className="py-3 px-2 font-medium">{u.name}</td>
                    <td className="py-3 px-2 text-muted-foreground text-xs sm:text-sm">{u.email}</td>
                    <td className="py-3 px-2">
                      <Select
                        value={u.role}
                        onValueChange={(newRole) => {
                          if (newRole !== u.role) {
                            updateRoleMutation.mutate({ user_id: u.id, role: newRole });
                          }
                        }}
                      >
                        <SelectTrigger className="w-[140px] h-8 text-xs">
                          <Badge variant="outline" className={`${ROLE_COLORS[u.role] || ''} pointer-events-none`}>
                            <Shield className="w-3 h-3 mr-1" />
                            {ROLE_LABELS[u.role] || u.role}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {ALL_ROLES.map(r => (
                            <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-3 px-2 text-muted-foreground hidden md:table-cell">
                      {u.last_sign_in_at
                        ? new Date(u.last_sign_in_at).toLocaleDateString('pt-MZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : 'Nunca'}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center justify-end gap-1">
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
                              <Input type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mín. 6 caracteres" />
                            </div>
                            <DialogFooter>
                              <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                              <Button
                                disabled={resetPasswordMutation.isPending || newPassword.length < 6}
                                onClick={() => resetPasswordMutation.mutate({ user_id: u.id, new_password: newPassword })}
                              >
                                {resetPasswordMutation.isPending ? 'Redefinindo...' : 'Redefinir'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

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
  );
}

// ─── Permissions Tab ───
function PermissionsTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState('SECRETARIA');

  const { data: moduleAccess = [], isLoading } = useQuery({
    queryKey: ['role-module-access'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('role_module_access')
        .select('*')
        .order('role');
      if (error) throw error;
      return data as ModuleAccess[];
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_enabled }: { id: number; is_enabled: boolean }) => {
      const { error } = await supabase
        .from('role_module_access')
        .update({ is_enabled })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-module-access'] });
    },
    onError: (err: Error) => {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    },
  });

  const roleAccess = moduleAccess.filter(a => a.role === selectedRole);
  const isProtectedRole = selectedRole === 'ADMIN' || selectedRole === 'DIRETORIA';

  return (
    <Card className="surface-card">
      <CardHeader>
        <CardTitle className="text-lg">Permissões de Acesso por Perfil</CardTitle>
        <CardDescription>
          Defina quais módulos do sistema cada perfil de utilizador pode aceder
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Role selector */}
        <div className="space-y-2">
          <Label>Seleccione o perfil</Label>
          <div className="flex flex-wrap gap-2">
            {ALL_ROLES.map(r => (
              <Button
                key={r}
                variant={selectedRole === r ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedRole(r)}
                className="gap-1.5"
              >
                <Shield className="w-3.5 h-3.5" />
                {ROLE_LABELS[r]}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Module toggles */}
        {isProtectedRole && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <Lock className="w-4 h-4 text-primary flex-shrink-0" />
            <p className="text-sm text-primary">
              O perfil <strong>{ROLE_LABELS[selectedRole]}</strong> possui acesso total ao sistema e não pode ser restringido.
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando permissões...</div>
        ) : (
          <div className="space-y-3">
            {MODULE_KEYS.map(moduleKey => {
              const info = MODULE_INFO[moduleKey];
              const access = roleAccess.find(a => a.module_key === moduleKey);
              const enabled = isProtectedRole ? true : (access?.is_enabled ?? false);
              const Icon = info.icon;

              return (
                <div
                  key={moduleKey}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                    enabled ? 'bg-primary/5 border-primary/20' : 'bg-muted/30 border-border'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${enabled ? 'bg-primary/10' : 'bg-muted'}`}>
                      <Icon className={`w-5 h-5 ${enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <p className={`font-medium text-sm ${enabled ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {info.label}
                      </p>
                      <p className="text-xs text-muted-foreground">{info.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={enabled}
                    disabled={isProtectedRole || toggleMutation.isPending}
                    onCheckedChange={(checked) => {
                      if (access) {
                        toggleMutation.mutate({ id: access.id, is_enabled: checked });
                      }
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Summary */}
        <div className="pt-2">
          <p className="text-xs text-muted-foreground">
            {isProtectedRole
              ? `${ROLE_LABELS[selectedRole]} tem acesso a todos os ${MODULE_KEYS.length} módulos.`
              : `${ROLE_LABELS[selectedRole]} tem acesso a ${roleAccess.filter(a => a.is_enabled).length} de ${MODULE_KEYS.length} módulos.`
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
