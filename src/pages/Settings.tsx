import React from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, Sun, Moon, Monitor, 
  User, Bell, Shield, Database, Palette, Globe
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { IntegrationsSection } from '@/components/settings/IntegrationsSection';
import { LLMConfigSection } from '@/components/settings/LLMConfigSection';
import { LessonPlanConfigSection } from '@/components/settings/LessonPlanConfigSection';

export default function Settings() {
  const { theme, setTheme, isDark } = useTheme();
  const { user } = useAuth();

  const themeOptions = [
    { value: 'light', label: 'Claro', icon: Sun },
    { value: 'dark', label: 'Escuro', icon: Moon },
    { value: 'system', label: 'Sistema', icon: Monitor },
  ] as const;

  return (
    <MainLayout title="Configurações" subtitle="Personalize o sistema">
      <motion.div 
        className="space-y-6 max-w-4xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Appearance */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Palette className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Aparência</CardTitle>
                <CardDescription>Personalize a aparência do sistema</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Theme Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Tema</Label>
              <div className="grid grid-cols-3 gap-3">
                {themeOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = theme === option.value;
                  return (
                    <Button
                      key={option.value}
                      variant="outline"
                      className={`h-auto py-4 flex-col gap-2 transition-all ${
                        isSelected 
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => setTheme(option.value)}
                    >
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className={`text-sm ${isSelected ? 'font-medium text-primary' : ''}`}>
                        {option.label}
                      </span>
                    </Button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                O tema do sistema adapta-se às suas preferências. Escolha "Sistema" para seguir as configurações do seu dispositivo.
              </p>
            </div>

            <Separator />

            {/* Preview */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Pré-visualização</Label>
              <div className={`p-4 rounded-xl border ${isDark ? 'bg-card' : 'bg-muted/30'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                    <SettingsIcon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Exemplo de Card</p>
                    <p className="text-sm text-muted-foreground">Texto secundário</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge>Activo</Badge>
                  <Badge variant="secondary">Pendente</Badge>
                  <Badge variant="destructive">Urgente</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <User className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <CardTitle>Perfil</CardTitle>
                <CardDescription>Informações da sua conta</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Nome Completo</Label>
                <p className="font-medium">{user?.name || '-'}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Email</Label>
                <p className="font-medium">{user?.email || '-'}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Função</Label>
                <Badge variant="secondary" className="capitalize">
                  {user?.role.toLowerCase() || '-'}
                </Badge>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Estado</Label>
                <Badge className="bg-success text-success-foreground">Activo</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Bell className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <CardTitle>Notificações</CardTitle>
                <CardDescription>Configure as suas preferências de notificação</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificações por email</Label>
                <p className="text-xs text-muted-foreground">
                  Receber alertas importantes por email
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificações push</Label>
                <p className="text-xs text-muted-foreground">
                  Receber notificações no navegador
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Resumo diário</Label>
                <p className="text-xs text-muted-foreground">
                  Receber um resumo diário das actividades
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Language & Region */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Globe className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <CardTitle>Idioma e Região</CardTitle>
                <CardDescription>Configurações regionais do sistema</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Idioma</Label>
                <p className="font-medium">🇲🇿 Português (Moçambique)</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Moeda</Label>
                <p className="font-medium">MZN (Metical)</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Fuso Horário</Label>
                <p className="font-medium">África/Maputo (UTC+2)</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Formato de Data</Label>
                <p className="font-medium">DD/MM/AAAA</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* LLM / AI Config - Only for Admin/Diretoria */}
        {(user?.role === 'ADMIN' || user?.role === 'DIRETORIA') && (
          <LLMConfigSection />
        )}

        {/* Lesson Plan Config - Only for Admin/Diretoria */}
        {(user?.role === 'ADMIN' || user?.role === 'DIRETORIA') && (
          <LessonPlanConfigSection />
        )}

        {/* Integrations - Only for Admin/Diretoria */}
        {(user?.role === 'ADMIN' || user?.role === 'DIRETORIA') && (
          <IntegrationsSection />
        )}

        {/* System Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Database className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <CardTitle>Informação do Sistema</CardTitle>
                <CardDescription>Detalhes técnicos do SiGER</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Versão</Label>
                <p className="font-medium">2.0.0</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Base de Dados</Label>
                <Badge variant="outline" className="text-success border-success/30">
                  Conectado
                </Badge>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Última Actualização</Label>
                <p className="font-medium">
                  {new Date().toLocaleDateString('pt-MZ', { 
                    day: '2-digit', 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </MainLayout>
  );
}
