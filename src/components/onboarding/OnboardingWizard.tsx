import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, BookOpen, Users, GraduationCap, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface Step {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  route?: string;
}

export function OnboardingWizard() {
  const [steps] = useState<Step[]>([
    {
      id: 'config',
      title: 'Configurar Escola',
      description: 'Configure os dados da sua instituição',
      icon: <BookOpen className="h-5 w-5" />,
      completed: false,
      route: '/settings',
    },
    {
      id: 'teachers',
      title: 'Registar Professores',
      description: 'Adicione o corpo docente',
      icon: <Users className="h-5 w-5" />,
      completed: false,
      route: '/teachers',
    },
    {
      id: 'students',
      title: 'Registar Educandos',
      description: 'Inscreva os alunos da escola',
      icon: <GraduationCap className="h-5 w-5" />,
      completed: false,
      route: '/students',
    },
    {
      id: 'classes',
      title: 'Criar Turmas',
      description: 'Organize as turmas e disciplinas',
      icon: <FileText className="h-5 w-5" />,
      completed: false,
      route: '/turmas',
    },
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Primeiros Passos</CardTitle>
        <CardDescription>
          Complete estas etapas para começar a usar o SGE REVIVA
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {step.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
                <div className="flex items-center gap-2">
                  {step.icon}
                  <div>
                    <p className="font-medium">{step.title}</p>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              </div>
              {step.route && (
                <Button variant="outline" size="sm" asChild>
                  <Link to={step.route}>
                    {step.completed ? 'Ver' : 'Começar'}
                  </Link>
                </Button>
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-primary/10 rounded-lg">
          <h4 className="font-medium mb-2">💡 Dica Rápida</h4>
          <p className="text-sm text-muted-foreground">
            Use a página <Link to="/dev-seed" className="text-primary underline">Dev Seed</Link> para criar 
            utilizadores de teste e começar a explorar o sistema rapidamente.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}