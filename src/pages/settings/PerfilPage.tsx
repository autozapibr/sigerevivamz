import React from 'react';
import { motion } from 'framer-motion';
import { User, Globe } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

export default function PerfilPage() {
  const { user } = useAuth();

  return (
    <MainLayout title="Perfil & Região" subtitle="Informações da sua conta e configurações regionais">
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
                <User className="w-5 h-5 text-primary" />
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

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Globe className="w-5 h-5 text-primary" />
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
      </motion.div>
    </MainLayout>
  );
}
