import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Send } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  useCreateTicket,
  TicketCategory,
  TicketPriority,
  getCategoryLabel,
  getPriorityLabel,
} from '@/hooks/useTickets';

const ticketSchema = z.object({
  title: z.string().min(5, 'O assunto deve ter pelo menos 5 caracteres').max(200),
  description: z.string().min(20, 'A descrição deve ter pelo menos 20 caracteres').max(2000),
  category: z.enum(['RECLAMACAO', 'INFORMACAO', 'SUGESTAO', 'SUPORTE', 'FINANCEIRO', 'PEDAGOGICO', 'RH', 'OUTRO']),
  priority: z.enum(['BAIXA', 'NORMAL', 'ALTA', 'URGENTE']),
});

type TicketFormData = z.infer<typeof ticketSchema>;

const categories: TicketCategory[] = ['RECLAMACAO', 'INFORMACAO', 'SUGESTAO', 'SUPORTE', 'FINANCEIRO', 'PEDAGOGICO', 'RH', 'OUTRO'];
const priorities: TicketPriority[] = ['BAIXA', 'NORMAL', 'ALTA', 'URGENTE'];

interface NewTicketDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function NewTicketDialog({ trigger, onSuccess }: NewTicketDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const createTicket = useCreateTicket();

  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'OUTRO',
      priority: 'NORMAL',
    },
  });

  const onSubmit = async (data: TicketFormData) => {
    try {
      await createTicket.mutateAsync({
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority,
        created_by_name: user?.name || 'Utilizador Anónimo',
        created_by_role: user?.role || undefined,
      });

      toast({
        title: 'Ticket criado com sucesso!',
        description: 'O seu pedido foi registado e será atendido em breve.',
      });

      form.reset();
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Erro ao criar ticket',
        description: 'Ocorreu um erro ao criar o ticket. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Ticket
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Criar Novo Ticket</DialogTitle>
          <DialogDescription>
            Descreva o seu pedido, reclamação ou sugestão. A equipa irá responder assim que possível.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assunto</FormLabel>
                  <FormControl>
                    <Input placeholder="Resumo do seu pedido..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {getCategoryLabel(cat)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridade</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {priorities.map((pri) => (
                          <SelectItem key={pri} value={pri}>
                            {getPriorityLabel(pri)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva detalhadamente o seu pedido..."
                      className="min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createTicket.isPending} className="gap-2">
                <Send className="w-4 h-4" />
                {createTicket.isPending ? 'A enviar...' : 'Enviar Ticket'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
