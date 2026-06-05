import React from 'react';
import { Search, Filter, MessageSquare, Inbox, CheckCircle2, Clock, AlertTriangle, Ticket } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TicketCard } from '@/components/tickets/TicketCard';
import { TicketDetail } from '@/components/tickets/TicketDetail';
import { NewTicketDialog } from '@/components/tickets/NewTicketDialog';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import {
  useTickets,
  TicketStatus,
  TicketCategory,
  Ticket as TicketType,
  getStatusLabel,
  getCategoryLabel,
} from '@/hooks/useTickets';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLocation } from 'react-router-dom';

const statusFilters: { value: TicketStatus | 'all'; label: string; icon: React.ElementType }[] = [
  { value: 'all', label: 'Todos', icon: Inbox },
  { value: 'ABERTO', label: 'Abertos', icon: AlertTriangle },
  { value: 'EM_ANDAMENTO', label: 'Em Andamento', icon: Clock },
  { value: 'AGUARDANDO', label: 'Aguardando', icon: MessageSquare },
  { value: 'RESOLVIDO', label: 'Resolvidos', icon: CheckCircle2 },
];

const categoryFilters: TicketCategory[] = ['SECRETARIA', 'RECLAMACAO', 'INFORMACAO', 'SUGESTAO', 'SUPORTE', 'FINANCEIRO', 'PEDAGOGICO', 'RH', 'OUTRO'];

export default function ComunicacaoPage() {
  const [statusFilter, setStatusFilter] = React.useState<TicketStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = React.useState<TicketCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedTicket, setSelectedTicket] = React.useState<TicketType | null>(null);
  const isMobile = useIsMobile();
  const location = useLocation();

  const { data: tickets = [], isLoading, refetch } = useTickets({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
  });

  // Auto-open ticket from navigation state (e.g. clicking notification)
  React.useEffect(() => {
    const targetId = (location.state as any)?.ticketId as number | undefined;
    if (!targetId || !tickets.length) return;
    const found = tickets.find((t) => t.id === targetId);
    if (found) {
      setSelectedTicket(found);
      // clear state so it doesn't re-trigger
      window.history.replaceState({}, '');
    }
  }, [tickets, location.state]);

  // Filter by search
  const filteredTickets = React.useMemo(() => {
    if (!searchQuery.trim()) return tickets;
    const query = searchQuery.toLowerCase();
    return tickets.filter(
      (t) =>
        t.title.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.ticket_number.toLowerCase().includes(query) ||
        t.created_by_name.toLowerCase().includes(query)
    );
  }, [tickets, searchQuery]);

  // Stats
  const stats = React.useMemo(() => {
    const all = tickets.length;
    const open = tickets.filter((t) => t.status === 'ABERTO').length;
    const inProgress = tickets.filter((t) => t.status === 'EM_ANDAMENTO').length;
    const resolved = tickets.filter((t) => t.status === 'RESOLVIDO' || t.status === 'FECHADO').length;
    return { all, open, inProgress, resolved };
  }, [tickets]);

  const handleTicketClick = (ticket: TicketType) => {
    setSelectedTicket(ticket);
  };

  const handleCloseDetail = () => {
    setSelectedTicket(null);
  };

  return (
    <MainLayout>
      <div className="space-y-6 max-w-full overflow-x-hidden">
        <PageHeader
          title="Central de Comunicação"
          description="Sistema de tickets para comunicação interna entre departamentos"
          icon={<MessageSquare className="w-6 h-6" />}
          actions={
            <NewTicketDialog onSuccess={refetch} />
          }
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard
            title="Total"
            value={stats.all}
            icon={Ticket}
            color="text-foreground"
          />
          <StatsCard
            title="Abertos"
            value={stats.open}
            icon={AlertTriangle}
            color="text-blue-500"
          />
          <StatsCard
            title="Em Andamento"
            value={stats.inProgress}
            icon={Clock}
            color="text-amber-500"
          />
          <StatsCard
            title="Resolvidos"
            value={stats.resolved}
            icon={CheckCircle2}
            color="text-green-500"
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tickets List */}
          <div className={cn(
            "lg:col-span-1",
            selectedTicket && isMobile && "hidden"
          )}>
            <Card className="h-[calc(100vh-320px)]">
              <CardHeader className="pb-4">
                <div className="flex flex-col gap-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Pesquisar tickets..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Filters */}
                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      value={statusFilter}
                      onValueChange={(v) => setStatusFilter(v as TicketStatus | 'all')}
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os estados</SelectItem>
                        {statusFilters.slice(1).map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={categoryFilter}
                      onValueChange={(v) => setCategoryFilter(v as TicketCategory | 'all')}
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder="Categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas categorias</SelectItem>
                        {categoryFilters.map((c) => (
                          <SelectItem key={c} value={c}>
                            {getCategoryLabel(c)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-520px)]">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <LoadingSpinner />
                    </div>
                  ) : filteredTickets.length === 0 ? (
                    <div className="px-6 py-12">
                      <EmptyState
                        title="Nenhum ticket encontrado"
                        description="Crie um novo ticket para iniciar uma conversa"
                        action={<NewTicketDialog onSuccess={refetch} />}
                      />
                    </div>
                  ) : (
                    <div className="space-y-3 px-4 pb-4">
                      {filteredTickets.map((ticket) => (
                        <TicketCard
                          key={ticket.id}
                          ticket={ticket}
                          onClick={() => handleTicketClick(ticket)}
                          isSelected={selectedTicket?.id === ticket.id}
                        />
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Ticket Detail */}
          <div className={cn(
            "lg:col-span-2",
            !selectedTicket && "hidden lg:block"
          )}>
            {selectedTicket ? (
              <div className="h-[calc(100vh-320px)]">
                <TicketDetail
                  ticket={selectedTicket}
                  onClose={isMobile ? handleCloseDetail : undefined}
                />
              </div>
            ) : (
              <Card className="h-[calc(100vh-320px)] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Seleccione um ticket</p>
                  <p className="text-sm">Clique num ticket para ver os detalhes</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

// Stats Card component
function StatsCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <Icon className={cn("w-8 h-8", color)} />
        </div>
      </CardContent>
    </Card>
  );
}
