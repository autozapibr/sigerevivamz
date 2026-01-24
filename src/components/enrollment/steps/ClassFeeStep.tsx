import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { formatMZN } from '@/lib/validators/mozambique';
import type { EnrollmentFormData } from '@/types/enrollment';

interface ClassFeeStepProps {
  form: UseFormReturn<EnrollmentFormData>;
}

export function ClassFeeStep({ form }: ClassFeeStepProps) {
  // Fetch available classes
  const { data: classes = [], isLoading } = useQuery({
    queryKey: ['classes-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('year', { ascending: true })
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });
  
  const monthlyFee = form.watch('monthly_fee') || 0;
  const enrollmentFee = form.watch('enrollment_fee') || 0;
  const discountPercent = form.watch('discount_percent') || 0;
  
  // Calculate totals
  const monthlyWithDiscount = monthlyFee * (1 - discountPercent / 100);
  const annualTotal = (monthlyWithDiscount * 12) + enrollmentFee;
  
  return (
    <Form {...form}>
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-foreground">
          Turma e Propinas
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Turma */}
          <FormField
            control={form.control}
            name="class_id"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Turma</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(parseInt(value))} 
                  value={field.value?.toString()}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={
                        isLoading ? "A carregar turmas..." : "Selecione a turma"
                      } />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {classes.map(cls => (
                      <SelectItem key={cls.id} value={cls.id.toString()}>
                        {cls.name} - {cls.year}ª Classe
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  A turma pode ser definida posteriormente pela secretaria.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Taxa de Matrícula */}
          <FormField
            control={form.control}
            name="enrollment_fee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Taxa de Matrícula (MZN)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      MT
                    </span>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      className="pl-10"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Propina Mensal */}
          <FormField
            control={form.control}
            name="monthly_fee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Propina Mensal (MZN)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      MT
                    </span>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      className="pl-10"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Desconto */}
          <FormField
            control={form.control}
            name="discount_percent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Desconto (%)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step={1}
                      className="pr-8"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      %
                    </span>
                  </div>
                </FormControl>
                <FormDescription>
                  Bolsa de estudo ou desconto especial.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Resumo Financeiro */}
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="pt-6">
            <h4 className="font-medium mb-4">Resumo Financeiro</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taxa de Matrícula:</span>
                <span>{formatMZN(enrollmentFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Propina Mensal:</span>
                <span>{formatMZN(monthlyFee)}</span>
              </div>
              {discountPercent > 0 && (
                <>
                  <div className="flex justify-between text-green-500">
                    <span>Desconto ({discountPercent}%):</span>
                    <span>- {formatMZN(monthlyFee * discountPercent / 100)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Propina com Desconto:</span>
                    <span>{formatMZN(monthlyWithDiscount)}</span>
                  </div>
                </>
              )}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total Anual Estimado:</span>
                  <span className="text-primary">{formatMZN(annualTotal)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  (Taxa de matrícula + 12 meses de propina)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Form>
  );
}
