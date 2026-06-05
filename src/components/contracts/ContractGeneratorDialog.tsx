import React, { useState } from 'react';
import { 
  FileText, Calendar, Heart, Briefcase, GraduationCap,
  ChevronRight, User, Search, Plus, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { CONTRACT_TEMPLATES, ContractTemplate, StaffContractData } from './ContractTemplates';
import { ContractPreviewDialog } from './ContractPreviewDialog';
import { useTeachers } from '@/hooks/useTeachers';
import { useEmployees } from '@/hooks/useEmployees';

interface ContractGeneratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 'select-template' | 'select-staff' | 'edit-clauses' | 'preview';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText,
  Calendar,
  Heart,
  Briefcase,
  GraduationCap,
};

export function ContractGeneratorDialog({ open, onOpenChange }: ContractGeneratorDialogProps) {
  const [step, setStep] = useState<Step>('select-template');
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffContractData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [customClauses, setCustomClauses] = useState<string[]>([]);
  const [newClause, setNewClause] = useState('');

  const { data: teachers = [] } = useTeachers({ status: 'Ativo' });
  const { data: employees = [] } = useEmployees({ status: 'Ativo' });

  const allStaff: StaffContractData[] = [
    ...teachers.map(t => ({
      id: t.id,
      staff_type: 'teacher' as const,
      name: t.name,
      role: 'Professor(a)',
      bi_number: t.bi_number,
      nuit: t.nuit,
      address: t.address,
      province: t.province,
      district: t.district,
      phone: t.phone,
      email: t.email,
      birth_date: t.birth_date,
      gender: t.gender,
      contract_number: t.contract_number,
      contract_type: t.contract_type,
      contract_start: t.contract_start,
      contract_end: t.contract_end,
      salary: t.salary,
      hire_date: t.hire_date,
      bank_name: t.bank_name,
      bank_account: t.bank_account,
      payment_method: t.payment_method,
      mobile_money_provider: t.mobile_money_provider,
      mobile_money_number: t.mobile_money_number,
    })),
    ...employees.map(e => ({
      id: e.id,
      staff_type: 'employee' as const,
      name: e.name,
      role: e.role,
      bi_number: e.bi_number,
      nuit: e.nuit,
      address: e.address,
      province: e.province,
      district: e.district,
      phone: e.phone,
      email: e.email,
      birth_date: e.birth_date,
      gender: e.gender,
      contract_number: e.contract_number,
      contract_type: e.contract_type,
      contract_start: e.contract_start,
      contract_end: e.contract_end,
      salary: e.salary,
      hire_date: e.hire_date,
      bank_name: e.bank_name,
      bank_account: e.bank_account,
      payment_method: e.payment_method,
      mobile_money_provider: e.mobile_money_provider,
      mobile_money_number: e.mobile_money_number,
    })),
  ];

  const filteredStaff = allStaff.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTemplateSelect = (template: ContractTemplate) => {
    setSelectedTemplate(template);
    setStep('select-staff');
  };

  const handleStaffSelect = (staff: StaffContractData) => {
    setSelectedStaff(staff);
    setStep('edit-clauses');
  };

  const handleAddClause = () => {
    if (newClause.trim()) {
      setCustomClauses([...customClauses, newClause.trim()]);
      setNewClause('');
    }
  };

  const handleRemoveClause = (index: number) => {
    setCustomClauses(customClauses.filter((_, i) => i !== index));
  };

  const handleProceedToPreview = () => {
    setShowPreview(true);
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep('select-template');
      setSelectedTemplate(null);
      setSelectedStaff(null);
      setSearchTerm('');
      setCustomClauses([]);
    }, 300);
  };

  const handleBack = () => {
    if (step === 'select-staff') {
      setStep('select-template');
      setSelectedTemplate(null);
    } else if (step === 'edit-clauses') {
      setStep('select-staff');
    }
  };

  const getInitials = (name: string) =>
    name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();

  const getCategoryColor = (category: ContractTemplate['category']) => {
    switch (category) {
      case 'trabalho': return 'bg-blue-500/10 text-blue-600';
      case 'voluntariado': return 'bg-pink-500/10 text-pink-600';
      case 'estagio': return 'bg-purple-500/10 text-purple-600';
      case 'prestacao_servicos': return 'bg-amber-500/10 text-amber-600';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getCategoryLabel = (category: ContractTemplate['category']) => {
    switch (category) {
      case 'trabalho': return 'Trabalho';
      case 'voluntariado': return 'Voluntariado';
      case 'estagio': return 'Estágio';
      case 'prestacao_servicos': return 'Serviços';
      default: return category;
    }
  };

  return (
    <>
      <Dialog open={open && !showPreview} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {step === 'select-template' ? 'Gerar Novo Contrato' : 
               step === 'select-staff' ? 'Seleccionar Colaborador' : 
               'Adicionar Cláusulas Personalizadas'}
            </DialogTitle>
            <DialogDescription>
              {step === 'select-template' 
                ? 'Escolha o modelo de contrato que deseja gerar'
                : step === 'select-staff'
                ? `Modelo: ${selectedTemplate?.name}`
                : `Colaborador: ${selectedStaff?.name}`}
            </DialogDescription>
          </DialogHeader>

          {(step === 'select-staff' || step === 'edit-clauses') && (
            <Button variant="ghost" size="sm" onClick={handleBack} className="mt-2">
              ← Voltar
            </Button>
          )}

          {step === 'select-template' && (
            <div className="grid gap-3 py-4">
              {CONTRACT_TEMPLATES.map((template) => {
                const IconComponent = iconMap[template.icon] || FileText;
                return (
                  <Card 
                    key={template.id}
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${getCategoryColor(template.category)}`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{template.name}</h3>
                          <Badge variant="outline" className={getCategoryColor(template.category)}>
                            {getCategoryLabel(template.category)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {step === 'select-staff' && (
            <div className="py-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar por nome ou função..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-2">
                  {filteredStaff.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Nenhum colaborador encontrado</p>
                    </div>
                  ) : (
                    filteredStaff.map((staff) => (
                      <Card
                        key={`${staff.staff_type}-${staff.id}`}
                        className="cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => handleStaffSelect(staff)}
                      >
                        <CardContent className="p-3 flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              {getInitials(staff.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{staff.name}</p>
                            <p className="text-sm text-muted-foreground truncate">{staff.role}</p>
                          </div>
                          <Badge variant="outline" className="shrink-0">
                            {staff.staff_type === 'teacher' ? 'Professor' : 'Colaborador'}
                          </Badge>
                          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
          {step === 'edit-clauses' && (
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nova Cláusula</label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Ex: Pagamento extra por horas nocturnas..." 
                    value={newClause}
                    onChange={(e) => setNewClause(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddClause()}
                  />
                  <Button onClick={handleAddClause} size="icon">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <ScrollArea className="h-[200px] pr-4 border rounded-md p-2">
                {customClauses.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8 text-sm italic">
                    Nenhuma cláusula adicional adicionada.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {customClauses.map((clause, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-accent/30 rounded-md group">
                        <span className="text-xs font-mono text-muted-foreground mt-0.5">{index + 1}.</span>
                        <p className="text-sm flex-1">{clause}</p>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveClause(index)}
                        >
                          <Trash2 className="w-3 h-3 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              <div className="flex justify-end pt-2">
                <Button onClick={handleProceedToPreview}>
                  Gerar Pré-visualização
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ContractPreviewDialog
        open={showPreview}
        onOpenChange={(open) => {
          setShowPreview(open);
          if (!open) {
            setSelectedStaff(null);
          }
        }}
        staffData={selectedStaff}
        templateId={selectedTemplate?.id || ''}
        customClauses={customClauses}
      />
    </>
  );
}
