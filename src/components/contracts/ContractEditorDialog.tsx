import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, Save, Printer, Send, Wand2, 
  User, Loader2, RefreshCw, Eye, Edit,
  MessageCircle, Mail, Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CurrencyInput } from '@/components/shared/CurrencyInput';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  CONTRACT_TEMPLATES, 
  ContractTemplate, 
  StaffContractData,
  generateContractHTML,
  formatCurrency,
  formatDate,
  numberToWords,
  generateContractNumber
} from './ContractTemplates';
import { useTeachers } from '@/hooks/useTeachers';
import { useEmployees } from '@/hooks/useEmployees';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeForReact } from '@/lib/sanitize';

interface ContractEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialStaff?: StaffContractData | null;
  initialTemplate?: string;
}

type EditorMode = 'template' | 'ai' | 'manual';

export function ContractEditorDialog({ 
  open, 
  onOpenChange, 
  initialStaff = null,
  initialTemplate = ''
}: ContractEditorDialogProps) {
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  
  const [mode, setMode] = useState<EditorMode>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<string>(initialTemplate || 'efectivo');
  const [selectedStaff, setSelectedStaff] = useState<StaffContractData | null>(initialStaff);
  const [contractHtml, setContractHtml] = useState<string>('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  
  // Editable fields
  const [editableFields, setEditableFields] = useState<Record<string, string>>({
    nome: '',
    bi_number: '',
    nuit: '',
    endereco: '',
    telefone: '',
    email: '',
    funcao: '',
    salario: '',
    data_inicio: '',
    data_fim: '',
    numero_contrato: '',
  });

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

  // Update fields when staff is selected
  useEffect(() => {
    if (selectedStaff) {
      setEditableFields({
        nome: selectedStaff.name || '',
        bi_number: selectedStaff.bi_number || '',
        nuit: selectedStaff.nuit || '',
        endereco: [selectedStaff.address, selectedStaff.district, selectedStaff.province].filter(Boolean).join(', '),
        telefone: selectedStaff.phone || '',
        email: selectedStaff.email || '',
        funcao: selectedStaff.role || '',
        salario: selectedStaff.salary?.toString() || '',
        data_inicio: selectedStaff.contract_start || '',
        data_fim: selectedStaff.contract_end || '',
        numero_contrato: selectedStaff.contract_number || generateContractNumber(selectedStaff.staff_type, selectedStaff.id),
      });
    }
  }, [selectedStaff]);

  // Generate contract HTML whenever fields or template change
  useEffect(() => {
    if (mode === 'template' && selectedTemplate) {
      const staffData: StaffContractData = selectedStaff ? {
        ...selectedStaff,
        name: editableFields.nome || selectedStaff.name,
        bi_number: editableFields.bi_number || selectedStaff.bi_number,
        nuit: editableFields.nuit || selectedStaff.nuit,
        address: editableFields.endereco || selectedStaff.address,
        phone: editableFields.telefone || selectedStaff.phone,
        email: editableFields.email || selectedStaff.email,
        role: editableFields.funcao || selectedStaff.role,
        salary: editableFields.salario ? parseFloat(editableFields.salario) : selectedStaff.salary,
        contract_start: editableFields.data_inicio || selectedStaff.contract_start,
        contract_end: editableFields.data_fim || selectedStaff.contract_end,
        contract_number: editableFields.numero_contrato || selectedStaff.contract_number,
      } : {
        id: 0,
        staff_type: 'employee',
        name: editableFields.nome,
        role: editableFields.funcao,
        bi_number: editableFields.bi_number,
        nuit: editableFields.nuit,
        address: editableFields.endereco,
        province: null,
        district: null,
        phone: editableFields.telefone,
        email: editableFields.email,
        birth_date: null,
        gender: null,
        contract_number: editableFields.numero_contrato,
        contract_type: null,
        contract_start: editableFields.data_inicio,
        contract_end: editableFields.data_fim,
        salary: editableFields.salario ? parseFloat(editableFields.salario) : null,
        hire_date: null,
        bank_name: null,
        bank_account: null,
        payment_method: null,
        mobile_money_provider: null,
        mobile_money_number: null,
      };
      
      const html = generateContractHTML(selectedTemplate, staffData);
      setContractHtml(html);
    }
  }, [mode, selectedTemplate, selectedStaff, editableFields]);

  const handleStaffSelect = (staffId: string) => {
    const [type, id] = staffId.split('-');
    const staff = allStaff.find(s => s.staff_type === type && s.id === parseInt(id));
    setSelectedStaff(staff || null);
  };

  const generateWithAI = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: 'Erro',
        description: 'Por favor, descreva as instruções para o contrato.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const template = CONTRACT_TEMPLATES.find(t => t.id === selectedTemplate);
      
      const { data, error } = await supabase.functions.invoke('generate-contract', {
        body: {
          type: 'generate',
          category: template?.category || 'trabalho',
          staffInfo: selectedStaff ? {
            name: editableFields.nome || selectedStaff.name,
            role: editableFields.funcao || selectedStaff.role,
            bi_number: editableFields.bi_number || selectedStaff.bi_number,
            nuit: editableFields.nuit || selectedStaff.nuit,
            address: editableFields.endereco || selectedStaff.address,
            phone: editableFields.telefone || selectedStaff.phone,
            email: editableFields.email || selectedStaff.email,
            salary: editableFields.salario ? parseFloat(editableFields.salario) : selectedStaff.salary,
            contract_start: editableFields.data_inicio || selectedStaff.contract_start,
            contract_end: editableFields.data_fim || selectedStaff.contract_end,
          } : undefined,
          customInstructions: aiPrompt,
        },
      });

      if (error) throw error;

      if (data?.content) {
        // Extract HTML from the response (may be wrapped in code blocks)
        let content = data.content;
        if (content.includes('```html')) {
          content = content.replace(/```html\n?/g, '').replace(/```\n?/g, '');
        } else if (content.includes('```')) {
          content = content.replace(/```\n?/g, '');
        }
        setContractHtml(content);
        setIsPreviewMode(true);
        toast({
          title: 'Contrato Gerado',
          description: 'O contrato foi gerado com sucesso pela IA.',
        });
      }
    } catch (error: any) {
      console.error('Error generating contract:', error);
      toast({
        title: 'Erro ao Gerar',
        description: error.message || 'Não foi possível gerar o contrato.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Contrato - Escola Reviva</title>
            <style>
              @media print {
                body { margin: 0; padding: 20mm; font-family: 'Times New Roman', serif; }
                @page { size: A4; margin: 20mm; }
              }
              body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; }
            </style>
          </head>
          <body>${contractHtml}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleWhatsApp = () => {
    const phone = editableFields.telefone?.replace(/\D/g, '');
    if (!phone) {
      toast({
        title: 'Telefone não disponível',
        description: 'Por favor, preencha o número de telefone.',
        variant: 'destructive',
      });
      return;
    }
    const message = encodeURIComponent(`Olá ${editableFields.nome}! Segue o seu contrato da Escola Reviva para revisão.`);
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const handleEmail = () => {
    const email = editableFields.email;
    if (!email) {
      toast({
        title: 'E-mail não disponível',
        description: 'Por favor, preencha o endereço de e-mail.',
        variant: 'destructive',
      });
      return;
    }
    const subject = encodeURIComponent('Contrato de Trabalho - Escola Reviva');
    const body = encodeURIComponent(`Prezado(a) ${editableFields.nome},\n\nSegue em anexo o seu contrato para revisão e assinatura.\n\nAtenciosamente,\nEscola Reviva`);
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
  };

  const handleFieldChange = (field: string, value: string) => {
    setEditableFields(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setSelectedStaff(null);
    setEditableFields({
      nome: '',
      bi_number: '',
      nuit: '',
      endereco: '',
      telefone: '',
      email: '',
      funcao: '',
      salario: '',
      data_inicio: '',
      data_fim: '',
      numero_contrato: '',
    });
    setContractHtml('');
    setAiPrompt('');
    setIsPreviewMode(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 gap-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Editor de Contratos
          </DialogTitle>
          <DialogDescription>
            Crie e edite contratos com preenchimento automático do banco de dados
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Editor */}
          <div className="w-1/2 border-r overflow-hidden flex flex-col">
            <Tabs value={mode} onValueChange={(v) => setMode(v as EditorMode)} className="flex-1 flex flex-col">
              <div className="px-4 border-b">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="template">
                    <FileText className="w-4 h-4 mr-2" />
                    Modelo
                  </TabsTrigger>
                  <TabsTrigger value="ai">
                    <Wand2 className="w-4 h-4 mr-2" />
                    Assistente IA
                  </TabsTrigger>
                  <TabsTrigger value="manual">
                    <Edit className="w-4 h-4 mr-2" />
                    Manual
                  </TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="flex-1 p-4">
                <TabsContent value="template" className="m-0 space-y-4">
                  {/* Template Selection */}
                  <div className="space-y-2">
                    <Label>Modelo de Contrato</Label>
                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione um modelo" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONTRACT_TEMPLATES.map(template => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Staff Selection */}
                  <div className="space-y-2">
                    <Label>Colaborador (Preenchimento Automático)</Label>
                    <Select 
                      value={selectedStaff ? `${selectedStaff.staff_type}-${selectedStaff.id}` : ''} 
                      onValueChange={handleStaffSelect}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione um colaborador ou preencha manualmente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">
                          <span className="text-muted-foreground">📝 Preencher manualmente</span>
                        </SelectItem>
                        <Separator className="my-2" />
                        {allStaff.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground text-center">
                            Nenhum colaborador encontrado
                          </div>
                        ) : (
                          allStaff.map(staff => (
                            <SelectItem key={`${staff.staff_type}-${staff.id}`} value={`${staff.staff_type}-${staff.id}`}>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {staff.staff_type === 'teacher' ? 'Prof' : 'Colab'}
                                </Badge>
                                {staff.name} - {staff.role}
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {/* Editable Fields */}
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Dados do Contrato
                        {selectedStaff && (
                          <Badge variant="secondary" className="ml-auto text-xs">
                            Auto-preenchido
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <Label className="text-xs">Nome Completo</Label>
                          <Input
                            value={editableFields.nome}
                            onChange={(e) => handleFieldChange('nome', e.target.value)}
                            placeholder="Nome do colaborador"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Nº BI</Label>
                          <Input
                            value={editableFields.bi_number}
                            onChange={(e) => handleFieldChange('bi_number', e.target.value)}
                            placeholder="00000000000L000L"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">NUIT</Label>
                          <Input
                            value={editableFields.nuit}
                            onChange={(e) => handleFieldChange('nuit', e.target.value)}
                            placeholder="000000000"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs">Endereço</Label>
                          <Input
                            value={editableFields.endereco}
                            onChange={(e) => handleFieldChange('endereco', e.target.value)}
                            placeholder="Endereço completo"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Telefone</Label>
                          <Input
                            value={editableFields.telefone}
                            onChange={(e) => handleFieldChange('telefone', e.target.value)}
                            placeholder="+258 84 000 0000"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">E-mail</Label>
                          <Input
                            value={editableFields.email}
                            onChange={(e) => handleFieldChange('email', e.target.value)}
                            placeholder="email@exemplo.com"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Função/Cargo</Label>
                          <Input
                            value={editableFields.funcao}
                            onChange={(e) => handleFieldChange('funcao', e.target.value)}
                            placeholder="Professor(a), Auxiliar, etc."
                          />
                        </div>
                        <div>
                          <CurrencyInput
                            label="Salário (MZN)"
                            value={editableFields.salario || ''}
                            onChange={(val) => handleFieldChange('salario', val)}
                            placeholder="0,00"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Data de Início</Label>
                          <Input
                            value={editableFields.data_inicio}
                            onChange={(e) => handleFieldChange('data_inicio', e.target.value)}
                            type="date"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Data de Término</Label>
                          <Input
                            value={editableFields.data_fim}
                            onChange={(e) => handleFieldChange('data_fim', e.target.value)}
                            type="date"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs">Nº do Contrato</Label>
                          <Input
                            value={editableFields.numero_contrato}
                            onChange={(e) => handleFieldChange('numero_contrato', e.target.value)}
                            placeholder="CTR-PROF-2026-0001"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="ai" className="m-0 space-y-4">
                  <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Wand2 className="w-4 h-4 text-primary" />
                        Assistente de IA
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Descreva o tipo de contrato que deseja criar ou personalizações específicas. 
                        A IA irá gerar um documento completo e profissional.
                      </p>
                      
                      <div className="space-y-2">
                        <Label>Categoria Base</Label>
                        <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CONTRACT_TEMPLATES.map(template => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Colaborador (Opcional)</Label>
                        <Select 
                          value={selectedStaff ? `${selectedStaff.staff_type}-${selectedStaff.id}` : 'none'} 
                          onValueChange={(v) => v === 'none' ? setSelectedStaff(null) : handleStaffSelect(v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione para auto-preencher dados" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Nenhum (genérico)</SelectItem>
                            {allStaff.map(staff => (
                              <SelectItem key={`${staff.staff_type}-${staff.id}`} value={`${staff.staff_type}-${staff.id}`}>
                                {staff.name} - {staff.role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Instruções para a IA</Label>
                        <Textarea
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          placeholder="Ex: Criar um contrato de voluntariado para um professor de música, com cláusula especial sobre uso de instrumentos da escola..."
                          className="min-h-[120px]"
                        />
                      </div>

                      <Button 
                        onClick={generateWithAI} 
                        disabled={isGenerating}
                        className="w-full"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            A gerar contrato...
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-4 h-4 mr-2" />
                            Gerar com IA
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>💡 <strong>Sugestões:</strong></p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Contrato de estágio curricular com bolsa-auxílio</li>
                      <li>Termo de voluntariado para actividades extracurriculares</li>
                      <li>Contrato temporário para período de férias escolares</li>
                      <li>Prestação de serviços para formação específica</li>
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="manual" className="m-0 space-y-4">
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm">Editor Manual</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Edite directamente o HTML do contrato. Use esta opção para personalizações avançadas.
                      </p>
                      <Textarea
                        value={contractHtml}
                        onChange={(e) => setContractHtml(e.target.value)}
                        className="min-h-[300px] font-mono text-xs"
                        placeholder="Cole ou escreva o HTML do contrato aqui..."
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </ScrollArea>

              {/* Actions Footer */}
              <div className="p-4 border-t flex gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={resetForm}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Limpar
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir
                </Button>
                <Button variant="outline" size="sm" onClick={handleWhatsApp}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
                <Button variant="outline" size="sm" onClick={handleEmail}>
                  <Mail className="w-4 h-4 mr-2" />
                  E-mail
                </Button>
              </div>
            </Tabs>
          </div>

          {/* Right Panel - Preview */}
          <div className="w-1/2 flex flex-col bg-muted/30">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span className="font-medium">Pré-visualização</span>
              </div>
              <Badge variant="outline">A4</Badge>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div 
                ref={printRef}
                className="bg-white rounded-lg shadow-lg p-8 mx-auto max-w-[210mm] min-h-[297mm]"
                style={{ 
                  fontFamily: "'Times New Roman', serif",
                  fontSize: '12pt',
                  lineHeight: '1.6',
                  color: '#000'
                }}
                >
                {contractHtml ? (
                  <div dangerouslySetInnerHTML={sanitizeForReact(contractHtml)} />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p>Seleccione um modelo e colaborador para visualizar o contrato</p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
