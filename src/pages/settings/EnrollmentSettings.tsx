import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Settings2, Calendar, DollarSign, Plus, Save, Trash2, 
  GraduationCap, Clock, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { useAcademicYears, useCurrentAcademicYear } from '@/hooks/useEnrollments';
import { 
  useEducationLevels, 
  useEducationLevelFees, 
  useEnrollmentPeriods,
  useUpsertEducationLevelFee,
  useUpsertEnrollmentPeriod
} from '@/hooks/useEnrollmentConfig';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatMZN } from '@/lib/validators/mozambique';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function EnrollmentSettings() {
  const { data: academicYears = [] } = useAcademicYears();
  const { data: currentYear } = useCurrentAcademicYear();
  const [selectedYearId, setSelectedYearId] = useState<number | undefined>(currentYear?.id);
  
  const { data: levels = [] } = useEducationLevels();
  const { data: fees = [], isLoading: isLoadingFees } = useEducationLevelFees(selectedYearId || currentYear?.id);
  const { data: periods = [], isLoading: isLoadingPeriods } = useEnrollmentPeriods(selectedYearId || currentYear?.id);
  
  const upsertFee = useUpsertEducationLevelFee();
  const upsertPeriod = useUpsertEnrollmentPeriod();

  // Local state for forms
  const [editingFee, setEditingFee] = useState<any>(null);
  const [editingPeriod, setEditingPeriod] = useState<any>(null);

  const handleSaveFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedYearId || !editingFee.education_level_id) return;
    
    await upsertFee.mutateAsync({
      ...editingFee,
      academic_year_id: selectedYearId,
    });
    setEditingFee(null);
  };

  const handleSavePeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedYearId || !editingPeriod.education_level_id) return;
    
    await upsertPeriod.mutateAsync({
      ...editingPeriod,
      academic_year_id: selectedYearId,
    });
    setEditingPeriod(null);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader 
          title="Configurações de Matrículas" 
          subtitle="Configure períodos, valores e níveis de ensino para o ano lectivo"
          icon={Settings2}
        />

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Label htmlFor="year-select">Ano Lectivo:</Label>
              <Select 
                value={selectedYearId?.toString() || currentYear?.id?.toString()} 
                onValueChange={(v) => setSelectedYearId(parseInt(v))}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Seleccione o ano" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map(year => (
                    <SelectItem key={year.id} value={year.id.toString()}>
                      {year.name} {year.is_current && "(Actual)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="fees" className="space-y-4">
          <TabsList>
            <TabsTrigger value="fees" className="gap-2">
              <DollarSign className="w-4 h-4" /> Valores por Etapa
            </TabsTrigger>
            <TabsTrigger value="periods" className="gap-2">
              <Calendar className="w-4 h-4" /> Períodos de Inscrição
            </TabsTrigger>
          </TabsList>

          <TabsContent value="fees" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                {isLoadingFees ? (
                  <Card><CardContent className="p-8 text-center">A carregar valores...</CardContent></Card>
                ) : fees.length === 0 ? (
                  <Card><CardContent className="p-8 text-center text-muted-foreground">Nenhum valor configurado para este ano.</CardContent></Card>
                ) : (
                  fees.map(fee => (
                    <Card key={fee.id}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-lg">{fee.education_level?.name}</h4>
                          <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                            <span>Matrícula: <strong className="text-foreground">{formatMZN(fee.enrollment_fee)}</strong></span>
                            <span>Mensalidade: <strong className="text-foreground">{formatMZN(fee.monthly_fee)}</strong></span>
                            <span>Re-matrícula: <strong className="text-foreground">{formatMZN(fee.re_enrollment_fee)}</strong></span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setEditingFee(fee)}>Editar</Button>
                      </CardContent>
                    </Card>
                  ))
                )}
                <Button className="w-full gap-2" variant="dashed" onClick={() => setEditingFee({ 
                  education_level_id: levels[0]?.id, 
                  enrollment_fee: 0, 
                  monthly_fee: 0, 
                  re_enrollment_fee: 0 
                })}>
                  <Plus className="w-4 h-4" /> Adicionar Configuração de Nível
                </Button>
              </div>

              <div>
                {editingFee && (
                  <Card className="sticky top-4">
                    <CardHeader>
                      <CardTitle>{editingFee.id ? 'Editar Valores' : 'Novos Valores'}</CardTitle>
                      <CardDescription>Defina os custos padrão para este nível de ensino</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSaveFee} className="space-y-4">
                        <div className="space-y-2">
                          <Label>Nível de Ensino</Label>
                          <Select 
                            disabled={!!editingFee.id}
                            value={editingFee.education_level_id?.toString()}
                            onValueChange={(v) => setEditingFee({...editingFee, education_level_id: parseInt(v)})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione o nível" />
                            </SelectTrigger>
                            <SelectContent>
                              {levels.map(l => (
                                <SelectItem key={l.id} value={l.id.toString()}>{l.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Taxa de Matrícula (MZN)</Label>
                          <Input 
                            type="number" 
                            value={editingFee.enrollment_fee} 
                            onChange={e => setEditingFee({...editingFee, enrollment_fee: parseFloat(e.target.value)})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Propina Mensal (MZN)</Label>
                          <Input 
                            type="number" 
                            value={editingFee.monthly_fee} 
                            onChange={e => setEditingFee({...editingFee, monthly_fee: parseFloat(e.target.value)})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Taxa de Re-matrícula (MZN)</Label>
                          <Input 
                            type="number" 
                            value={editingFee.re_enrollment_fee} 
                            onChange={e => setEditingFee({...editingFee, re_enrollment_fee: parseFloat(e.target.value)})}
                          />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button type="submit" className="flex-1 gap-2" disabled={upsertFee.isPending}>
                            <Save className="w-4 h-4" /> Salvar
                          </Button>
                          <Button type="button" variant="ghost" onClick={() => setEditingFee(null)}>Cancelar</Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="periods" className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                {isLoadingPeriods ? (
                   <Card><CardContent className="p-8 text-center">A carregar períodos...</CardContent></Card>
                ) : periods.length === 0 ? (
                  <Card><CardContent className="p-8 text-center text-muted-foreground">Nenhum período definido.</CardContent></Card>
                ) : (
                  periods.map(period => (
                    <Card key={period.id}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-full ${period.type === 'NEW' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                             {period.type === 'NEW' ? <Plus className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold">{period.type === 'NEW' ? 'Matrículas' : 'Re-matrículas'}</h4>
                              <Badge variant="outline">{period.education_level?.name}</Badge>
                              {period.is_active ? 
                                <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Activo</Badge> : 
                                <Badge variant="secondary">Inactivo</Badge>
                              }
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              Período: <strong>{format(new Date(period.start_date), 'dd/MM/yyyy')}</strong> até <strong>{format(new Date(period.end_date), 'dd/MM/yyyy')}</strong>
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setEditingPeriod(period)}>Editar</Button>
                      </CardContent>
                    </Card>
                  ))
                )}
                <Button className="w-full gap-2" variant="dashed" onClick={() => setEditingPeriod({ 
                  education_level_id: levels[0]?.id,
                  type: 'NEW',
                  start_date: new Date().toISOString().split('T')[0],
                  end_date: new Date().toISOString().split('T')[0],
                  is_active: true
                })}>
                  <Plus className="w-4 h-4" /> Definir Novo Período
                </Button>
              </div>

              <div>
                {editingPeriod && (
                  <Card className="sticky top-4">
                    <CardHeader>
                      <CardTitle>{editingPeriod.id ? 'Editar Período' : 'Novo Período'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSavePeriod} className="space-y-4">
                        <div className="space-y-2">
                          <Label>Tipo</Label>
                          <Select 
                            value={editingPeriod.type}
                            onValueChange={(v: EnrollmentType) => setEditingPeriod({...editingPeriod, type: v})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="NEW">Matrícula (Novos Alunos)</SelectItem>
                              <SelectItem value="RENEWAL">Re-matrícula (Continuidade)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Nível de Ensino</Label>
                          <Select 
                            value={editingPeriod.education_level_id?.toString()}
                            onValueChange={(v) => setEditingPeriod({...editingPeriod, education_level_id: parseInt(v)})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione o nível" />
                            </SelectTrigger>
                            <SelectContent>
                              {levels.map(l => (
                                <SelectItem key={l.id} value={l.id.toString()}>{l.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-2">
                            <Label>Início</Label>
                            <Input 
                              type="date" 
                              value={editingPeriod.start_date}
                              onChange={e => setEditingPeriod({...editingPeriod, start_date: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Fim</Label>
                            <Input 
                              type="date" 
                              value={editingPeriod.end_date}
                              onChange={e => setEditingPeriod({...editingPeriod, end_date: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 py-2">
                          <input 
                            type="checkbox" 
                            id="is_active" 
                            checked={editingPeriod.is_active}
                            onChange={e => setEditingPeriod({...editingPeriod, is_active: e.target.checked})}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <Label htmlFor="is_active">Activar este período agora</Label>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button type="submit" className="flex-1 gap-2" disabled={upsertPeriod.isPending}>
                            <Save className="w-4 h-4" /> Salvar
                          </Button>
                          <Button type="button" variant="ghost" onClick={() => setEditingPeriod(null)}>Cancelar</Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
