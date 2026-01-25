import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const enrollmentSchema = z.object({
  student_id: z.string().min(1, 'Selecione um educando'),
  turma_id: z.string().min(1, 'Selecione uma turma'),
  academic_year_id: z.string().min(1, 'Selecione o ano letivo'),
  status: z.enum(['ATIVO', 'TRANSFERIDO', 'GRADUADO', 'INATIVO']).default('ATIVO'),
});

type EnrollmentFormData = z.infer<typeof enrollmentSchema>;

interface EnrollmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: EnrollmentFormData) => void;
  isLoading?: boolean;
}

export function EnrollmentForm({ open, onOpenChange, onSubmit, isLoading }: EnrollmentFormProps) {
  const { toast } = useToast();
  const form = useForm<EnrollmentFormData>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: {
      status: 'ATIVO',
    },
  });

  const handleSubmit = (data: EnrollmentFormData) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Matrícula</DialogTitle>
          <DialogDescription>
            Registe um educando numa turma para o ano letivo
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="student_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Educando</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar educando" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">João Silva - 250001</SelectItem>
                      <SelectItem value="2">Maria Costa - 250002</SelectItem>
                      <SelectItem value="3">Carlos Nunes - 250003</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="turma_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Turma</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar turma" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">10ª A - Matutino</SelectItem>
                      <SelectItem value="2">10ª B - Vespertino</SelectItem>
                      <SelectItem value="3">11ª A - Matutino</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="academic_year_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ano Lectivo</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar ano lectivo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">2025</SelectItem>
                      <SelectItem value="2">2024</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ATIVO">Ativo</SelectItem>
                      <SelectItem value="TRANSFERIDO">Transferido</SelectItem>
                      <SelectItem value="GRADUADO">Graduado</SelectItem>
                      <SelectItem value="INATIVO">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Matricular
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
