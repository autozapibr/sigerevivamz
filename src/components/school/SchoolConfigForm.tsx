import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PROVINCES, Province } from '@/lib/validators/mozambique';

const schoolSchema = z.object({
  name: z.string().min(3, 'Nome da escola deve ter pelo menos 3 caracteres'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
});

type SchoolFormData = z.infer<typeof schoolSchema>;

export function SchoolConfigForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [province, setProvince] = useState<Province | ''>('');

  // Buscar configuração existente
  const { data: school, isLoading } = useQuery({
    queryKey: ['school-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .limit(1)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<SchoolFormData>({
    resolver: zodResolver(schoolSchema),
    defaultValues: school || {},
  });

  // Atualizar valores do formulário quando school carregar
  React.useEffect(() => {
    if (school) {
      setValue('name', school.name || '');
      setValue('address', school.address || '');
      setValue('phone', school.phone || '');
      setValue('email', school.email || '');
    }
  }, [school, setValue]);

  const saveMutation = useMutation({
    mutationFn: async (formData: SchoolFormData) => {
      const payload = {
        name: formData.name,
        address: formData.address || null,
        phone: formData.phone || null,
        email: formData.email || null,
      };

      if (school?.id) {
        // Atualizar
        const { error } = await supabase
          .from('schools')
          .update(payload)
          .eq('id', school.id);
        if (error) throw error;
      } else {
        // Criar
        const { error } = await supabase
          .from('schools')
          .insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-config'] });
      toast({
        title: 'Sucesso',
        description: 'Configurações da escola salvas com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao salvar configurações',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: SchoolFormData) => {
    saveMutation.mutate(data);
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Configuração da Escola
        </CardTitle>
        <CardDescription>
          Configure os dados da sua instituição de ensino
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Escola *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Ex: Escola Primária de Maputo"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="province">Província</Label>
              <Select value={province} onValueChange={(v) => setProvince(v as Province)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar província" />
                </SelectTrigger>
                <SelectContent>
                  {PROVINCES.map((prov) => (
                    <SelectItem key={prov} value={prov}>
                      {prov}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                {...register('address')}
                placeholder="Ex: Av. Julius Nyerere, 123"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="Ex: +258 84 123 4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="Ex: secretaria@escola.mz"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={saveMutation.isPending}>
              <Save className="w-4 h-4 mr-2" />
              {saveMutation.isPending ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}