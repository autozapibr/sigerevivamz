import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Monitor, Palette, Settings as SettingsIcon } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/hooks/useTheme';
import { Badge } from '@/components/ui/badge';

export default function AparenciaPage() {
  const { theme, setTheme, isDark } = useTheme();

  const themeOptions = [
    { value: 'light', label: 'Claro', icon: Sun },
    { value: 'dark', label: 'Escuro', icon: Moon },
    { value: 'system', label: 'Sistema', icon: Monitor },
  ] as const;

  return (
    <MainLayout title="Aparência" subtitle="Personalize a aparência do sistema">
      <motion.div
        className="space-y-6 max-w-4xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Palette className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Tema</CardTitle>
                <CardDescription>Escolha o tema visual do sistema</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Seleccione o tema</Label>
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
      </motion.div>
    </MainLayout>
  );
}
