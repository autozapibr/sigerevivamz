import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, isSameMonth, isToday, addDays, 
  getWeek, addWeeks, subWeeks
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  ChevronLeft, ChevronRight, CalendarDays, Flag, 
  GraduationCap, Clock, List, LayoutGrid, Bell, Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useCalendarEventsByMonth, MOZAMBIQUE_HOLIDAYS_2026, CalendarEventType } from '@/hooks/useCalendarEvents';
import { useExamNotifications, useMarkExamNotificationRead } from '@/hooks/useExamNotifications';
import { useAuth } from '@/contexts/AuthContext';

type ViewMode = 'month' | 'week';

const eventTypeConfig: Record<CalendarEventType, { icon: React.ReactNode; color: string; bgColor: string; label: string }> = {
  Feriado: { icon: <Flag className="w-3 h-3" />, color: 'bg-red-500', bgColor: 'bg-red-500/10 text-red-500', label: 'Feriados' },
  Evento: { icon: <CalendarDays className="w-3 h-3" />, color: 'bg-blue-500', bgColor: 'bg-blue-500/10 text-blue-500', label: 'Eventos' },
  Prova: { icon: <GraduationCap className="w-3 h-3" />, color: 'bg-orange-500', bgColor: 'bg-orange-500/10 text-orange-500', label: 'Provas' },
  Prazo: { icon: <Clock className="w-3 h-3" />, color: 'bg-purple-500', bgColor: 'bg-purple-500/10 text-purple-500', label: 'Prazos' },
  Actividade: { icon: <CalendarDays className="w-3 h-3" />, color: 'bg-emerald-500', bgColor: 'bg-emerald-500/10 text-emerald-500', label: 'Actividades' },
};

// Filters available for students
const STUDENT_FILTERS: CalendarEventType[] = ['Prova', 'Evento', 'Feriado', 'Prazo'];

export default function StudentDashboard() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [activeFilters, setActiveFilters] = useState<CalendarEventType[]>(STUDENT_FILTERS);
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const { data: events = [], isLoading } = useCalendarEventsByMonth(year, month);
  const { data: examNotifications = [] } = useExamNotifications();
  const markAsRead = useMarkExamNotificationRead();

  // Filter events by active filters
  const filteredEvents = useMemo(() => {
    return events.filter(e => activeFilters.includes(e.type as CalendarEventType));
  }, [events, activeFilters]);

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
    const dbEvents = filteredEvents.filter(e => e.date === dateStr);
    
    // Include holidays only if Feriado filter is active
    const holidays = activeFilters.includes('Feriado') 
      ? MOZAMBIQUE_HOLIDAYS_2025.filter(h => h.date === dateStr).map(h => ({ ...h, id: h.date, description: null }))
      : [];
    
    return [...dbEvents, ...holidays];
  };

  const navigate = (direction: number) => {
    if (viewMode === 'month') {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
    } else {
      setCurrentDate(prev => direction > 0 ? addWeeks(prev, 1) : subWeeks(prev, 1));
    }
  };

  const toggleFilter = (type: CalendarEventType) => {
    setActiveFilters(prev => 
      prev.includes(type) 
        ? prev.filter(f => f !== type)
        : [...prev, type]
    );
  };

  const weekDayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const weekDayNamesFull = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  const unreadExamCount = examNotifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Exam Notifications */}
      {unreadExamCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-warning/50 bg-warning/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4 text-warning" />
                Provas Agendadas ({unreadExamCount})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {examNotifications.slice(0, 5).map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-background border"
                >
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">{notification.message}</span>
                  </div>
                  {!notification.is_read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead.mutate(notification.id)}
                    >
                      Marcar como lida
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Calendar Header */}
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
              {/* Filters Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="h-4 w-4" />
                    <span className="hidden sm:inline">Filtros</span>
                    {activeFilters.length < STUDENT_FILTERS.length && (
                      <Badge variant="secondary" className="ml-1">{activeFilters.length}</Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56" align="end">
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Tipos de Evento</h4>
                    {STUDENT_FILTERS.map((type) => (
                      <div key={type} className="flex items-center gap-2">
                        <Checkbox
                          id={type}
                          checked={activeFilters.includes(type)}
                          onCheckedChange={() => toggleFilter(type)}
                        />
                        <label
                          htmlFor={type}
                          className="flex items-center gap-2 text-sm cursor-pointer"
                        >
                          <span className={`w-2 h-2 rounded-full ${eventTypeConfig[type].color}`} />
                          {eventTypeConfig[type].label}
                        </label>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

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
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Active Filters Legend */}
      <div className="flex flex-wrap gap-2 md:gap-4">
        {activeFilters.map((type) => (
          <Badge key={type} variant="outline" className={`gap-1 ${eventTypeConfig[type].bgColor} border-0`}>
            <span className={`w-2 h-2 rounded-full ${eventTypeConfig[type].color}`} />
            {eventTypeConfig[type].label}
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
                        className={`min-h-[60px] md:min-h-[100px] p-1 md:p-2 border rounded-lg transition-colors
                          ${isToday(day) ? 'bg-primary/10 border-primary' : 'border-border hover:bg-muted/50'}
                          ${!isCurrentMonth ? 'opacity-40' : ''}
                        `}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className={`text-xs md:text-sm font-medium mb-1 ${isToday(day) ? 'text-primary' : ''}`}>
                          {format(day, 'd')}
                        </div>
                        <div className="space-y-0.5 md:space-y-1">
                          {dayEvents.slice(0, 2).map((event, i) => (
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
                        className={`p-3 md:p-4 border rounded-lg transition-colors
                          ${isToday(day) ? 'bg-primary/10 border-primary' : 'border-border hover:bg-muted/50'}
                        `}
                        whileHover={{ scale: 1.01 }}
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
  );
}
