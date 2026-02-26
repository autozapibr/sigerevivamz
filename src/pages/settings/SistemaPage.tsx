import React from 'react';
import { motion } from 'framer-motion';
import { Database } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export default function SistemaPage() {
  return (
    <MainLayout title="Sistema" subtitle="Informações técnicas do SiGER">
      <motion.div
        className="space-y-6 max-w-4xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
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
                    year: 'numeric',
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
