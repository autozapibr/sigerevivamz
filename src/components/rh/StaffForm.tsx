import React, { useState, useRef } from 'react';
import { Camera, Upload, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProvinceSelector } from '@/components/shared/ProvinceSelector';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CONTRACT_TYPES } from '@/hooks/useContracts';
import { useUploadStaffPhoto } from '@/hooks/useStaffDocuments';

interface StaffFormData {
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
  status: string;
}

interface StaffFormProps {
  staffType: 'teacher' | 'employee';
  formData: StaffFormData;
  onChange: (data: StaffFormData) => void;
  isEdit?: boolean;
  staffId?: number;
}

const EMPLOYEE_ROLES = [
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

const DEPARTMENTS = [
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

const BANKS = [
  'BCI - Banco Comercial e de Investimentos',
  'BIM - Banco Internacional de Moçambique',
  'Standard Bank',
  'Absa Moçambique',
  'Moza Banco',
  'First National Bank',
  'UBA Moçambique',
  'Access Bank',
  'Letshego',
  'MyBucks',
  'Outro',
];

export function StaffForm({ staffType, formData, onChange, isEdit, staffId }: StaffFormProps) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(formData.photo_url || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const removePhoto = () => {
    setPhotoPreview(null);
    onChange({ ...formData, photo_url: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Tabs defaultValue="personal" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-4">
        <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
        <TabsTrigger value="professional">Profissional</TabsTrigger>
        <TabsTrigger value="financial">Financeiro</TabsTrigger>
      </TabsList>

      <TabsContent value="personal" className="space-y-4">
        {/* Photo Upload */}
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
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadPhoto.isPending}
            >
              <Camera className="w-4 h-4 mr-2" />
              {uploadPhoto.isPending ? 'A carregar...' : 'Carregar Foto'}
            </Button>
            <p className="text-xs text-muted-foreground">JPG, PNG até 2MB</p>
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
          <div className="space-y-2">
            <Label htmlFor="bi_number">Número do BI</Label>
            <Input
              id="bi_number"
              placeholder="123456789012L"
              value={formData.bi_number}
              onChange={(e) => onChange({ ...formData, bi_number: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nuit">NUIT</Label>
            <Input
              id="nuit"
              placeholder="123456789"
              value={formData.nuit}
              onChange={(e) => onChange({ ...formData, nuit: e.target.value })}
            />
          </div>
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
            <Input
              id="phone"
              placeholder="+258 84 000 0000"
              value={formData.phone}
              onChange={(e) => onChange({ ...formData, phone: e.target.value })}
            />
          </div>
        </div>

        {/* Province & District */}
        {/* Province & District */}
        <ProvinceSelector
          selectedProvince={formData.province as any}
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
            <Input
              id="emergency_phone"
              placeholder="+258 84 000 0000"
              value={formData.emergency_phone}
              onChange={(e) => onChange({ ...formData, emergency_phone: e.target.value })}
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
          <Label htmlFor="salary">Salário (MZN)</Label>
          <Input
            id="salary"
            type="number"
            placeholder="0.00"
            value={formData.salary}
            onChange={(e) => onChange({ ...formData, salary: e.target.value })}
          />
        </div>

        {/* Bank Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <Label htmlFor="bank_account">Número da Conta</Label>
            <Input
              id="bank_account"
              placeholder="Número da conta bancária"
              value={formData.bank_account}
              onChange={(e) => onChange({ ...formData, bank_account: e.target.value })}
            />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
