import React from 'react';
import { Check, User, Users, GraduationCap, FileText, MapPin, Phone, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useStudentDocuments } from '@/hooks/useEnrollments';
import { formatMZN } from '@/lib/validators/mozambique';
import { DOCUMENT_LABELS, type EnrollmentFormData, type DocumentType } from '@/types/enrollment';

interface ReviewStepProps {
  formData: EnrollmentFormData;
  studentId: number | null;
}

export function ReviewStep({ formData, studentId }: ReviewStepProps) {
  const { data: documents = [] } = useStudentDocuments(studentId);
  
  const monthlyWithDiscount = formData.monthly_fee * (1 - (formData.discount_percent || 0) / 100);
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-xl font-semibold text-foreground">
          Matrícula Registada com Sucesso!
        </h3>
        <p className="text-muted-foreground mt-2">
          A matrícula está pendente de aprovação pela secretaria.
        </p>
      </div>
      
      {/* Student Data */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4" />
            Dados do Educando
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Nome:</span>
            <p className="font-medium">{formData.full_name}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Data de Nascimento:</span>
            <p className="font-medium">
              {formData.birth_date ? new Date(formData.birth_date).toLocaleDateString('pt-MZ') : '-'}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Género:</span>
            <p className="font-medium">{formData.gender}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Nacionalidade:</span>
            <p className="font-medium">{formData.nationality}</p>
          </div>
          {formData.bi_number && (
            <div>
              <span className="text-muted-foreground">BI:</span>
              <p className="font-medium">{formData.bi_number}</p>
            </div>
          )}
          {formData.nuit && (
            <div>
              <span className="text-muted-foreground">NUIT:</span>
              <p className="font-medium">{formData.nuit}</p>
            </div>
          )}
          <div className="col-span-2">
            <span className="text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Localização:
            </span>
            <p className="font-medium">
              {formData.district}, {formData.province}
            </p>
            <p className="text-muted-foreground text-xs">{formData.address}</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Guardian Data */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4" />
            Encarregado de Educação
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div className="col-span-2">
            <span className="text-muted-foreground">Nome:</span>
            <p className="font-medium">{formData.guardian.full_name}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Parentesco:</span>
            <p className="font-medium">{formData.guardian.relationship}</p>
          </div>
          <div>
            <span className="text-muted-foreground flex items-center gap-1">
              <Phone className="w-3 h-3" /> Telefone:
            </span>
            <p className="font-medium">{formData.guardian.phone}</p>
          </div>
          {formData.guardian.email && (
            <div>
              <span className="text-muted-foreground flex items-center gap-1">
                <Mail className="w-3 h-3" /> Email:
              </span>
              <p className="font-medium">{formData.guardian.email}</p>
            </div>
          )}
          {formData.guardian.occupation && (
            <div>
              <span className="text-muted-foreground">Profissão:</span>
              <p className="font-medium">{formData.guardian.occupation}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Financial Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            Informação Financeira
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Taxa de Matrícula:</span>
            <span className="font-medium">{formatMZN(formData.enrollment_fee)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Propina Mensal:</span>
            <span className="font-medium">{formatMZN(formData.monthly_fee)}</span>
          </div>
          {formData.discount_percent > 0 && (
            <div className="flex justify-between text-green-500">
              <span>Desconto:</span>
              <span>-{formData.discount_percent}%</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Propina com Desconto:</span>
            <span className="text-primary">{formatMZN(monthlyWithDiscount)}</span>
          </div>
        </CardContent>
      </Card>
      
      {/* Documents */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Documentos Anexados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhum documento anexado.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {documents.map((doc) => (
                <Badge key={doc.id} variant="secondary">
                  {DOCUMENT_LABELS[doc.document_type as DocumentType]}
                  {doc.is_verified && <Check className="w-3 h-3 ml-1" />}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Status */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Estado da Matrícula</p>
              <p className="text-sm text-muted-foreground">
                A aguardar aprovação da secretaria
              </p>
            </div>
            <Badge className="bg-yellow-500/20 text-yellow-500 border-0">
              Pendente
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
