import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { GraduationCap, TrendingUp, Calendar, DollarSign, MessageSquare } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function GuardianPortal() {
  const { user } = useAuth();

  // Buscar educandos do encarregado  
  const { data: students } = useQuery({
    queryKey: ['guardian-students', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('students')
        .select('*')
        .limit(10);
      
      return data || [];
    },
    enabled: !!user,
  });

  // Buscar avaliações dos educandos
  const { data: evaluations } = useQuery({
    queryKey: ['guardian-evaluations', students?.map(s => s.id)],
    queryFn: async () => {
      if (!students?.length) return [];
      
      const { data } = await supabase
        .from('evaluations')
        .select(`
          *,
          teacher_assignments (
            subjects (
              subject_name
            )
          )
        `)
        .in('student_id', students.map(s => s.id))
        .order('evaluation_date', { ascending: false });
      
      return data || [];
    },
    enabled: !!students?.length,
  });

  if (!students?.length) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhum Educando Vinculado</h3>
          <p className="text-muted-foreground">
            Entre em contato com a secretaria da escola para vincular seus educandos.
          </p>
        </CardContent>
      </Card>
    );
  }

  const selectedStudent = students[0];
  const studentEvaluations = evaluations?.filter(e => e.student_id === selectedStudent?.id) || [];
  const averageGrade = studentEvaluations.length > 0
    ? studentEvaluations.reduce((sum, e) => sum + e.grade, 0) / studentEvaluations.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Header do Educando */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={selectedStudent.photo_url || undefined} />
              <AvatarFallback>
              {selectedStudent?.full_name?.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{selectedStudent?.full_name}</h2>
              <p className="text-muted-foreground">
                Nº {selectedStudent?.student_number}
              </p>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              Média: {averageGrade.toFixed(1)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="grades" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="grades">
            <TrendingUp className="h-4 w-4 mr-2" />
            Notas
          </TabsTrigger>
          <TabsTrigger value="attendance">
            <Calendar className="h-4 w-4 mr-2" />
            Frequência
          </TabsTrigger>
          <TabsTrigger value="financial">
            <DollarSign className="h-4 w-4 mr-2" />
            Financeiro
          </TabsTrigger>
          <TabsTrigger value="communication">
            <MessageSquare className="h-4 w-4 mr-2" />
            Comunicados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="grades">
          <Card>
            <CardHeader>
              <CardTitle>Desempenho Académico</CardTitle>
              <CardDescription>Notas e avaliações do educando</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {studentEvaluations.map((evaluation) => (
                <div key={evaluation.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">
                      {evaluation.teacher_assignments?.subjects?.subject_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {evaluation.trimester}º Trimestre • {new Date(evaluation.evaluation_date).toLocaleDateString('pt-MZ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{evaluation.grade.toFixed(1)}</p>
                    <Progress value={(evaluation.grade / 20) * 100} className="w-24 mt-2" />
                  </div>
                </div>
              ))}
              {studentEvaluations.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma avaliação registada ainda
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Registo de Presenças</CardTitle>
              <CardDescription>Acompanhe a frequência do educando</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Funcionalidade de frequência em desenvolvimento
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial">
          <Card>
            <CardHeader>
              <CardTitle>Situação Financeira</CardTitle>
              <CardDescription>Pagamentos e pendências</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Funcionalidade financeira em desenvolvimento
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communication">
          <Card>
            <CardHeader>
              <CardTitle>Comunicados</CardTitle>
              <CardDescription>Mensagens e avisos da escola</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Nenhum comunicado disponível
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}