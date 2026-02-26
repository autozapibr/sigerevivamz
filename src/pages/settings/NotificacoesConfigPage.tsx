import React from 'react';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

export default function NotificacoesConfigPage() {
  return (
    <MainLayout title="Notificações" subtitle="Configure as suas preferências de notificação">
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
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Preferências de Notificação</CardTitle>
                <CardDescription>Escolha como e quando receber notificações</CardDescription>
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
      </motion.div>
    </MainLayout>
  );
}
