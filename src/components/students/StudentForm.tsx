import React, { useState } from 'react';
import { User, Users, Phone, FileText, Heart, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProvinceSelector } from '@/components/shared/ProvinceSelector';
import { MozambiqueInput } from '@/components/shared/MozambiqueInput';
import { Separator } from '@/components/ui/separator';
import { PhotoCapture } from './PhotoCapture';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RELATIONSHIP_OPTIONS } from '@/types/enrollment';

export interface StudentFormData {
  // Dados pessoais
  name: string;
  birth_date: string;
  gender: 'MASCULINO' | 'FEMININO';
  bi_number: string;
  nuit: string;
  nationality: string;
  phone: string;
  email: string;
  province: string;
  district: string;
  address: string;
  photo_url: string;
  health_notes: string;
  previous_school: string;
  // Encarregado
  guardian: string;
  guardian_relationship: string;
  guardian_bi: string;
  guardian_nuit: string;
  guardian_phone: string;
  guardian_phone_is_whatsapp: boolean;
  guardian_phone_alt: string;
  guardian_phone_alt_is_whatsapp: boolean;
  guardian_email: string;
  guardian_occupation: string;
  guardian_workplace: string;
  guardian_province: string;
  guardian_district: string;
  guardian_address: string;
  // Contacto de emergência
  emergency_contact: string;
  emergency_phone: string;
  emergency_relationship: string;
  // Turma
  class_id: number | undefined;
}

interface StudentFormProps {
  formData: StudentFormData;
  onChange: (data: StudentFormData) => void;
  classes: { id: number; name: string }[];
  isEdit?: boolean;
}

export const initialStudentFormData: StudentFormData = {
  name: '',
  birth_date: '',
  gender: 'MASCULINO',
  bi_number: '',
  nuit: '',
  nationality: 'Moçambicana',
  phone: '',
  email: '',
  province: '',
  district: '',
  address: '',
  photo_url: '',
  health_notes: '',
  previous_school: '',
  guardian: '',
  guardian_relationship: '',
  guardian_bi: '',
  guardian_nuit: '',
  guardian_phone: '',
  guardian_phone_is_whatsapp: true,
  guardian_phone_alt: '',
  guardian_phone_alt_is_whatsapp: false,
  guardian_email: '',
  guardian_occupation: '',
  guardian_workplace: '',
  guardian_province: '',
  guardian_district: '',
  guardian_address: '',
  emergency_contact: '',
  emergency_phone: '',
  emergency_relationship: '',
  class_id: undefined,
};

export function StudentForm({ formData, onChange, classes, isEdit }: StudentFormProps) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(formData.photo_url || null);

  const handlePhotoChange = (file: File | null, preview: string | null) => {
    setPhotoPreview(preview);
    if (file) {
      (window as any).__tempStudentPhotoFile = file;
    } else {
      (window as any).__tempStudentPhotoFile = null;
      onChange({ ...formData, photo_url: '' });
    }
  };

  return (
    <Tabs defaultValue="personal" className="w-full">
      <TabsList className="grid w-full grid-cols-4 mb-4">
        <TabsTrigger value="personal" className="text-xs sm:text-sm">
          <User className="w-4 h-4 mr-1 hidden sm:inline" />
          Pessoal
        </TabsTrigger>
        <TabsTrigger value="guardian" className="text-xs sm:text-sm">
          <Users className="w-4 h-4 mr-1 hidden sm:inline" />
          Encarregado
        </TabsTrigger>
        <TabsTrigger value="emergency" className="text-xs sm:text-sm">
          <Shield className="w-4 h-4 mr-1 hidden sm:inline" />
          Emergência
        </TabsTrigger>
        <TabsTrigger value="academic" className="text-xs sm:text-sm">
          <FileText className="w-4 h-4 mr-1 hidden sm:inline" />
          Académico
        </TabsTrigger>
      </TabsList>

      {/* ========== DADOS PESSOAIS ========== */}
      <TabsContent value="personal" className="space-y-4">
        <PhotoCapture
          photoPreview={photoPreview}
          name={formData.name}
          onPhotoChange={handlePhotoChange}
        />

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="s_name">Nome Completo *</Label>
          <Input
            id="s_name"
            placeholder="Nome completo do educando"
            value={formData.name}
            onChange={(e) => onChange({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="s_gender">Género *</Label>
            <Select
              value={formData.gender}
              onValueChange={(v) => onChange({ ...formData, gender: v as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MASCULINO">Masculino</SelectItem>
                <SelectItem value="FEMININO">Feminino</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="s_birth_date">Data de Nascimento *</Label>
            <Input
              id="s_birth_date"
              type="date"
              value={formData.birth_date}
              onChange={(e) => onChange({ ...formData, birth_date: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MozambiqueInput
            label="Número do BI"
            mask="BI"
            value={formData.bi_number}
            onChange={(v) => onChange({ ...formData, bi_number: v })}
          />
          <MozambiqueInput
            label="NUIT / Outro Documento"
            mask="NUIT"
            value={formData.nuit}
            onChange={(v) => onChange({ ...formData, nuit: v })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="s_nationality">Nacionalidade</Label>
            <Input
              id="s_nationality"
              value={formData.nationality}
              onChange={(e) => onChange({ ...formData, nationality: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="s_email">Email</Label>
            <Input
              id="s_email"
              type="email"
              placeholder="email@exemplo.mz"
              value={formData.email}
              onChange={(e) => onChange({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        <MozambiqueInput
          label="Telefone"
          mask="PHONE"
          value={formData.phone}
          onChange={(v) => onChange({ ...formData, phone: v })}
        />

        <ProvinceSelector
          selectedProvince={formData.province}
          selectedDistrict={formData.district}
          onProvinceChange={(v) => onChange({ ...formData, province: v, district: '' })}
          onDistrictChange={(v) => onChange({ ...formData, district: v })}
        />

        <div className="space-y-2">
          <Label htmlFor="s_address">Endereço</Label>
          <Textarea
            id="s_address"
            placeholder="Endereço completo"
            value={formData.address}
            onChange={(e) => onChange({ ...formData, address: e.target.value })}
            rows={2}
          />
        </div>
      </TabsContent>

      {/* ========== ENCARREGADO DE EDUCAÇÃO ========== */}
      <TabsContent value="guardian" className="space-y-4">
        <div className="rounded-lg border border-border/50 bg-muted/30 p-3 mb-2">
          <p className="text-sm text-muted-foreground">
            <Users className="w-4 h-4 inline mr-1" />
            Dados do Encarregado de Educação — responsável legal pelo educando.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Nome Completo do Encarregado *</Label>
          <Input
            placeholder="Nome completo"
            value={formData.guardian}
            onChange={(e) => onChange({ ...formData, guardian: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Grau de Parentesco *</Label>
            <Select
              value={formData.guardian_relationship}
              onValueChange={(v) => onChange({ ...formData, guardian_relationship: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione" />
              </SelectTrigger>
              <SelectContent>
                {RELATIONSHIP_OPTIONS.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Profissão</Label>
            <Input
              placeholder="Profissão ou ocupação"
              value={formData.guardian_occupation}
              onChange={(e) => onChange({ ...formData, guardian_occupation: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MozambiqueInput
            label="BI do Encarregado"
            mask="BI"
            value={formData.guardian_bi}
            onChange={(v) => onChange({ ...formData, guardian_bi: v })}
          />
          <MozambiqueInput
            label="NUIT / Outro Documento do Encarregado"
            mask="NUIT"
            value={formData.guardian_nuit}
            onChange={(v) => onChange({ ...formData, guardian_nuit: v })}
          />
        </div>

        <Separator />
        <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
          <Phone className="w-4 h-4" /> Contactos
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MozambiqueInput
            label="Telefone Principal *"
            mask="PHONE"
            value={formData.guardian_phone}
            onChange={(v) => onChange({ ...formData, guardian_phone: v })}
            showWhatsappToggle
            isWhatsapp={formData.guardian_phone_is_whatsapp}
            onWhatsappChange={(checked) => onChange({ ...formData, guardian_phone_is_whatsapp: checked })}
          />
          <MozambiqueInput
            label="Telefone Alternativo"
            mask="PHONE"
            value={formData.guardian_phone_alt}
            onChange={(v) => onChange({ ...formData, guardian_phone_alt: v })}
            showWhatsappToggle
            isWhatsapp={formData.guardian_phone_alt_is_whatsapp}
            onWhatsappChange={(checked) => onChange({ ...formData, guardian_phone_alt_is_whatsapp: checked })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Email do Encarregado</Label>
            <Input
              type="email"
              placeholder="email@exemplo.mz"
              value={formData.guardian_email}
              onChange={(e) => onChange({ ...formData, guardian_email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Local de Trabalho</Label>
            <Input
              placeholder="Nome da empresa/instituição"
              value={formData.guardian_workplace}
              onChange={(e) => onChange({ ...formData, guardian_workplace: e.target.value })}
            />
          </div>
        </div>

        <Separator />
        <p className="text-sm font-medium text-muted-foreground">Endereço do Encarregado</p>

        <ProvinceSelector
          selectedProvince={formData.guardian_province}
          selectedDistrict={formData.guardian_district}
          onProvinceChange={(v) => onChange({ ...formData, guardian_province: v, guardian_district: '' })}
          onDistrictChange={(v) => onChange({ ...formData, guardian_district: v })}
        />

        <div className="space-y-2">
          <Label>Endereço do Encarregado</Label>
          <Textarea
            placeholder="Endereço completo"
            value={formData.guardian_address}
            onChange={(e) => onChange({ ...formData, guardian_address: e.target.value })}
            rows={2}
          />
        </div>
      </TabsContent>

      {/* ========== CONTACTO DE EMERGÊNCIA ========== */}
      <TabsContent value="emergency" className="space-y-4">
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 mb-2">
          <p className="text-sm text-muted-foreground">
            <Shield className="w-4 h-4 inline mr-1 text-destructive" />
            Contacto de emergência — pessoa a contactar em caso de urgência (pode ser diferente do encarregado).
          </p>
        </div>

        <div className="space-y-2">
          <Label>Nome do Contacto de Emergência</Label>
          <Input
            placeholder="Nome completo"
            value={formData.emergency_contact}
            onChange={(e) => onChange({ ...formData, emergency_contact: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MozambiqueInput
            label="Telefone de Emergência"
            mask="PHONE"
            value={formData.emergency_phone}
            onChange={(v) => onChange({ ...formData, emergency_phone: v })}
          />
          <div className="space-y-2">
            <Label>Relação com o Educando</Label>
            <Select
              value={formData.emergency_relationship}
              onValueChange={(v) => onChange({ ...formData, emergency_relationship: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione" />
              </SelectTrigger>
              <SelectContent>
                {RELATIONSHIP_OPTIONS.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label className="flex items-center gap-1">
            <Heart className="w-4 h-4 text-destructive" />
            Informações de Saúde
          </Label>
          <Textarea
            placeholder="Alergias, condições médicas, medicamentos, grupo sanguíneo, etc."
            value={formData.health_notes}
            onChange={(e) => onChange({ ...formData, health_notes: e.target.value })}
            rows={4}
          />
        </div>
      </TabsContent>

      {/* ========== DADOS ACADÉMICOS ========== */}
      <TabsContent value="academic" className="space-y-4">
        <div className="space-y-2">
          <Label>Turma</Label>
          <Select
            value={formData.class_id?.toString() || ''}
            onValueChange={(v) => onChange({ ...formData, class_id: v ? Number(v) : undefined })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar turma (opcional)" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Escola Anterior</Label>
          <Input
            placeholder="Nome da escola anterior (se aplicável)"
            value={formData.previous_school}
            onChange={(e) => onChange({ ...formData, previous_school: e.target.value })}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
}
