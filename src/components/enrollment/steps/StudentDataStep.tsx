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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MozambiqueInput } from '@/components/shared/MozambiqueInput';
import { ProvinceSelector } from '@/components/shared/ProvinceSelector';
import { PROVINCES, DISTRICTS_BY_PROVINCE, type Province } from '@/lib/validators/mozambique';
import type { EnrollmentFormData } from '@/types/enrollment';

interface StudentDataStepProps {
  form: UseFormReturn<EnrollmentFormData>;
}

export function StudentDataStep({ form }: StudentDataStepProps) {
  const selectedProvince = form.watch('province') as Province;
  const districts = selectedProvince ? DISTRICTS_BY_PROVINCE[selectedProvince] || [] : [];
  
  return (
    <Form {...form}>
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-foreground">
          Dados Pessoais do Educando
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nome Completo */}
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Nome Completo *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: João Manuel da Silva" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Data de Nascimento */}
          <FormField
            control={form.control}
            name="birth_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Nascimento *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Género */}
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Género *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="MASCULINO">Masculino</SelectItem>
                    <SelectItem value="FEMININO">Feminino</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* BI */}
          <FormField
            control={form.control}
            name="bi_number"
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
          
          {/* NUIT */}
          <FormField
            control={form.control}
            name="nuit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NUIT</FormLabel>
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
          
          {/* Nacionalidade */}
          <FormField
            control={form.control}
            name="nationality"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nacionalidade</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Telefone */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <MozambiqueInput
                    mask="PHONE"
                    value={field.value || ''}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Email */}
          <FormField
            control={form.control}
            name="email"
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
          
          {/* Província */}
          <FormField
            control={form.control}
            name="province"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Província *</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    form.setValue('district', '');
                  }} 
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a província" />
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
            name="district"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Distrito *</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value}
                  disabled={!selectedProvince}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={
                        selectedProvince ? "Selecione o distrito" : "Selecione primeiro a província"
                      } />
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
            name="address"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Endereço Completo *</FormLabel>
                <FormControl>
                  <Input placeholder="Bairro, rua, número da casa..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Escola Anterior */}
          <FormField
            control={form.control}
            name="previous_school"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Escola Anterior (se aplicável)</FormLabel>
                <FormControl>
                  <Input placeholder="Nome da escola anterior" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Informações de Saúde */}
          <FormField
            control={form.control}
            name="health_notes"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Informações de Saúde</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Alergias, condições médicas, medicamentos..."
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
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
