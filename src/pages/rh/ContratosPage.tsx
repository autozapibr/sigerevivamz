import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, FileText, AlertTriangle, CheckCircle, 
  Clock, Calendar, Banknote, User, Filter
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { pt } from 'date-fns/locale';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useContracts, useContractsStats, CONTRACT_TYPES, type ContractFilters } from '@/hooks/useContracts';

export default function ContratosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContractFilters['status']>('all');
  const [contractTypeFilter, setContractTypeFilter] = useState<string>('all');

  const filters: ContractFilters = {
    search: searchTerm,
    status: statusFilter,
    contractType: contractTypeFilter !== 'all' ? contractTypeFilter : undefined,
  };

  const { data: contracts = [], isLoading } = useContracts(filters);
  const { data: stats } = useContractsStats();

  const getInitials = (name: string) => 
    name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Activo':
        return <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-0">Activo</Badge>;
      case 'A Expirar':
        return <Badge className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-0">A Expirar</Badge>;
      case 'Expirado':
        return <Badge className="bg-destructive/10 text-destructive border-0">Expirado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getDaysRemaining = (endDate: string | null) => {
    if (!endDate) return null;
    const days = differenceInDays(new Date(endDate), new Date());
    return days;
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return '-';
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <MainLayout title="Contratos" subtitle="Gestão de contratos de trabalho">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats?.total || 0}</p>
                </div>
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-500/10 border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-500">Activos</p>
                  <p className="text-2xl font-bold text-green-500">{stats?.activos || 0}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-orange-500/10 border-orange-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-500">A Expirar</p>
                  <p className="text-2xl font-bold text-orange-500">{stats?.aExpirar || 0}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-destructive/10 border-destructive/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-destructive">Expirados</p>
                  <p className="text-2xl font-bold text-destructive">{stats?.expirados || 0}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar por nome ou nº de contrato..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v as any)}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="Activo">Activos</SelectItem>
                    <SelectItem value="A Expirar">A Expirar</SelectItem>
                    <SelectItem value="Expirado">Expirados</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={contractTypeFilter} onValueChange={setContractTypeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Tipos</SelectItem>
                    {CONTRACT_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contracts Table - Desktop */}
        <Card className="hidden md:block">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Nº Contrato</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Salário</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    </TableRow>
                  ))
                ) : contracts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      {searchTerm || statusFilter !== 'all' || contractTypeFilter !== 'all'
                        ? 'Nenhum contrato encontrado com os filtros aplicados.'
                        : 'Nenhum contrato registado. Adicione contratos nos cadastros de Professores ou Colaboradores.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  contracts.map((contract, index) => {
                    const daysRemaining = getDaysRemaining(contract.contract_end);
                    return (
                      <motion.tr
                        key={`${contract.staff_type}-${contract.id}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.03 }}
                        className="group"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={contract.photo_url || undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                {getInitials(contract.staff_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{contract.staff_name}</p>
                              <p className="text-xs text-muted-foreground">{contract.staff_role}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {contract.contract_number || '-'}
                        </TableCell>
                        <TableCell>{contract.contract_type || '-'}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="w-3 h-3" />
                              {contract.contract_start 
                                ? format(new Date(contract.contract_start), 'dd/MM/yyyy', { locale: pt })
                                : '-'}
                              {' → '}
                              {contract.contract_end 
                                ? format(new Date(contract.contract_end), 'dd/MM/yyyy', { locale: pt })
                                : 'Indeterminado'}
                            </div>
                            {daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 30 && (
                              <p className="text-xs text-orange-500">
                                Expira em {daysRemaining} dias
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(contract.salary)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(contract.status)}
                        </TableCell>
                      </motion.tr>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Contracts Cards - Mobile */}
        <div className="md:hidden space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))
          ) : contracts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                Nenhum contrato encontrado
              </CardContent>
            </Card>
          ) : (
            contracts.map((contract, index) => {
              const daysRemaining = getDaysRemaining(contract.contract_end);
              return (
                <motion.div
                  key={`${contract.staff_type}-${contract.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={contract.photo_url || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {getInitials(contract.staff_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{contract.staff_name}</p>
                            <p className="text-sm text-muted-foreground">{contract.staff_role}</p>
                          </div>
                        </div>
                        {getStatusBadge(contract.status)}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Nº Contrato</p>
                          <p className="font-mono">{contract.contract_number || '-'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Tipo</p>
                          <p>{contract.contract_type || '-'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Salário</p>
                          <p className="font-medium">{formatCurrency(contract.salary)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Validade</p>
                          <p>
                            {contract.contract_end 
                              ? format(new Date(contract.contract_end), 'dd/MM/yyyy', { locale: pt })
                              : 'Indeterminado'}
                          </p>
                          {daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 30 && (
                            <p className="text-xs text-orange-500">
                              {daysRemaining} dias restantes
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </MainLayout>
  );
}
