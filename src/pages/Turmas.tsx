import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Search, MoreHorizontal, UserPlus, BookOpen } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useClasses } from '@/hooks/useGrades';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export default function Turmas() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: classes = [], isLoading } = useClasses();

  const { data: studentsCount = {} } = useQuery({
    queryKey: ['students-count-by-class'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('class_id')
        .eq('status', 'Ativo');
      
      if (error) throw error;
      
      const counts: Record<number, number> = {};
      data.forEach(s => {
        if (s.class_id) {
          counts[s.class_id] = (counts[s.class_id] || 0) + 1;
        }
      });
      return counts;
    },
  });

  const filteredClasses = classes.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();

  return (
    <MainLayout title="Turmas" subtitle="Gestão de turmas e alocação de educandos">
      <div className="space-y-6">
        {/* Acções */}
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar turma..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Turma
          </Button>
        </div>

        {/* Grid de Turmas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            [...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6 h-48" />
              </Card>
            ))
          ) : filteredClasses.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhuma turma encontrada</p>
              </CardContent>
            </Card>
          ) : (
            filteredClasses.map((turma, index) => (
              <motion.div
                key={turma.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-primary" />
                          </div>
                          {turma.name}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          Ano Lectivo: {turma.year}
                        </CardDescription>
                      </div>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          <strong>{studentsCount[turma.id] || 0}</strong> educandos
                        </span>
                      </div>
                      <Badge variant="secondary">
                        {studentsCount[turma.id] ? 'Activa' : 'Vazia'}
                      </Badge>
                    </div>
                    
                    <div className="mt-4 flex -space-x-2">
                      {[...Array(Math.min(5, studentsCount[turma.id] || 0))].map((_, i) => (
                        <Avatar key={i} className="h-8 w-8 border-2 border-background">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {String.fromCharCode(65 + i)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {(studentsCount[turma.id] || 0) > 5 && (
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                          +{(studentsCount[turma.id] || 0) - 5}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Adicionar
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Ver Detalhes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
}
