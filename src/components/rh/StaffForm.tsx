import React, { useState, useRef } from 'react';
  import { Camera, Upload, X, User, Smartphone, BookOpen, GraduationCap } from 'lucide-react';
 import { TeacherAssignmentsManager } from '@/components/teachers/TeacherAssignmentsManager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CurrencyInput } from '@/components/shared/CurrencyInput';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
 import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import { Card, CardContent } from '@/components/ui/card';
import { ProvinceSelector } from '@/components/shared/ProvinceSelector';
import { MozambiqueInput } from '@/components/shared/MozambiqueInput';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CONTRACT_TYPES } from '@/hooks/useContracts';
import { useUploadStaffPhoto } from '@/hooks/useStaffDocuments';

export interface StaffFormData {
  name: string;
  email: string;
  phone: string;
  bi_number: string;
  nuit: string;
  photo_url: string;
  role: string;
  department: string;
  qualifications: string;
  hire_date: string;
  contract_number: string;
  contract_type: string;
  contract_start: string;
  contract_end: string;
  salary: string;
  address: string;
  province: string;
  district: string;
  birth_date: string;
  gender: string;
  emergency_contact: string;
  emergency_phone: string;
  bank_name: string;
  bank_account: string;
  payment_method: string;
  mobile_money_provider: string;
  mobile_money_number: string;
  status: string;
}

interface StaffFormProps {
  staffType: 'teacher' | 'employee';
  formData: StaffFormData;
  onChange: (data: StaffFormData) => void;
  isEdit?: boolean;
  staffId?: number;
}

export const EMPLOYEE_ROLES = [
  'Administrativo',
  'Secretário(a)',
  'Contabilista',
  'Segurança',
  'Limpeza',
  'Motorista',
  'Cozinheiro(a)',
  'Bibliotecário(a)',
  'Técnico de Informática',
  'Auxiliar',
  'Outro',
];

export const DEPARTMENTS = [
  'Direcção',
  'Secretaria',
  'Finanças',
  'Pedagógico',
  'Biblioteca',
  'Manutenção',
  'Segurança',
  'Cantina',
  'Transporte',
];

// Bancos moçambicanos
export const BANKS = [
  'BCI - Banco Comercial e de Investimentos',
  'BIM - Millennium BIM',
  'Standard Bank Moçambique',
  'Absa Bank Moçambique',
  'FNB Moçambique',
  'Moza Banco',
  'UBA Moçambique',
  'Access Bank Moçambique',
  'Banco Único',
  'Banco Terra',
  'Socremo',
  'Letshego',
  'MyBucks',
  'Outro',
];

// Provedores de Mobile Money
export const MOBILE_MONEY_PROVIDERS = [
  { value: 'mpesa', label: 'M-Pesa (Vodacom)', prefix: '84/85' },
  { value: 'emola', label: 'e-Mola (Movitel)', prefix: '86/87' },
  { value: 'mkesh', label: 'm-Kesh (Tmcel)', prefix: '82/83' },
];

export const initialStaffFormData: StaffFormData = {
  name: '',
  email: '',
  phone: '',
  bi_number: '',
  nuit: '',
  photo_url: '',
  role: '',
  department: '',
  qualifications: '',
  hire_date: '',
  contract_number: '',
  contract_type: 'Efectivo',
  contract_start: '',
  contract_end: '',
  salary: '',
  address: '',
  province: '',
  district: '',
  birth_date: '',
  gender: '',
  emergency_contact: '',
  emergency_phone: '',
  bank_name: '',
  bank_account: '',
  payment_method: 'bank',
  mobile_money_provider: '',
  mobile_money_number: '',
  status: 'Ativo',
};

export function StaffForm({ staffType, formData, onChange, isEdit, staffId }: StaffFormProps) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(formData.photo_url || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadPhoto = useUploadStaffPhoto();

  const getInitials = (name: string) => 
    name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // If editing, upload immediately
    if (isEdit && staffId) {
      const url = await uploadPhoto.mutateAsync({
        file,
        staffType,
        staffId,
      });
      onChange({ ...formData, photo_url: url });
    } else {
      // For new records, we'll handle upload after creation
      // Store the file temporarily
      (window as any).__tempPhotoFile = file;
    }
  };

  const handleCameraCapture = () => {
    cameraInputRef.current?.click();
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    onChange({ ...formData, photo_url: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    (window as any).__tempPhotoFile = null;
  };

  return (
    <Tabs defaultValue="personal" className="w-full">
       <TabsList className={`grid w-full mb-4 ${staffType === 'teacher' && isEdit ? 'grid-cols-4' : 'grid-cols-3'}`}>
        <TabsTrigger value="personal" className="text-xs sm:text-sm">Dados Pessoais</TabsTrigger>
        <TabsTrigger value="professional" className="text-xs sm:text-sm">Profissional</TabsTrigger>
        {staffType === 'teacher' && isEdit && (
          <TabsTrigger value="assignments" className="text-xs sm:text-sm">Turmas</TabsTrigger>
        )}
        <TabsTrigger value="financial" className="text-xs sm:text-sm">Financeiro</TabsTrigger>
      </TabsList>

      <TabsContent value="personal" className="space-y-4">
        {/* Photo Upload with Camera Option */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-24 w-24 border-2 border-primary/20">
              <AvatarImage src={photoPreview || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                {formData.name ? getInitials(formData.name) : <User className="w-8 h-8" />}
              </AvatarFallback>
            </Avatar>
            {photoPreview && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                onClick={removePhoto}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          <div className="space-y-2">
            {/* Hidden file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={handlePhotoUpload}
            />
            
            {/* Upload buttons */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleFileUpload}
                disabled={uploadPhoto.isPending}
              >
                <Upload className="w-4 h-4 mr-2" />
                Ficheiro
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCameraCapture}
                disabled={uploadPhoto.isPending}
              >
                <Camera className="w-4 h-4 mr-2" />
                Câmara
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {uploadPhoto.isPending ? 'A carregar...' : 'JPG, PNG até 2MB'}
            </p>
          </div>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Nome Completo *</Label>
          <Input
            id="name"
            placeholder="Nome completo"
            value={formData.name}
            onChange={(e) => onChange({ ...formData, name: e.target.value })}
          />
        </div>

        {/* Gender & Birth Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="gender">Género</Label>
            <Select 
              value={formData.gender} 
              onValueChange={(v) => onChange({ ...formData, gender: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Masculino">Masculino</SelectItem>
                <SelectItem value="Feminino">Feminino</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="birth_date">Data de Nascimento</Label>
            <Input
              id="birth_date"
              type="date"
              value={formData.birth_date}
              onChange={(e) => onChange({ ...formData, birth_date: e.target.value })}
            />
          </div>
        </div>

        {/* BI & NUIT */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MozambiqueInput
            label="Número do BI"
            mask="BI"
            value={formData.bi_number}
            onChange={(value) => onChange({ ...formData, bi_number: value })}
          />
          <MozambiqueInput
            label="NUIT / Outro Documento"
            mask="NUIT"
            value={formData.nuit}
            onChange={(value) => onChange({ ...formData, nuit: value })}
          />
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@exemplo.mz"
              value={formData.email}
              onChange={(e) => onChange({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <MozambiqueInput
              id="phone"
              mask="PHONE"
              value={formData.phone}
              onChange={(value) => onChange({ ...formData, phone: value })}
              showWhatsappToggle
              isWhatsapp={true} // Defaulting to true for now as it's common in MZ
            />
          </div>
        </div>

        {/* Province & District */}
        <ProvinceSelector
          selectedProvince={formData.province}
          selectedDistrict={formData.district}
          onProvinceChange={(v) => onChange({ ...formData, province: v, district: '' })}
          onDistrictChange={(v) => onChange({ ...formData, district: v })}
        />

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address">Endereço</Label>
          <Textarea
            id="address"
            placeholder="Endereço completo"
            value={formData.address}
            onChange={(e) => onChange({ ...formData, address: e.target.value })}
            rows={2}
          />
        </div>

        {/* Emergency Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="emergency_contact">Contacto de Emergência</Label>
            <Input
              id="emergency_contact"
              placeholder="Nome do contacto"
              value={formData.emergency_contact}
              onChange={(e) => onChange({ ...formData, emergency_contact: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergency_phone">Telefone de Emergência</Label>
            <MozambiqueInput
              id="emergency_phone"
              mask="PHONE"
              value={formData.emergency_phone}
              onChange={(value) => onChange({ ...formData, emergency_phone: value })}
            />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="professional" className="space-y-4">
        {/* Role/Department for employees */}
        {staffType === 'employee' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Função *</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(v) => onChange({ ...formData, role: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione a função" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYEE_ROLES.map(role => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Departamento</Label>
                <Select 
                  value={formData.department} 
                  onValueChange={(v) => onChange({ ...formData, department: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}

        {/* Qualifications for teachers */}
        {staffType === 'teacher' && (
          <div className="space-y-2">
            <Label htmlFor="qualifications">Qualificações</Label>
            <Textarea
              id="qualifications"
              placeholder="Ex: Licenciatura em Matemática, Mestrado em Educação..."
              value={formData.qualifications}
              onChange={(e) => onChange({ ...formData, qualifications: e.target.value })}
              rows={3}
            />
          </div>
        )}

        {/* Hire Date */}
        <div className="space-y-2">
          <Label htmlFor="hire_date">Data de Admissão</Label>
          <Input
            id="hire_date"
            type="date"
            value={formData.hire_date}
            onChange={(e) => onChange({ ...formData, hire_date: e.target.value })}
          />
        </div>

        {/* Contract Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contract_number">Nº do Contrato</Label>
            <Input
              id="contract_number"
              placeholder="CONT-2025-001"
              value={formData.contract_number}
              onChange={(e) => onChange({ ...formData, contract_number: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contract_type">Tipo de Contrato</Label>
            <Select 
              value={formData.contract_type} 
              onValueChange={(v) => onChange({ ...formData, contract_type: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione" />
              </SelectTrigger>
              <SelectContent>
                {CONTRACT_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Contract Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contract_start">Início do Contrato</Label>
            <Input
              id="contract_start"
              type="date"
              value={formData.contract_start}
              onChange={(e) => onChange({ ...formData, contract_start: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contract_end">Fim do Contrato</Label>
            <Input
              id="contract_end"
              type="date"
              value={formData.contract_end}
              onChange={(e) => onChange({ ...formData, contract_end: e.target.value })}
            />
          </div>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Estado</Label>
          <Select 
            value={formData.status} 
            onValueChange={(v) => onChange({ ...formData, status: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Ativo">Activo</SelectItem>
              <SelectItem value="Inativo">Inactivo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </TabsContent>

      <TabsContent value="financial" className="space-y-4">
        {/* Salary */}
        <div className="space-y-2">
          <CurrencyInput
            label="Salário (MZN)"
            value={formData.salary}
            onChange={(val) => onChange({ ...formData, salary: val })}
            placeholder="0,00"
          />
        </div>

        {/* Payment Method Selection */}
        <div className="space-y-3">
          <Label>Método de Pagamento</Label>
          <RadioGroup
            value={formData.payment_method}
            onValueChange={(v) => onChange({ ...formData, payment_method: v })}
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="bank" id="payment-bank" />
              <Label htmlFor="payment-bank" className="font-normal cursor-pointer">
                Transferência Bancária
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="mobile" id="payment-mobile" />
              <Label htmlFor="payment-mobile" className="font-normal cursor-pointer flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                Dinheiro Móvel (M-Pesa, e-Mola, m-Kesh)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="cash" id="payment-cash" />
              <Label htmlFor="payment-cash" className="font-normal cursor-pointer">
                Numerário (Dinheiro/Cash)
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Bank Info - Only shown when bank payment method is selected */}
        {formData.payment_method === 'bank' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border">
            <div className="space-y-2">
              <Label htmlFor="bank_name">Banco</Label>
              <Select 
                value={formData.bank_name} 
                onValueChange={(v) => onChange({ ...formData, bank_name: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione o banco" />
                </SelectTrigger>
                <SelectContent>
                  {BANKS.map(bank => (
                    <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank_account">Número da Conta (NIB)</Label>
              <Input
                id="bank_account"
                placeholder="Ex: 0001 0000 0000 0000 0000 0"
                value={formData.bank_account}
                onChange={(e) => onChange({ ...formData, bank_account: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* Mobile Money Info - Only shown when mobile payment method is selected */}
        {formData.payment_method === 'mobile' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border">
            <div className="space-y-2">
              <Label htmlFor="mobile_money_provider">Operadora</Label>
              <Select 
                value={formData.mobile_money_provider} 
                onValueChange={(v) => onChange({ ...formData, mobile_money_provider: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione a operadora" />
                </SelectTrigger>
                <SelectContent>
                  {MOBILE_MONEY_PROVIDERS.map(provider => (
                    <SelectItem key={provider.value} value={provider.value}>
                      {provider.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile_money_number">Número do Telemóvel</Label>
              <MozambiqueInput
                id="mobile_money_number"
                mask="PHONE"
                value={formData.mobile_money_number}
                onChange={(value) => onChange({ ...formData, mobile_money_number: value })}
              />
              {formData.mobile_money_provider && (
                <p className="text-xs text-muted-foreground">
                  Prefixo esperado: {MOBILE_MONEY_PROVIDERS.find(p => p.value === formData.mobile_money_provider)?.prefix}
                </p>
              )}
            </div>
          </div>
        )}
       </TabsContent>
 
       {staffType === 'teacher' && isEdit && (
         <TabsContent value="assignments" className="space-y-4 py-2">
           <div className="flex items-center gap-3 mb-2 px-1">
             <div className="p-2 bg-primary/10 rounded-full text-primary">
               <GraduationCap className="w-5 h-5" />
             </div>
             <div>
               <h3 className="font-semibold text-lg">Atribuições Pedagógicas</h3>
               <p className="text-sm text-muted-foreground">Configure as turmas e disciplinas deste docente</p>
             </div>
           </div>
           <TeacherAssignmentsManager 
             teacher={staffId ? { id: staffId, name: formData.name } : null} 
           />
         </TabsContent>
       )}
     </Tabs>
  );
}
