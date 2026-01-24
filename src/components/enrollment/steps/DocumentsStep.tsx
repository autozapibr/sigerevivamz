import React, { useState, useCallback } from 'react';
import { 
  Upload, FileText, Trash2, Check, AlertCircle, Loader2, Image 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  useUploadDocument, 
  useStudentDocuments, 
  useDeleteDocument 
} from '@/hooks/useEnrollments';
import { 
  DOCUMENT_LABELS, 
  REQUIRED_DOCUMENTS,
  type DocumentType 
} from '@/types/enrollment';

interface DocumentsStepProps {
  studentId: number | null;
  onComplete?: () => void;
}

export function DocumentsStep({ studentId, onComplete }: DocumentsStepProps) {
  const [selectedType, setSelectedType] = useState<DocumentType>('CERTIDAO_NASCIMENTO');
  const [dragActive, setDragActive] = useState(false);
  
  const { data: documents = [], isLoading } = useStudentDocuments(studentId);
  const uploadDocument = useUploadDocument();
  const deleteDocument = useDeleteDocument();
  
  // Check which required docs are missing
  const uploadedTypes = new Set(documents.map(d => d.document_type));
  const missingRequired = REQUIRED_DOCUMENTS.filter(t => !uploadedTypes.has(t));
  
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0] && studentId) {
      handleUpload(e.dataTransfer.files[0]);
    }
  }, [studentId, selectedType]);
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && studentId) {
      handleUpload(e.target.files[0]);
    }
  };
  
  const handleUpload = async (file: File) => {
    if (!studentId) return;
    
    await uploadDocument.mutateAsync({
      studentId,
      file,
      documentType: selectedType,
      documentName: DOCUMENT_LABELS[selectedType],
    });
  };
  
  const handleDelete = async (documentId: number) => {
    await deleteDocument.mutateAsync(documentId);
  };
  
  if (!studentId) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Educando não registado</h3>
        <p className="text-muted-foreground">
          Complete os passos anteriores para anexar documentos.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Documentos do Educando
        </h3>
        {missingRequired.length > 0 && (
          <Badge variant="outline" className="text-yellow-500 border-yellow-500">
            {missingRequired.length} documento(s) obrigatório(s) em falta
          </Badge>
        )}
      </div>
      
      {/* Upload Section */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <Select 
              value={selectedType} 
              onValueChange={(v) => setSelectedType(v as DocumentType)}
            >
              <SelectTrigger className="md:w-64">
                <SelectValue placeholder="Tipo de documento" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DOCUMENT_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                    {REQUIRED_DOCUMENTS.includes(key as DocumentType) && ' *'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Drop Zone */}
          <div
            className={`
              relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
              ${uploadDocument.isPending ? 'opacity-50 pointer-events-none' : ''}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={handleFileSelect}
              disabled={uploadDocument.isPending}
            />
            
            {uploadDocument.isPending ? (
              <div className="flex flex-col items-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">A carregar documento...</p>
              </div>
            ) : (
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  Arraste e solte o ficheiro aqui, ou{' '}
                  <span className="text-primary underline">clique para seleccionar</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Formatos aceites: PDF, JPG, PNG, WEBP (máx. 10MB)
                </p>
              </label>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Uploaded Documents List */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-muted-foreground">
          Documentos Anexados ({documents.length})
        </h4>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : documents.length === 0 ? (
          <Card className="bg-muted/30">
            <CardContent className="py-8 text-center">
              <FileText className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-sm">
                Nenhum documento anexado ainda.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {documents.map((doc) => (
              <Card key={doc.id} className="bg-card/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {doc.mime_type?.startsWith('image') ? (
                        <Image className="w-5 h-5 text-primary" />
                      ) : (
                        <FileText className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{doc.document_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {DOCUMENT_LABELS[doc.document_type as DocumentType]}
                        {doc.file_size && ` • ${(doc.file_size / 1024).toFixed(1)} KB`}
                      </p>
                    </div>
                    
                    {/* Status */}
                    <div className="flex items-center gap-2">
                      {doc.is_verified ? (
                        <Badge className="bg-green-500/20 text-green-500 border-0">
                          <Check className="w-3 h-3 mr-1" />
                          Verificado
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                          Pendente
                        </Badge>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(doc.id)}
                        disabled={deleteDocument.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Required docs warning */}
      {missingRequired.length > 0 && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardContent className="py-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
              <div>
                <p className="font-medium text-yellow-500">Documentos Obrigatórios em Falta</p>
                <ul className="text-sm text-muted-foreground mt-1 list-disc list-inside">
                  {missingRequired.map(type => (
                    <li key={type}>{DOCUMENT_LABELS[type]}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
