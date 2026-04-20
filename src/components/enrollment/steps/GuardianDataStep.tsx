import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MozambiqueInput } from '@/components/shared/MozambiqueInput';
import { PROVINCES, DISTRICTS_BY_PROVINCE, type Province } from '@/lib/validators/mozambique';
import { RELATIONSHIP_OPTIONS, type EnrollmentFormData } from '@/types/enrollment';

interface GuardianDataStepProps {
  form: UseFormReturn<EnrollmentFormData>;
}

export function GuardianDataStep({ form }: GuardianDataStepProps) {
  const selectedProvince = form.watch('guardian.province') as Province | undefined;
  const districts = selectedProvince ? DISTRICTS_BY_PROVINCE[selectedProvince] || [] : [];
  
  return (
    <Form {...form}>
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-foreground">
          Dados do Encarregado de Educação
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nome Completo */}
          <FormField
            control={form.control}
            name="guardian.full_name"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Nome Completo *</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do encarregado de educação" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Parentesco */}
          <FormField
            control={form.control}
            name="guardian.relationship"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grau de Parentesco *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {RELATIONSHIP_OPTIONS.map(rel => (
                      <SelectItem key={rel} value={rel}>{rel}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Telefone Principal */}
          <FormField
            control={form.control}
            name="guardian.phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone Principal *</FormLabel>
                <FormControl>
                  <MozambiqueInput
                    mask="PHONE"
                    value={field.value || ''}
                    onChange={field.onChange}
                    showWhatsappToggle
                    isWhatsapp={form.watch('guardian.phone_is_whatsapp') ?? true}
                    onWhatsappChange={(checked) =>
                      form.setValue('guardian.phone_is_whatsapp', checked)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Telefone Alternativo */}
          <FormField
            control={form.control}
            name="guardian.phone_alt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone Alternativo</FormLabel>
                <FormControl>
                  <MozambiqueInput
                    mask="PHONE"
                    value={field.value || ''}
                    onChange={field.onChange}
                    showWhatsappToggle
                    isWhatsapp={form.watch('guardian.phone_alt_is_whatsapp') ?? false}
                    onWhatsappChange={(checked) =>
                      form.setValue('guardian.phone_alt_is_whatsapp', checked)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Email */}
          <FormField
            control={form.control}
            name="guardian.email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="email@exemplo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* BI */}
          <FormField
            control={form.control}
            name="guardian.bi_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bilhete de Identidade</FormLabel>
                <FormControl>
                  <MozambiqueInput
                    mask="BI"
                    value={field.value || ''}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* NUIT / Outro Documento */}
          <FormField
            control={form.control}
            name="guardian.nuit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NUIT / Outro Documento</FormLabel>
                <FormControl>
                  <MozambiqueInput
                    mask="NUIT"
                    value={field.value || ''}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Profissão */}
          <FormField
            control={form.control}
            name="guardian.occupation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Profissão</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Professor, Comerciante..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Local de Trabalho */}
          <FormField
            control={form.control}
            name="guardian.workplace"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Local de Trabalho</FormLabel>
                <FormControl>
                  <Input placeholder="Nome da empresa/instituição" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Província */}
          <FormField
            control={form.control}
            name="guardian.province"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Província</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    form.setValue('guardian.district', '');
                  }} 
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione a província" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PROVINCES.map(province => (
                      <SelectItem key={province} value={province}>
                        {province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Distrito */}
          <FormField
            control={form.control}
            name="guardian.district"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Distrito</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value}
                  disabled={!selectedProvince}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione o distrito" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {districts.map(district => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Endereço */}
          <FormField
            control={form.control}
            name="guardian.address"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Endereço</FormLabel>
                <FormControl>
                  <Input placeholder="Bairro, rua, número da casa..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </Form>
  );
}
