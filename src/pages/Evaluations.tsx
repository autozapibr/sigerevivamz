import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, Save, Calculator, Filter, FileSpreadsheet,
  TrendingUp, TrendingDown, Minus
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { 
  useClasses, 
  useSubjects, 
  useGradesByClass, 
  useSaveGrades,
  calculateTrimesterAverage,
  classifyGrade,
  GradeInsert
} from '@/hooks/useGrades';
import { useStudentsByClass } from '@/hooks/useAttendance';

const TRIMESTRES = [
  { value: '1', label: '1º Trimestre' },
  { value: '2', label: '2º Trimestre' },
  { value: '3', label: '3º Trimestre' },
];

interface StudentGrade {
  student_id: number;
  student_name: string;
  acs: number | null;
  acp: number | null;
  acf: number | null;
  media: number | null;
}

export default function Evaluations() {
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [selectedTrimestre, setSelectedTrimestre] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [gradesData, setGradesData] = useState<Map<number, StudentGrade>>(new Map());
  const [hasChanges, setHasChanges] = useState(false);

  const { toast } = useToast();
  const { data: classes = [], isLoading: classesLoading } = useClasses();
  const { data: subjects = [] } = useSubjects();
  const { data: students = [], isLoading: studentsLoading } = useStudentsByClass(selectedClassId);
  const { data: existingGrades = [] } = useGradesByClass(selectedClassId, selectedSubjectId, selectedTrimestre);
  const saveGrades = useSaveGrades();

  // Initialize grades from existing data
  React.useEffect(() => {
    if (students.length > 0) {
      const map = new Map<number, StudentGrade>();
      
      students.forEach(student => {
        const existingGrade = existingGrades.find(g => g.student_id === student.id);
        map.set(student.id, {
          student_id: student.id,
          student_name: student.name,
          acs: existingGrade?.acs ?? null,
          acp: existingGrade?.acp ?? null,
          acf: existingGrade?.acf ?? null,
          media: existingGrade?.media_trimestral ?? null,
        });
      });
      
      setGradesData(map);
      setHasChanges(false);
    }
  }, [students, existingGrades]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery) return Array.from(gradesData.values());
    return Array.from(gradesData.values()).filter(s => 
      s.student_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [gradesData, searchQuery]);

  const stats = useMemo(() => {
    const allGrades = Array.from(gradesData.values());
    const withMedia = allGrades.filter(g => g.media !== null);
    const aprovados = withMedia.filter(g => (g.media || 0) >= 10).length;
    const reprovados = withMedia.filter(g => (g.media || 0) < 10).length;
    const mediaGeral = withMedia.length > 0 
      ? withMedia.reduce((sum, g) => sum + (g.media || 0), 0) / withMedia.length 
      : 0;

    return { 
      total: allGrades.length, 
      avaliados: withMedia.length,
      aprovados, 
      reprovados, 
      mediaGeral: Math.round(mediaGeral * 100) / 100 
    };
  }, [gradesData]);

  const handleGradeChange = (studentId: number, field: 'acs' | 'acp' | 'acf', value: string) => {
    const numValue = value === '' ? null : Math.min(20, Math.max(0, parseFloat(value) || 0));
    
    setGradesData(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(studentId);
      if (current) {
        const updated = { ...current, [field]: numValue };
        updated.media = calculateTrimesterAverage(updated.acs, updated.acp, updated.acf);
        newMap.set(studentId, updated);
      }
      return newMap;
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!selectedClassId || !selectedSubjectId) {
      toast({
        title: 'Atenção',
        description: 'Seleccione uma turma e disciplina',
        variant: 'destructive',
      });
      return;
    }

    const grades: GradeInsert[] = Array.from(gradesData.values())
      .filter(g => g.acs !== null || g.acp !== null || g.acf !== null)
      .map(g => ({
        student_id: g.student_id,
        subject_id: selectedSubjectId,
        trimestre: selectedTrimestre,
        acs: g.acs,
        acp: g.acp,
        acf: g.acf,
        class_id: selectedClassId,
      }));

    if (grades.length === 0) {
      toast({
        title: 'Atenção',
        description: 'Nenhuma nota para guardar',
        variant: 'destructive',
      });
      return;
    }

    await saveGrades.mutateAsync(grades);
    setHasChanges(false);
  };

  const GradeInput = ({ 
    value, 
    onChange, 
    placeholder 
  }: { 
    value: number | null; 
    onChange: (v: string) => void; 
    placeholder: string;
  }) => (
    <Input
      type="number"
      min="0"
      max="20"
      step="0.5"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-16 text-center"
    />
  );

  const MediaBadge = ({ media }: { media: number | null }) => {
    const { label, className } = classifyGrade(media);
    return (
      <Badge variant="outline" className={className}>
        {media !== null ? `${media.toFixed(1)} - ${label}` : '-'}
      </Badge>
    );
  };

  return (
    <MainLayout title="Pauta Digital" subtitle="Lançamento de notas ACS, ACP e ACF">
      <div className="space-y-6">
        {/* Filtros */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Turma */}
              <div className="space-y-2">
                <Label>Turma</Label>
                <Select 
                  value={selectedClassId?.toString() || ''} 
                  onValueChange={(v) => {
                    setSelectedClassId(Number(v));
                    setGradesData(new Map());
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar turma" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Disciplina */}
              <div className="space-y-2">
                <Label>Disciplina</Label>
                <Select 
                  value={selectedSubjectId?.toString() || ''} 
                  onValueChange={(v) => setSelectedSubjectId(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar disciplina" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {s.code ? `${s.code} - ${s.name}` : s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Trimestre */}
              <div className="space-y-2">
                <Label>Trimestre</Label>
                <Select 
                  value={selectedTrimestre.toString()} 
                  onValueChange={(v) => setSelectedTrimestre(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIMESTRES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Pesquisa */}
              <div className="space-y-2">
                <Label>Pesquisar</Label>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Nome do educando..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        {selectedClassId && selectedSubjectId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-5 gap-4"
          >
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Educandos</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{stats.avaliados}</p>
                  <p className="text-xs text-blue-600">Avaliados</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{stats.aprovados}</p>
                    <p className="text-xs text-green-600">Aprovados (≥10)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-red-200 bg-red-50/50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{stats.reprovados}</p>
                    <p className="text-xs text-red-600">Reprovados (&lt;10)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-4">
                <div className="flex items-center justify-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{stats.mediaGeral}</p>
                    <p className="text-xs text-primary">Média Geral</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Tabela de Notas */}
        {selectedClassId && selectedSubjectId ? (
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5" />
                    Pauta - {TRIMESTRES.find(t => t.value === selectedTrimestre.toString())?.label}
                  </CardTitle>
                  <CardDescription>
                    {classes.find(c => c.id === selectedClassId)?.name} - {subjects.find(s => s.id === selectedSubjectId)?.name}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSave} 
                    disabled={saveGrades.isPending || !hasChanges}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {saveGrades.isPending ? 'Guardando...' : 'Guardar Notas'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Legenda MINEDH */}
              <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-2">Sistema de Avaliação MINEDH (0-20):</p>
                <div className="flex flex-wrap gap-4 text-xs">
                  <span><strong>ACS</strong> - Avaliação Contínua Sistemática (30%)</span>
                  <span><strong>ACP</strong> - Avaliação Contínua Parcial (30%)</span>
                  <span><strong>ACF</strong> - Avaliação Contínua Final (40%)</span>
                </div>
              </div>

              {studentsLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {gradesData.size === 0 
                      ? 'Nenhum educando nesta turma'
                      : 'Nenhum educando encontrado'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead className="min-w-[200px]">Educando</TableHead>
                        <TableHead className="text-center w-20">ACS (30%)</TableHead>
                        <TableHead className="text-center w-20">ACP (30%)</TableHead>
                        <TableHead className="text-center w-20">ACF (40%)</TableHead>
                        <TableHead className="text-center w-32">Média Trimestral</TableHead>
                        <TableHead className="text-center w-28">Classificação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((grade, index) => (
                        <motion.tr
                          key={grade.student_id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.02 }}
                        >
                          <TableCell className="font-medium text-muted-foreground">
                            {index + 1}
                          </TableCell>
                          <TableCell className="font-medium">
                            {grade.student_name}
                          </TableCell>
                          <TableCell className="text-center">
                            <GradeInput
                              value={grade.acs}
                              onChange={(v) => handleGradeChange(grade.student_id, 'acs', v)}
                              placeholder="0-20"
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <GradeInput
                              value={grade.acp}
                              onChange={(v) => handleGradeChange(grade.student_id, 'acp', v)}
                              placeholder="0-20"
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <GradeInput
                              value={grade.acf}
                              onChange={(v) => handleGradeChange(grade.student_id, 'acf', v)}
                              placeholder="0-20"
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={`text-lg font-bold ${classifyGrade(grade.media).className}`}>
                              {grade.media !== null ? grade.media.toFixed(1) : '-'}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <MediaBadge media={grade.media} />
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Seleccione turma e disciplina</h3>
                <p className="text-muted-foreground">
                  Escolha uma turma, disciplina e trimestre para lançar notas
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
