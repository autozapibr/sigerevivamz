import React, { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { useTeacherFiles, useTeacherFileMutations, FILE_CATEGORIES } from '@/hooks/useTeacherFiles';
import { useAuth } from '@/contexts/AuthContext';
import { useSubjectsList } from '@/hooks/useSubjects';
import { useClassesList } from '@/hooks/useClasses';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import {
  FolderOpen, Upload, FileText, Trash2, Download, Search,
  Filter, User, Calendar, FileSpreadsheet, BookOpen, X, Eye
} from 'lucide-react';
import { ArchivedPlanPreview } from '@/components/lesson-plans/ArchivedPlanPreview';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { toast } from 'sonner';

const categoryIcons: Record<string, React.ReactNode> = {
  'Plano de Aula': <BookOpen className="w-4 h-4" />,
  'Relatório': <FileSpreadsheet className="w-4 h-4" />,
  'Teste/Prova': <FileText className="w-4 h-4" />,
  'Ficha de Exercícios': <FileText className="w-4 h-4" />,
  'Material Didáctico': <FolderOpen className="w-4 h-4" />,
  'Pauta': <FileSpreadsheet className="w-4 h-4" />,
  'Outro': <FileText className="w-4 h-4" />,
};

const categoryColors: Record<string, string> = {
  'Plano de Aula': 'bg-primary/10 text-primary border-primary/20',
  'Relatório': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  'Teste/Prova': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  'Ficha de Exercícios': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  'Material Didáctico': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  'Pauta': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  'Outro': 'bg-muted text-muted-foreground border-border',
};

function formatFileSize(bytes: number | null) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ArquivosPage() {
  const { user } = useAuth();
  const isTeacher = user?.role === 'PROFESSOR';
  const isAdmin = ['ADMIN', 'DIRETORIA', 'PEDAGOGICO'].includes(user?.role || '');

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterTeacher, setFilterTeacher] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<{ file_path: string; file_name: string; teacher_name: string } | null>(null);

  // Upload form state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState('Outro');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadSubjectId, setUploadSubjectId] = useState<string>('');
  const [uploadClassId, setUploadClassId] = useState<string>('');

  const { data: files, isLoading } = useTeacherFiles({
    category: filterCategory || undefined,
  });
  const { uploadFile: uploadMutation, deleteFile, getSignedUrl } = useTeacherFileMutations();
  const { data: subjects } = useSubjectsList();
  const { data: classes } = useClassesList();

  // Group files by teacher
  const groupedFiles = useMemo(() => {
    if (!files) return {};
    let filtered = files;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(f =>
        f.file_name.toLowerCase().includes(term) ||
        f.teacher_name.toLowerCase().includes(term) ||
        f.description?.toLowerCase().includes(term) ||
        f.category.toLowerCase().includes(term)
      );
    }

    if (filterTeacher) {
      filtered = filtered.filter(f =>
        f.teacher_name.toLowerCase().includes(filterTeacher.toLowerCase())
      );
    }

    const grouped: Record<string, typeof filtered> = {};
    for (const file of filtered) {
      const key = file.teacher_name;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(file);
    }
    return grouped;
  }, [files, searchTerm, filterTeacher]);

  const teacherNames = useMemo(() => {
    if (!files) return [];
    return [...new Set(files.map(f => f.teacher_name))].sort();
  }, [files]);

  const handleUpload = async () => {
    if (!uploadFile) return;
    await uploadMutation.mutateAsync({
      file: uploadFile,
      category: uploadCategory,
      description: uploadDescription,
      subjectId: uploadSubjectId ? Number(uploadSubjectId) : undefined,
      classId: uploadClassId ? Number(uploadClassId) : undefined,
    });
    setUploadOpen(false);
    setUploadFile(null);
    setUploadCategory('Outro');
    setUploadDescription('');
    setUploadSubjectId('');
    setUploadClassId('');
  };

  const handleDownload = async (file: { file_path: string; file_name: string }) => {
    try {
      const url = await getSignedUrl(file.file_path);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.file_name;
      a.target = '_blank';
      a.click();
    } catch {
      toast.error('Erro ao descarregar ficheiro.');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterCategory('');
    setFilterTeacher('');
  };

  const hasActiveFilters = searchTerm || filterCategory || filterTeacher;

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="Arquivos dos Professores"
          description="Documentos produzidos pelos professores, organizados por autor e categoria."
        />

        {/* Filters & Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar por nome, professor ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {FILE_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {isAdmin && teacherNames.length > 1 && (
                <Select value={filterTeacher} onValueChange={setFilterTeacher}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Professor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os professores</SelectItem>
                    {teacherNames.map(name => (
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {hasActiveFilters && (
                <Button variant="ghost" size="icon" onClick={clearFilters} title="Limpar filtros">
                  <X className="w-4 h-4" />
                </Button>
              )}

              {isTeacher && (
                <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Upload className="w-4 h-4" />
                      Carregar Arquivo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Carregar Novo Arquivo</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-2">
                      <div>
                        <Label>Ficheiro *</Label>
                        <Input
                          type="file"
                          onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                          className="mt-1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Máximo 20MB</p>
                      </div>

                      <div>
                        <Label>Categoria *</Label>
                        <Select value={uploadCategory} onValueChange={setUploadCategory}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FILE_CATEGORIES.map(cat => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Disciplina (opcional)</Label>
                        <Select value={uploadSubjectId} onValueChange={setUploadSubjectId}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Seleccionar disciplina" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Nenhuma</SelectItem>
                            {subjects?.map(s => (
                              <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Turma (opcional)</Label>
                        <Select value={uploadClassId} onValueChange={setUploadClassId}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Seleccionar turma" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Nenhuma</SelectItem>
                            {classes?.map(c => (
                              <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Descrição (opcional)</Label>
                        <Textarea
                          value={uploadDescription}
                          onChange={(e) => setUploadDescription(e.target.value)}
                          placeholder="Breve descrição do ficheiro..."
                          className="mt-1"
                          rows={2}
                        />
                      </div>

                      <Button
                        onClick={handleUpload}
                        disabled={!uploadFile || uploadMutation.isPending}
                        className="w-full gap-2"
                      >
                        {uploadMutation.isPending ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        Carregar
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardContent>
        </Card>

        {/* File List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : Object.keys(groupedFiles).length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="Nenhum arquivo encontrado"
            description={hasActiveFilters ? "Tente ajustar os filtros." : "Os professores ainda não carregaram ficheiros."}
          />
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedFiles).map(([teacherName, teacherFiles]) => (
              <Card key={teacherName}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{teacherName}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {teacherFiles.length} arquivo{teacherFiles.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    {teacherFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
                      >
                        <div className="flex-shrink-0">
                          {categoryIcons[file.category] || <FileText className="w-4 h-4" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.file_name.replace(/\.html$/i, '')}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge variant="outline" className={`text-[10px] ${categoryColors[file.category] || ''}`}>
                              {file.category}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">
                              {formatFileSize(file.file_size)}
                            </span>
                            {file.created_at && (
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {format(new Date(file.created_at), "dd MMM yyyy", { locale: pt })}
                              </span>
                            )}
                          </div>
                          {file.description && (
                            <p className="text-xs text-muted-foreground mt-1 truncate">{file.description}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {file.category === 'Plano de Aula' && file.mime_type === 'text/html' ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setPreviewFile({ file_path: file.file_path, file_name: file.file_name, teacher_name: file.teacher_name })}
                              title="Visualizar Plano"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleDownload(file)}
                              title="Descarregar"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                          {(isTeacher && file.teacher_user_id === user?.id) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => deleteFile.mutate(file)}
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {previewFile && (
          <ArchivedPlanPreview
            open={!!previewFile}
            onOpenChange={(open) => !open && setPreviewFile(null)}
            filePath={previewFile.file_path}
            fileName={previewFile.file_name}
            teacherName={previewFile.teacher_name}
          />
        )}
      </div>
    </MainLayout>
  );
}
