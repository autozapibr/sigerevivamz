import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, CalendarDays, Flag, GraduationCap, Clock } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCalendarEventsByMonth, MOZAMBIQUE_HOLIDAYS_2025, CalendarEventType } from '@/hooks/useCalendarEvents';

const eventTypeConfig: Record<CalendarEventType, { icon: React.ReactNode; color: string }> = {
  Feriado: { icon: <Flag className="w-3 h-3" />, color: 'bg-red-500' },
  Evento: { icon: <CalendarDays className="w-3 h-3" />, color: 'bg-blue-500' },
  Prova: { icon: <GraduationCap className="w-3 h-3" />, color: 'bg-orange-500' },
  Prazo: { icon: <Clock className="w-3 h-3" />, color: 'bg-purple-500' },
};

export default function CalendarioPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const { data: events = [] } = useCalendarEventsByMonth(year, month);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startDayOfWeek = monthStart.getDay();
  const emptyDays = Array(startDayOfWeek).fill(null);

  const getEventsForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dbEvents = events.filter(e => e.date === dateStr);
    const holidays = MOZAMBIQUE_HOLIDAYS_2025.filter(h => h.date === dateStr);
    return [...dbEvents, ...holidays.map(h => ({ ...h, id: h.date, description: null }))];
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
  };

  return (
    <MainLayout title="Calendário Escolar" subtitle="Eventos, feriados e planejamento anual">
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigateMonth(-1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <CardTitle className="text-xl">
                  {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
                </CardTitle>
                <Button variant="outline" size="icon" onClick={() => navigateMonth(1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setCurrentDate(new Date())}>Hoje</Button>
                <Button><Plus className="mr-2 h-4 w-4" />Novo Evento</Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Legenda */}
        <div className="flex flex-wrap gap-4">
          {(Object.entries(eventTypeConfig) as [CalendarEventType, typeof eventTypeConfig[CalendarEventType]][]).map(([type, config]) => (
            <Badge key={type} variant="outline" className="gap-1">
              <span className={`w-2 h-2 rounded-full ${config.color}`} />
              {type}
            </Badge>
          ))}
        </div>

        {/* Calendário */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-7 gap-1">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <div key={day} className="text-center font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
              
              {emptyDays.map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[100px]" />
              ))}
              
              {days.map(day => {
                const dayEvents = getEventsForDay(day);
                return (
                  <motion.div
                    key={day.toISOString()}
                    className={`min-h-[100px] p-1 border rounded-lg ${
                      isToday(day) ? 'bg-primary/10 border-primary' : 'border-border'
                    } ${!isSameMonth(day, currentDate) ? 'opacity-50' : ''}`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className={`text-sm font-medium mb-1 ${isToday(day) ? 'text-primary' : ''}`}>
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event, i) => (
                        <div
                          key={i}
                          className={`text-xs p-1 rounded truncate text-white ${
                            eventTypeConfig[event.type as CalendarEventType]?.color || 'bg-primary'
                          }`}
                          title={event.title}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-muted-foreground">+{dayEvents.length - 3} mais</div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
