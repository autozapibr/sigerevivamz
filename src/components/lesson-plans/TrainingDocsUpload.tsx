import React, { useRef } from 'react';
import { Upload, FileText, Trash2, Loader2, FileType, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useTrainingDocs, useTrainingDocsMutations } from '@/hooks/useTrainingDocs';

function formatFileSize(bytes: number | null) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(mime: string | null) {
  if (mime?.includes('pdf')) return <FileType className="h-4 w-4 text-destructive" />;
  if (mime?.includes('word') || mime?.includes('docx')) return <FileText className="h-4 w-4 text-blue-500" />;
  return <File className="h-4 w-4 text-muted-foreground" />;
}

export function TrainingDocsUpload() {
  const { data: docs, isLoading } = useTrainingDocs();
  const { uploadDoc, deleteDoc, toggleActive } = useTrainingDocsMutations();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => uploadDoc.mutate(file));
    e.target.value = '';
  };

  const activeDocs = docs?.filter(d => d.is_active) || [];

  return (
    <div className="space-y-4">
      <Separator />
      
      <div>
        <h4 className="font-medium flex items-center gap-2 mb-1">
          <Upload className="h-4 w-4" />
          Documentos de Treino AEP
        </h4>
        <p className="text-xs text-muted-foreground mb-3">
          Carregue documentos (PDF, DOCX, TXT, MD) sobre a Abordagem Educacional por Princípios. 
          O conteúdo destes ficheiros será enviado como contexto para a IA, permitindo respostas mais fundamentadas.
        </p>
      </div>

      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription className="text-xs">
          <strong>{activeDocs.length}</strong> documento(s) activo(s) serão incluídos como contexto na geração dos planos de aula.
          Ficheiros TXT e MD são lidos directamente. PDFs e DOCX são enviados como referência de nome para o modelo.
        </AlertDescription>
      </Alert>

      {/* Upload button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.txt,.md"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadDoc.isPending}
          className="gap-2"
        >
          {uploadDoc.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          Carregar Documento(s)
        </Button>
      </div>

      {/* File list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : docs && docs.length > 0 ? (
        <div className="space-y-2">
          {docs.map(doc => (
            <div
              key={doc.id}
              className={`flex items-center justify-between p-3 border rounded-lg transition-opacity ${
                doc.is_active ? '' : 'opacity-50'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {getFileIcon(doc.mime_type)}
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{doc.file_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(doc.file_size)} • {new Date(doc.created_at || '').toLocaleDateString('pt-MZ')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1.5">
                  <Switch
                    checked={doc.is_active ?? true}
                    onCheckedChange={v => toggleActive.mutate({ id: doc.id, is_active: v })}
                  />
                  <Label className="text-xs">Activo</Label>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteDoc.mutate(doc)}
                  disabled={deleteDoc.isPending}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">
          Nenhum documento de treino carregado. Adicione ficheiros sobre a metodologia AEP para melhorar a qualidade dos planos gerados.
        </p>
      )}
    </div>
  );
}
