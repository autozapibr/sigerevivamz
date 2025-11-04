import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, Settings as SettingsIcon, Save, AlertCircle, Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseQuery, useSupabaseMutation } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/auth';
import { toast } from '@/hooks/use-toast';
import { SchoolConfigForm } from '@/components/school/SchoolConfigForm';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';

export default function Settings() {
  const { user } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [newRole, setNewRole] = useState<UserRole>('PROFESSOR');

  // Verificar se o usuário é admin
  const isAdmin = user?.email === 'admin@reviva.mz';

  // Buscar todos os perfis com seus roles (apenas para admin)
  const { data: profiles, refetch } = useSupabaseQuery(
    ['all-profiles-with-roles'],
    async () => {
      if (!isAdmin) return { data: null, error: null };
      
      // Buscar perfis
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');
      
      if (profilesError || !profilesData) return { data: null, error: profilesError };
      
      // Buscar roles para cada perfil
      const profilesWithRoles = await Promise.all(
        profilesData.map(async (profile) => {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.user_id)
            .maybeSingle();
          
          return {
            ...profile,
            role: roleData?.role || 'PROFESSOR'
          };
        })
      );
      
      return { data: profilesWithRoles, error: null };
    },
    { enabled: isAdmin }
  );

  // Mutation para atualizar role na tabela user_roles
  const updateRoleMutation = useSupabaseMutation(
    async (variables: { userId: string; role: UserRole }) => {
      // Primeiro, buscar o user_id do perfil
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('id', variables.userId)
        .single();
      
      if (!profile) throw new Error('Perfil não encontrado');
      
      // Deletar role antiga
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', profile.user_id);
      
      // Inserir nova role (cast para o tipo do banco)
      const { data, error } = await supabase
        .from('user_roles')
        .insert([{ user_id: profile.user_id, role: variables.role as any }])
        .select()
        .single();
      
      return { data, error };
    },
    {
      onSuccess: () => {
        toast({
          title: 'Sucesso',
          description: 'Perfil atualizado com sucesso!',
        });
        refetch();
        setSelectedUserId('');
      },
      invalidateQueries: [['all-profiles-with-roles']],
    }
  );

  const handleUpdateRole = () => {
    if (!selectedUserId || !newRole) {
      toast({
        title: 'Erro',
        description: 'Selecione um usuário e uma função.',
        variant: 'destructive',
      });
      return;
    }

    updateRoleMutation.mutate({ userId: selectedUserId, role: newRole });
  };

  if (!user) {
    return <div>Carregando...</div>;
  }

  if (!isAdmin) {
    return (
      <MainLayout title="Configurações" subtitle="Configurações do sistema">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Acesso Restrito
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Apenas o administrador (admin@reviva.mz) tem acesso às configurações do sistema.
            </p>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-500';
      case 'DIRETORIA': return 'bg-purple-500';
      case 'SECRETARIA': return 'bg-blue-500';
      case 'FINANCEIRO': return 'bg-green-500';
      case 'PROFESSOR': return 'bg-orange-500';
      case 'PEDAGOGICO': return 'bg-teal-500';
      case 'ENCARREGADO': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <MainLayout title="Configurações" subtitle="Gerenciar perfis de usuário e configurações do sistema">
      <Tabs defaultValue="onboarding" className="space-y-6">
        <TabsList>
          <TabsTrigger value="onboarding">Primeiros Passos</TabsTrigger>
          <TabsTrigger value="school">Escola</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
        </TabsList>

        <TabsContent value="onboarding">
          <OnboardingWizard />
        </TabsContent>

        <TabsContent value="school">
          <SchoolConfigForm />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
        {/* Gestão de Perfis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Gestão de Perfis de Usuário
              </CardTitle>
              <CardDescription>
                Gerencie as funções e permissões dos usuários no sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Lista de usuários */}
              <div>
                <Label htmlFor="user-select" className="text-sm font-medium">
                  Usuários Cadastrados
                </Label>
                <div className="mt-2 space-y-2">
                  {profiles?.map((profile) => (
                    <div
                      key={profile.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                          <span className="text-xs text-primary-foreground font-medium">
                            {profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{profile.full_name}</p>
                          <p className="text-sm text-muted-foreground">ID: {profile.id}</p>
                        </div>
                      </div>
                      <Badge 
                        className={`${getRoleBadgeColor(profile.role as UserRole)} text-white`}
                      >
                        {profile.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Atualizar perfil */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Alterar Função de Usuário</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="user-select">Selecionar Usuário</Label>
                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha um usuário" />
                      </SelectTrigger>
                      <SelectContent>
                        {profiles?.map((profile) => (
                          <SelectItem key={profile.id} value={profile.id}>
                            {profile.full_name} ({profile.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="role-select">Nova Função</Label>
                    <Select value={newRole} onValueChange={(value) => setNewRole(value as UserRole)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">ADMIN - Acesso Total</SelectItem>
                        <SelectItem value="DIRETORIA">DIRETORIA - Acesso Total</SelectItem>
                        <SelectItem value="SECRETARIA">SECRETARIA - Gestão Escolar + RH</SelectItem>
                        <SelectItem value="FINANCEIRO">FINANCEIRO - Gestão Financeira</SelectItem>
                        <SelectItem value="PROFESSOR">PROFESSOR - Gestão Pedagógica</SelectItem>
                        <SelectItem value="PEDAGOGICO">PEDAGÓGICO - Gestão Pedagógica</SelectItem>
                        <SelectItem value="ENCARREGADO">ENCARREGADO - Portal do Encarregado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button 
                      onClick={handleUpdateRole}
                      disabled={updateRoleMutation.isPending || !selectedUserId}
                      className="w-full"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {updateRoleMutation.isPending ? 'Salvando...' : 'Atualizar'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
        {/* Informações do Sistema */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Informações do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Sistema</Label>
                  <p className="text-sm text-muted-foreground">SGE REVIVA v1.0</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Administrador</Label>
                  <p className="text-sm text-muted-foreground">{user.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Total de Usuários</Label>
                  <p className="text-sm text-muted-foreground">{profiles?.length || 0}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Online
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Funções e Permissões */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Funções e Permissões
              </CardTitle>
              <CardDescription>
                Descrição das funções disponíveis no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Badge className="bg-purple-500 text-white">DIRETORIA</Badge>
                    <p className="text-sm text-muted-foreground">
                      Acesso total ao sistema, relatórios executivos, gestão financeira completa
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Badge className="bg-blue-500 text-white">SECRETARIA</Badge>
                    <p className="text-sm text-muted-foreground">
                      Gestão de estudantes, professores, turmas, matrículas e documentos
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Badge className="bg-green-500 text-white">FINANCEIRO</Badge>
                    <p className="text-sm text-muted-foreground">
                      Gestão financeira, pagamentos, relatórios financeiros
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Badge className="bg-orange-500 text-white">PROFESSOR</Badge>
                    <p className="text-sm text-muted-foreground">
                      Lançamento de notas, presenças e acesso aos seus educandos
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Badge className="bg-cyan-500 text-white">ENCARREGADO</Badge>
                    <p className="text-sm text-muted-foreground">
                      Acompanhamento de notas, frequência e situação financeira dos educandos
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}