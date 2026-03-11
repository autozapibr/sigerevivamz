import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, isSameMonth, isToday, addDays, 
  getWeek, addWeeks, subWeeks, isSameDay
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  ChevronLeft, ChevronRight, Plus, CalendarDays, Flag, 
  GraduationCap, Clock, CalendarIcon, List, LayoutGrid
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCalendarEventsByMonth, useCreateCalendarEvent, MOZAMBIQUE_HOLIDAYS_2026, CalendarEventType, CalendarEventInsert } from '@/hooks/useCalendarEvents';

type ViewMode = 'month' | 'week';

const eventTypeConfig: Record<CalendarEventType, { icon: React.ReactNode; color: string; bgColor: string }> = {
  Feriado: { icon: <Flag className="w-3 h-3" />, color: 'bg-red-500', bgColor: 'bg-red-500/10 text-red-500' },
  Evento: { icon: <CalendarDays className="w-3 h-3" />, color: 'bg-blue-500', bgColor: 'bg-blue-500/10 text-blue-500' },
  Prova: { icon: <GraduationCap className="w-3 h-3" />, color: 'bg-orange-500', bgColor: 'bg-orange-500/10 text-orange-500' },
  Prazo: { icon: <Clock className="w-3 h-3" />, color: 'bg-purple-500', bgColor: 'bg-purple-500/10 text-purple-500' },
  Actividade: { icon: <CalendarDays className="w-3 h-3" />, color: 'bg-emerald-500', bgColor: 'bg-emerald-500/10 text-emerald-500' },
};

export default function CalendarioPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [formData, setFormData] = useState<CalendarEventInsert>({
    title: '',
    description: '',
    date: '',
    type: 'Evento',
    start_time: null,
    end_time: null,
    location: null,
    is_all_day: true,
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const { data: events = [], isLoading } = useCalendarEventsByMonth(year, month);
  const createEvent = useCreateCalendarEvent();

  // Month view days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const monthDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Week view days
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getEventsForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dbEvents = events.filter(e => e.date === dateStr);
    const holidays = MOZAMBIQUE_HOLIDAYS_2026.filter(h => h.date === dateStr);
    return [...dbEvents, ...holidays.map(h => ({ ...h, id: h.date, description: null }))];
  };

  const navigate = (direction: number) => {
    if (viewMode === 'month') {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
    } else {
      setCurrentDate(prev => direction > 0 ? addWeeks(prev, 1) : subWeeks(prev, 1));
    }
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setFormData(prev => ({ ...prev, date: format(date, 'yyyy-MM-dd') }));
    setShowCreateDialog(true);
  };

  const handleCreateEvent = async () => {
    if (!formData.title || !formData.date) return;
    await createEvent.mutateAsync(formData);
    setShowCreateDialog(false);
    setFormData({
      title: '',
      description: '',
      date: '',
      type: 'Evento',
      start_time: null,
      end_time: null,
      location: null,
      is_all_day: true,
    });
  };

  const weekDayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const weekDayNamesFull = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  return (
    <MainLayout title="Calendário Escolar" subtitle="Eventos, feriados e planeamento anual">
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="pb-3 md:pb-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {/* Navigation */}
              <div className="flex items-center gap-2 md:gap-4">
                <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <CardTitle className="text-base md:text-xl text-center min-w-[140px] md:min-w-[200px]">
                  {viewMode === 'month' 
                    ? format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })
                    : `Semana ${getWeek(currentDate)} - ${format(currentDate, "MMMM yyyy", { locale: ptBR })}`
                  }
                </CardTitle>
                <Button variant="outline" size="icon" onClick={() => navigate(1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2">
                {/* View Mode Toggle */}
                <div className="flex rounded-lg border overflow-hidden">
                  <Button
                    variant={viewMode === 'month' ? 'default' : 'ghost'}
                    size="sm"
                    className="rounded-none"
                    onClick={() => setViewMode('month')}
                  >
                    <LayoutGrid className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">Mês</span>
                  </Button>
                  <Button
                    variant={viewMode === 'week' ? 'default' : 'ghost'}
                    size="sm"
                    className="rounded-none"
                    onClick={() => setViewMode('week')}
                  >
                    <List className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">Semana</span>
                  </Button>
                </div>
                
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                  Hoje
                </Button>
                <Button size="sm" onClick={() => { setSelectedDate(new Date()); setFormData(prev => ({ ...prev, date: format(new Date(), 'yyyy-MM-dd') })); setShowCreateDialog(true); }}>
                  <Plus className="h-4 w-4 md:mr-2" />
                  <span className="hidden sm:inline">Novo Evento</span>
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 md:gap-4">
          {(Object.entries(eventTypeConfig) as [CalendarEventType, typeof eventTypeConfig[CalendarEventType]][]).map(([type, config]) => (
            <Badge key={type} variant="outline" className={`gap-1 ${config.bgColor} border-0`}>
              <span className={`w-2 h-2 rounded-full ${config.color}`} />
              {type}
            </Badge>
          ))}
        </div>

        {/* Calendar Views */}
        <AnimatePresence mode="wait">
          {viewMode === 'month' ? (
            <motion.div
              key="month"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <Card>
                <CardContent className="p-2 md:p-4">
                  {/* Week Day Headers */}
                  <div className="grid grid-cols-7 gap-1 mb-1">
                    {weekDayNames.map((day, i) => (
                      <div 
                        key={day} 
                        className="text-center font-medium text-muted-foreground py-2 text-xs md:text-sm"
                      >
                        <span className="hidden sm:inline">{weekDayNamesFull[i]}</span>
                        <span className="sm:hidden">{day}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {monthDays.map(day => {
                      const dayEvents = getEventsForDay(day);
                      const isCurrentMonth = isSameMonth(day, currentDate);
                      
                      return (
                        <motion.div
                          key={day.toISOString()}
                          className={`min-h-[60px] md:min-h-[100px] p-1 md:p-2 border rounded-lg cursor-pointer transition-colors
                            ${isToday(day) ? 'bg-primary/10 border-primary' : 'border-border hover:bg-muted/50'}
                            ${!isCurrentMonth ? 'opacity-40' : ''}
                          `}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => handleDayClick(day)}
                        >
                          <div className={`text-xs md:text-sm font-medium mb-1 ${isToday(day) ? 'text-primary' : ''}`}>
                            {format(day, 'd')}
                          </div>
                          <div className="space-y-0.5 md:space-y-1">
                            {dayEvents.slice(0, viewMode === 'month' ? 2 : 3).map((event, i) => (
                              <div
                                key={i}
                                className={`text-[10px] md:text-xs p-0.5 md:p-1 rounded truncate text-white ${
                                  eventTypeConfig[event.type as CalendarEventType]?.color || 'bg-primary'
                                }`}
                                title={event.title}
                              >
                                <span className="hidden sm:inline">{event.title}</span>
                                <span className="sm:hidden">{event.title.substring(0, 3)}...</span>
                              </div>
                            ))}
                            {dayEvents.length > 2 && (
                              <div className="text-[10px] md:text-xs text-muted-foreground">
                                +{dayEvents.length - 2}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="week"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardContent className="p-2 md:p-4">
                  <div className="space-y-2">
                    {weekDays.map(day => {
                      const dayEvents = getEventsForDay(day);
                      
                      return (
                        <motion.div
                          key={day.toISOString()}
                          className={`p-3 md:p-4 border rounded-lg cursor-pointer transition-colors
                            ${isToday(day) ? 'bg-primary/10 border-primary' : 'border-border hover:bg-muted/50'}
                          `}
                          whileHover={{ scale: 1.01 }}
                          onClick={() => handleDayClick(day)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`text-lg md:text-xl font-bold ${isToday(day) ? 'text-primary' : ''}`}>
                                {format(day, 'd')}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {format(day, 'EEEE', { locale: ptBR })}
                              </span>
                            </div>
                            {dayEvents.length > 0 && (
                              <Badge variant="secondary">{dayEvents.length} evento{dayEvents.length > 1 ? 's' : ''}</Badge>
                            )}
                          </div>
                          
                          {dayEvents.length > 0 ? (
                            <div className="space-y-2">
                              {dayEvents.map((event, i) => (
                                <div
                                  key={i}
                                  className={`flex items-center gap-2 p-2 rounded ${
                                    eventTypeConfig[event.type as CalendarEventType]?.bgColor || 'bg-muted'
                                  }`}
                                >
                                  {eventTypeConfig[event.type as CalendarEventType]?.icon}
                                  <span className="font-medium text-sm">{event.title}</span>
                                  {event.description && (
                                    <span className="text-xs text-muted-foreground hidden md:inline">
                                      - {event.description}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">Sem eventos</p>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create Event Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Evento</DialogTitle>
            <DialogDescription>
              {selectedDate && `Adicionar evento para ${format(selectedDate, "d 'de' MMMM", { locale: ptBR })}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                placeholder="Nome do evento"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(v) => setFormData({ ...formData, type: v as CalendarEventType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Evento">Evento</SelectItem>
                  <SelectItem value="Prova">Prova</SelectItem>
                  <SelectItem value="Prazo">Prazo</SelectItem>
                  <SelectItem value="Feriado">Feriado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_time">Hora Início</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={formData.start_time || ''}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value || null })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_time">Hora Fim</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={formData.end_time || ''}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value || null })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Local</Label>
              <Input
                id="location"
                placeholder="Ex: Sala 101"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value || null })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Detalhes do evento..."
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value || null })}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateEvent}
              disabled={!formData.title || createEvent.isPending}
            >
              {createEvent.isPending ? 'A criar...' : 'Criar Evento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
