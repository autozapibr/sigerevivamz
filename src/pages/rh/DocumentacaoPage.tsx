import React, { useState, useEffect } from 'react';
import { useSearch } from '@/contexts/SearchContext';
import { motion } from 'framer-motion';
import { 
  Search, FileText, File, CheckCircle, AlertCircle, 
  Download, Trash2, ExternalLink, Filter, Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  useAllStaffDocuments, 
  useVerifyDocument, 
  useDeleteStaffDocument,
  DOCUMENT_TYPES,
  type StaffDocument 
} from '@/hooks/useStaffDocuments';
import { useTeachers } from '@/hooks/useTeachers';
import { useEmployees } from '@/hooks/useEmployees';

export default function DocumentacaoPage() {
  const { searchQuery: searchTerm, setPlaceholder } = useSearch();

  useEffect(() => {
    setPlaceholder('Pesquisar documentos...');
    return () => setPlaceholder('Pesquisar educandos, professores, turmas...');
  }, [setPlaceholder]);
  const [documentTypeFilter, setDocumentTypeFilter] = useState<string>('all');
  const [staffTypeFilter, setStaffTypeFilter] = useState<'teacher' | 'employee' | 'all'>('all');
  const [verifiedFilter, setVerifiedFilter] = useState<boolean | 'all'>('all');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<StaffDocument | null>(null);

  const { data: documents = [], isLoading } = useAllStaffDocuments({
    search: searchTerm,
    documentType: documentTypeFilter !== 'all' ? documentTypeFilter : undefined,
    staffType: staffTypeFilter,
    isVerified: verifiedFilter,
  });

  const { data: teachers = [] } = useTeachers();
  const { data: employees = [] } = useEmployees();
  const verifyDocument = useVerifyDocument();
  const deleteDocument = useDeleteStaffDocument();

  const getStaffName = (doc: StaffDocument) => {
    if (doc.staff_type === 'teacher') {
      return teachers.find(t => t.id === doc.staff_id)?.name || 'Professor';
    }
    return employees.find(e => e.id === doc.staff_id)?.name || 'Colaborador';
  };

  const getDocumentTypeLabel = (type: string) => {
    return DOCUMENT_TYPES.find(t => t.value === type)?.label || type;
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleVerify = async (doc: StaffDocument) => {
    await verifyDocument.mutateAsync({
      documentId: doc.id,
      verified: !doc.is_verified,
    });
  };

  const handleDelete = async () => {
    if (selectedDocument) {
      await deleteDocument.mutateAsync(selectedDocument);
      setShowDeleteDialog(false);
      setSelectedDocument(null);
    }
  };

  const totalDocs = documents.length;
  const verifiedDocs = documents.filter(d => d.is_verified).length;
  const pendingDocs = totalDocs - verifiedDocs;

  return (
    <MainLayout title="Documentação RH" subtitle="Gestão de documentos dos colaboradores">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-card/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{totalDocs}</p>
                </div>
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-500/10 border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-500">Verificados</p>
                  <p className="text-2xl font-bold text-green-500">{verifiedDocs}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-orange-500/10 border-orange-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-500">Pendentes</p>
                  <p className="text-2xl font-bold text-orange-500">{pendingDocs}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex gap-2 flex-wrap">
                <Select value={staffTypeFilter} onValueChange={(v) => setStaffTypeFilter(v as any)}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="teacher">Professores</SelectItem>
                    <SelectItem value="employee">Colaboradores</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={documentTypeFilter} onValueChange={setDocumentTypeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Documento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {DOCUMENT_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select 
                  value={verifiedFilter === 'all' ? 'all' : verifiedFilter.toString()} 
                  onValueChange={(v) => setVerifiedFilter(v === 'all' ? 'all' : v === 'true')}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="true">Verificados</SelectItem>
                    <SelectItem value="false">Pendentes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents Table - Desktop */}
        <Card className="hidden md:block">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Documento</TableHead>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Tamanho</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acções</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                    </TableRow>
                  ))
                ) : documents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      <File className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      {searchTerm || documentTypeFilter !== 'all' || staffTypeFilter !== 'all'
                        ? 'Nenhum documento encontrado com os filtros aplicados.'
                        : 'Nenhum documento carregado ainda.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  documents.map((doc, index) => (
                    <motion.tr
                      key={doc.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="group"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{doc.document_name}</p>
                            <p className="text-xs text-muted-foreground">{doc.mime_type}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{getStaffName(doc)}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {doc.staff_type === 'teacher' ? 'Professor' : 'Colaborador'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getDocumentTypeLabel(doc.document_type)}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatFileSize(doc.file_size)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {doc.created_at 
                          ? format(new Date(doc.created_at), 'dd/MM/yyyy', { locale: pt })
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {doc.is_verified ? (
                          <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-0">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verificado
                          </Badge>
                        ) : (
                          <Badge className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-0">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Pendente
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => window.open(doc.file_url, '_blank')}
                            title="Ver documento"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleVerify(doc)}
                            title={doc.is_verified ? 'Remover verificação' : 'Verificar'}
                            disabled={verifyDocument.isPending}
                          >
                            <CheckCircle className={`w-4 h-4 ${doc.is_verified ? 'text-green-500' : ''}`} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-destructive"
                            onClick={() => {
                              setSelectedDocument(doc);
                              setShowDeleteDialog(true);
                            }}
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Documents Cards - Mobile */}
        <div className="md:hidden space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))
          ) : documents.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <File className="w-12 h-12 mx-auto mb-4 opacity-50" />
                Nenhum documento encontrado
              </CardContent>
            </Card>
          ) : (
            documents.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{doc.document_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {getDocumentTypeLabel(doc.document_type)}
                          </p>
                        </div>
                      </div>
                      {doc.is_verified ? (
                        <Badge className="bg-green-500/10 text-green-600 border-0">
                          Verificado
                        </Badge>
                      ) : (
                        <Badge className="bg-orange-500/10 text-orange-600 border-0">
                          Pendente
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                      <div>
                        <p className="text-muted-foreground">Colaborador</p>
                        <p className="font-medium">{getStaffName(doc)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Tamanho</p>
                        <p>{formatFileSize(doc.file_size)}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => window.open(doc.file_url, '_blank')}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleVerify(doc)}
                        disabled={verifyDocument.isPending}
                      >
                        <CheckCircle className={`w-4 h-4 ${doc.is_verified ? 'text-green-500' : ''}`} />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-destructive"
                        onClick={() => {
                          setSelectedDocument(doc);
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Documento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que deseja eliminar o documento "{selectedDocument?.document_name}"? 
              Esta acção não pode ser revertida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
