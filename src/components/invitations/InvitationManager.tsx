import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { LinkIcon, Copy, Check, Trash2, Clock, Send, UserPlus } from 'lucide-react';

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

interface Invitation {
  id: string;
  token: string;
  email: string | null;
  intended_role: string;
  intended_name: string | null;
  created_at: string;
  expires_at: string;
  is_used: boolean;
  used_at: string | null;
  notes: string | null;
}

export function InvitationManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [form, setForm] = useState({ email: '', intended_name: '', intended_role: 'PROFESSOR', notes: '', expires_days: '7' });

  const availableRoles = user?.role === 'SECRETARIA'
    ? ['SECRETARIA', 'FINANCEIRO', 'PROFESSOR', 'PEDAGOGICO', 'ENCARREGADO', 'ALUNO']
    : ['ADMIN', 'DIRETORIA', 'SECRETARIA', 'FINANCEIRO', 'PROFESSOR', 'PEDAGOGICO', 'ENCARREGADO', 'ALUNO'];

  const { data: invitations = [], isLoading } = useQuery({
    queryKey: ['invitations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('registration_invitations')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as Invitation[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (formData: typeof form) => {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(formData.expires_days));
      
      const { data, error } = await supabase
        .from('registration_invitations')
        .insert({
          email: formData.email || null,
          intended_name: formData.intended_name || null,
          intended_role: formData.intended_role as any,
          notes: formData.notes || null,
          created_by: user!.id,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      toast({ title: 'Sucesso', description: 'Convite criado com sucesso' });
      setCreateOpen(false);
      setForm({ email: '', intended_name: '', intended_role: 'PROFESSOR', notes: '', expires_days: '7' });
    },
    onError: (err: Error) => {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('registration_invitations').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      toast({ title: 'Convite removido' });
    },
  });

  const getInviteUrl = (token: string) => {
    return `${window.location.origin}/registar/${token}`;
  };

  const copyLink = async (token: string, id: string) => {
    await navigator.clipboard.writeText(getInviteUrl(token));
    setCopiedId(id);
    toast({ title: 'Link copiado!', description: 'O link de convite foi copiado para a área de transferência.' });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const activeInvitations = invitations.filter(i => !i.is_used && new Date(i.expires_at) > new Date());
  const usedOrExpired = invitations.filter(i => i.is_used || new Date(i.expires_at) <= new Date());

  return (
    <Card className="surface-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <LinkIcon className="w-5 h-5" />
            Links de Convite
          </CardTitle>
          <CardDescription>
            Gere links de uso único para registo de novos utilizadores
          </CardDescription>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <UserPlus className="w-4 h-4" />
              Novo Convite
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Link de Convite</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do Convidado (opcional)</Label>
                <Input
                  value={form.intended_name}
                  onChange={(e) => setForm(f => ({ ...f, intended_name: e.target.value }))}
                  placeholder="Nome completo"
                />
              </div>
              <div className="space-y-2">
                <Label>Email do Convidado (opcional)</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="email@exemplo.com"
                />
                <p className="text-xs text-muted-foreground">Se preenchido, o email será fixo no formulário de registo</p>
              </div>
              <div className="space-y-2">
                <Label>Função / Perfil</Label>
                <Select value={form.intended_role} onValueChange={(v) => setForm(f => ({ ...f, intended_role: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {availableRoles.map(r => (
                      <SelectItem key={r} value={r}>{ROLE_LABELS[r] || r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Validade</Label>
                <Select value={form.expires_days} onValueChange={(v) => setForm(f => ({ ...f, expires_days: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 dia</SelectItem>
                    <SelectItem value="3">3 dias</SelectItem>
                    <SelectItem value="7">7 dias</SelectItem>
                    <SelectItem value="14">14 dias</SelectItem>
                    <SelectItem value="30">30 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Notas (opcional)</Label>
                <Input
                  value={form.notes}
                  onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Observações internas"
                />
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline" type="button">Cancelar</Button></DialogClose>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Criando...' : 'Gerar Link'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-center py-4 text-muted-foreground">Carregando...</p>
        ) : activeInvitations.length === 0 && usedOrExpired.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <LinkIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p>Nenhum convite criado ainda</p>
          </div>
        ) : (
          <>
            {activeInvitations.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Activos ({activeInvitations.length})</h4>
                {activeInvitations.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm truncate">
                          {inv.intended_name || inv.email || 'Sem nome'}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {ROLE_LABELS[inv.intended_role] || inv.intended_role}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Expira: {new Date(inv.expires_at).toLocaleDateString('pt-MZ', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Copiar link"
                        onClick={() => copyLink(inv.token, inv.id)}
                      >
                        {copiedId === inv.id ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        title="Remover convite"
                        onClick={() => {
                          if (confirm('Remover este convite?')) deleteMutation.mutate(inv.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {usedOrExpired.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Utilizados / Expirados ({usedOrExpired.length})</h4>
                {usedOrExpired.slice(0, 5).map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/30 opacity-60">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm truncate">
                          {inv.intended_name || inv.email || 'Sem nome'}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {inv.is_used ? 'Utilizado' : 'Expirado'}
                        </Badge>
                      </div>
                      {inv.used_at && (
                        <span className="text-xs text-muted-foreground">
                          Usado em: {new Date(inv.used_at).toLocaleDateString('pt-MZ')}
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteMutation.mutate(inv.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
