import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, isSameMonth, isToday, addDays, 
  getWeek, addWeeks, subWeeks, parseISO, isBefore
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  ChevronLeft, ChevronRight, Plus, GraduationCap, Clock, 
  List, LayoutGrid, Filter, Bell, BellDot, Calendar, 
  BookOpen, Users, Info, CheckCircle2
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useCalendarEventsByMonth, useCreateCalendarEvent, CalendarEvent, CalendarEventInsert } from '@/hooks/useCalendarEvents';
import { useExamNotifications, useMarkExamNotificationRead, useMarkAllExamNotificationsRead } from '@/hooks/useExamNotifications';
import { useClasses, useSubjects } from '@/hooks/useGrades';
import { useCurrentTeacher, useTeacherAssignments } from '@/hooks/useTeachers';
import { useAuth } from '@/contexts/AuthContext';

type ViewMode = 'month' | 'week' | 'list';

interface ExamFilters {
  class_id: number | null;
  subject_id: number | null;
}

export default function CalendarioProvasPage() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedExam, setSelectedExam] = useState<CalendarEvent | null>(null);
  const [filters, setFilters] = useState<ExamFilters>({ class_id: null, subject_id: null });
  const [showFilters, setShowFilters] = useState(false);
  
  const [formData, setFormData] = useState<CalendarEventInsert>({
    title: '',
    description: '',
    date: '',
    type: 'Actividade',
    start_time: null,
    end_time: null,
    location: null,
    is_all_day: false,
    class_id: null,
    subject_id: null,
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const { data: allEvents = [], isLoading } = useCalendarEventsByMonth(year, month);
  const { data: notifications = [] } = useExamNotifications();
  const { data: classes = [] } = useClassesList({ year: new Date().getFullYear() });
  const { data: subjects = [] } = useSubjectsList({});
  const createEvent = useCreateCalendarEvent();
  const markRead = useMarkExamNotificationRead();
  const markAllRead = useMarkAllExamNotificationsRead();

  // Filter events (show all types, not just exams)
  const events = useMemo(() => {
    let filtered = allEvents;
    
    if (filters.class_id) {
      filtered = filtered.filter(e => e.class_id === filters.class_id);
    }
    if (filters.subject_id) {
      filtered = filtered.filter(e => e.subject_id === filters.subject_id);
    }
    
    return filtered;
  }, [allEvents, filters]);

  // Stats
  const stats = useMemo(() => {
    const now = new Date();
    const upcoming = events.filter(e => !isBefore(parseISO(e.date), now));
    const past = events.filter(e => isBefore(parseISO(e.date), now));
    const thisWeek = upcoming.filter(e => {
      const eventDate = parseISO(e.date);
      const weekEnd = addDays(now, 7);
      return !isBefore(eventDate, now) && isBefore(eventDate, weekEnd);
    });
    const provas = events.filter(e => e.type === 'Prova').length;
    
    return { total: events.length, upcoming: upcoming.length, past: past.length, thisWeek: thisWeek.length, provas };
  }, [events]);

  // Calendar calculations
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const monthDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getEventsForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return events.filter(e => e.date === dateStr);
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
      type: 'Actividade',
      start_time: null,
      end_time: null,
      location: null,
      is_all_day: false,
      class_id: null,
      subject_id: null,
    });
  };

  const canManageEvents = user?.role === 'ADMIN' || user?.role === 'DIRETORIA' || 
                          user?.role === 'PROFESSOR' || user?.role === 'PEDAGOGICO';

  const weekDayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const weekDayNamesFull = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  return (
    <MainLayout 
      title="Calendário" 
      subtitle="Provas, actividades e eventos do professor"
    >
      <div className="space-y-4 md:space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold text-primary">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total do Mês</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-orange-500/5 border-orange-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold text-orange-500">{stats.thisWeek}</p>
                  <p className="text-xs text-muted-foreground">Esta Semana</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-500/5 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold text-blue-500">{stats.upcoming}</p>
                  <p className="text-xs text-muted-foreground">Próximas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold text-muted-foreground">{stats.past}</p>
                  <p className="text-xs text-muted-foreground">Realizadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Header Controls */}
        <Card>
          <CardHeader className="pb-3 md:pb-4">
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
              <div className="flex items-center gap-2 flex-wrap">
                {/* Notifications Sheet */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="relative">
                      {notifications.length > 0 ? (
                        <BellDot className="h-4 w-4 text-orange-500" />
                      ) : (
                        <Bell className="h-4 w-4" />
                      )}
                      {notifications.length > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                          {notifications.length}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle className="flex items-center justify-between">
                        Notificações de Provas
                        {notifications.length > 0 && (
                          <Button size="sm" variant="ghost" onClick={() => markAllRead.mutate()}>
                            Marcar todas
                          </Button>
                        )}
                      </SheetTitle>
                    </SheetHeader>
                    <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
                      {notifications.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                          Nenhuma notificação
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {notifications.map(n => (
                            <div
                              key={n.id}
                              className="p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                              onClick={() => markRead.mutate(n.id)}
                            >
                              <p className="text-sm font-medium">{n.message}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {format(parseISO(n.created_at), "dd/MM 'às' HH:mm", { locale: ptBR })}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </SheetContent>
                </Sheet>

                {/* Filters */}
                <Sheet open={showFilters} onOpenChange={setShowFilters}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 md:mr-2" />
                      <span className="hidden md:inline">Filtros</span>
                      {(filters.class_id || filters.subject_id) && (
                        <Badge className="ml-1 h-5 px-1.5">!</Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Filtrar Provas</SheetTitle>
                    </SheetHeader>
                    <div className="space-y-4 mt-6">
                      <div className="space-y-2">
                        <Label>Turma</Label>
                        <Select 
                          value={filters.class_id?.toString() || ''} 
                          onValueChange={(v) => setFilters(f => ({ ...f, class_id: v ? parseInt(v) : null }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Todas as turmas" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Todas as turmas</SelectItem>
                            {classes.map(c => (
                              <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Disciplina</Label>
                        <Select 
                          value={filters.subject_id?.toString() || ''} 
                          onValueChange={(v) => setFilters(f => ({ ...f, subject_id: v ? parseInt(v) : null }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Todas as disciplinas" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Todas as disciplinas</SelectItem>
                            {subjects.map(s => (
                              <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Separator />
                      
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setFilters({ class_id: null, subject_id: null })}
                      >
                        Limpar Filtros
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>

                {/* View Mode Toggle */}
                <div className="flex rounded-lg border overflow-hidden">
                  <Button
                    variant={viewMode === 'month' ? 'default' : 'ghost'}
                    size="sm"
                    className="rounded-none"
                    onClick={() => setViewMode('month')}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'week' ? 'default' : 'ghost'}
                    size="sm"
                    className="rounded-none"
                    onClick={() => setViewMode('week')}
                  >
                    <Calendar className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    className="rounded-none"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
                
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                  Hoje
                </Button>
                
                {canManageEvents && (
                  <Button 
                    size="sm" 
                    onClick={() => { 
                      setSelectedDate(new Date()); 
                      setFormData(prev => ({ ...prev, date: format(new Date(), 'yyyy-MM-dd') })); 
                      setShowCreateDialog(true); 
                    }}
                  >
                    <Plus className="h-4 w-4 md:mr-2" />
                    <span className="hidden sm:inline">Novo Evento</span>
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Info Banner for Teachers */}
        {user?.role === 'PROFESSOR' && (
          <Card className="bg-blue-500/5 border-blue-500/20">
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                <Info className="h-4 w-4 flex-shrink-0" />
                <p>
                  Visualize as provas agendadas por todos os professores. 
                  Evite conflitos consultando o calendário antes de agendar sua avaliação.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Calendar Views */}
        <AnimatePresence mode="wait">
          {viewMode === 'month' && (
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
                      const dayExams = getEventsForDay(day);
                      const isCurrentMonth = isSameMonth(day, currentDate);
                      
                      return (
                        <motion.div
                          key={day.toISOString()}
                          className={`min-h-[60px] md:min-h-[100px] p-1 md:p-2 border rounded-lg cursor-pointer transition-colors
                            ${isToday(day) ? 'bg-primary/10 border-primary' : 'border-border hover:bg-muted/50'}
                            ${!isCurrentMonth ? 'opacity-40' : ''}
                          `}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => canManageEvents && handleDayClick(day)}
                        >
                          <div className={`text-xs md:text-sm font-medium mb-1 ${isToday(day) ? 'text-primary' : ''}`}>
                            {format(day, 'd')}
                          </div>
                          <div className="space-y-0.5 md:space-y-1">
                            {dayExams.slice(0, 2).map((exam) => {
                              const colorMap: Record<string, string> = {
                                Prova: 'bg-orange-500 text-white',
                                Actividade: 'bg-emerald-500 text-white',
                                Evento: 'bg-blue-500 text-white',
                                Prazo: 'bg-purple-500 text-white',
                                Feriado: 'bg-red-500 text-white',
                              };
                              return (
                                <div
                                  key={exam.id}
                                  className={`text-[10px] md:text-xs p-0.5 md:p-1 rounded truncate ${colorMap[exam.type] || 'bg-primary text-primary-foreground'}`}
                                  title={`[${exam.type}] ${exam.title}${exam.classes ? ` - ${exam.classes.name}` : ''}`}
                                  onClick={(e) => { e.stopPropagation(); setSelectedExam(exam); }}
                                >
                                  <span className="hidden sm:inline">{exam.title}</span>
                                  <span className="sm:hidden">{exam.title.substring(0, 3)}...</span>
                                </div>
                              );
                            })}
                            {dayExams.length > 2 && (
                              <div className="text-[10px] md:text-xs text-muted-foreground">
                                +{dayExams.length - 2}
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
          )}

          {viewMode === 'week' && (
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
                      const dayExams = getEventsForDay(day);
                      
                      return (
                        <motion.div
                          key={day.toISOString()}
                          className={`p-3 md:p-4 border rounded-lg cursor-pointer transition-colors
                            ${isToday(day) ? 'bg-primary/10 border-primary' : 'border-border hover:bg-muted/50'}
                          `}
                          whileHover={{ scale: 1.01 }}
                          onClick={() => canManageEvents && handleDayClick(day)}
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
                            {dayExams.length > 0 && (
                              <Badge variant="secondary" className="bg-orange-500/10 text-orange-500">
                                {dayExams.length} prova{dayExams.length > 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>
                          
                          {dayExams.length > 0 ? (
                            <div className="space-y-2">
                              {dayExams.map((exam) => (
                                <div
                                  key={exam.id}
                                  className="flex items-center gap-2 p-2 rounded bg-orange-500/10 text-orange-700 dark:text-orange-300 cursor-pointer hover:bg-orange-500/20"
                                  onClick={(e) => { e.stopPropagation(); setSelectedExam(exam); }}
                                >
                                  <GraduationCap className="h-4 w-4 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <span className="font-medium text-sm truncate block">{exam.title}</span>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      {exam.classes && (
                                        <span className="flex items-center gap-1">
                                          <Users className="h-3 w-3" /> {exam.classes.name}
                                        </span>
                                      )}
                                      {exam.subjects && (
                                        <span className="flex items-center gap-1">
                                          <BookOpen className="h-3 w-3" /> {exam.subjects.name}
                                        </span>
                                      )}
                                      {exam.start_time && (
                                        <span className="flex items-center gap-1">
                                          <Clock className="h-3 w-3" /> {exam.start_time.slice(0, 5)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">Sem provas</p>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {viewMode === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Eventos - {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}</CardTitle>
                  <CardDescription>{events.length} evento(s) encontrado(s)</CardDescription>
                </CardHeader>
                <CardContent>
                  {events.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <GraduationCap className="h-12 w-12 mx-auto mb-2 opacity-30" />
                      <p>Nenhum evento para este período</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {events
                        .sort((a, b) => a.date.localeCompare(b.date))
                        .map((exam) => {
                          const isPast = isBefore(parseISO(exam.date), new Date());
                          
                          return (
                            <div
                              key={exam.id}
                              className={`p-4 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                                isPast ? 'opacity-60' : ''
                              }`}
                              onClick={() => setSelectedExam(exam)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                  <div className={`p-2 rounded-lg ${isPast ? 'bg-muted' : 'bg-orange-500/10'}`}>
                                    <GraduationCap className={`h-5 w-5 ${isPast ? 'text-muted-foreground' : 'text-orange-500'}`} />
                                  </div>
                                  <div>
                                    <h4 className="font-medium">{exam.title}</h4>
                                    <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                                      <span className="flex items-center gap-1">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {format(parseISO(exam.date), "dd/MM/yyyy (EEEE)", { locale: ptBR })}
                                      </span>
                                      {exam.start_time && (
                                        <span className="flex items-center gap-1">
                                          <Clock className="h-3.5 w-3.5" />
                                          {exam.start_time.slice(0, 5)}
                                          {exam.end_time && ` - ${exam.end_time.slice(0, 5)}`}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                      {exam.classes && (
                                        <Badge variant="outline" className="text-xs">
                                          <Users className="h-3 w-3 mr-1" /> {exam.classes.name}
                                        </Badge>
                                      )}
                                      {exam.subjects && (
                                        <Badge variant="outline" className="text-xs">
                                          <BookOpen className="h-3 w-3 mr-1" /> {exam.subjects.name}
                                        </Badge>
                                      )}
                                      {exam.location && (
                                        <Badge variant="secondary" className="text-xs">{exam.location}</Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {isPast && (
                                  <Badge variant="secondary">Realizada</Badge>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create Event Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Novo Evento
            </DialogTitle>
            <DialogDescription>
              {selectedDate && `Data: ${format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                placeholder="Ex: Reunião de pais, Prova de Matemática..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(v) => setFormData({ ...formData, type: v as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Actividade">Actividade</SelectItem>
                  <SelectItem value="Prova">Prova</SelectItem>
                  <SelectItem value="Evento">Evento</SelectItem>
                  <SelectItem value="Prazo">Prazo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="class_id">Turma</Label>
                <Select 
                  value={formData.class_id?.toString() || ''} 
                  onValueChange={(v) => setFormData({ ...formData, class_id: v ? parseInt(v) : null })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject_id">Disciplina</Label>
                <Select 
                  value={formData.subject_id?.toString() || ''} 
                  onValueChange={(v) => setFormData({ ...formData, subject_id: v ? parseInt(v) : null })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map(s => (
                      <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
              <Label htmlFor="location">Sala / Local</Label>
              <Input
                id="location"
                placeholder="Ex: Sala 101"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value || null })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Observações</Label>
              <Textarea
                id="description"
                placeholder="Conteúdo da prova, materiais permitidos, etc."
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
              {createEvent.isPending ? 'Aguarde...' : 'Criar Evento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Exam Details Dialog */}
      <Dialog open={!!selectedExam} onOpenChange={() => setSelectedExam(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-orange-500" />
              Detalhes da Prova
            </DialogTitle>
          </DialogHeader>
          
          {selectedExam && (
            <div className="space-y-4 py-4">
              <div>
                <h3 className="text-lg font-semibold">{selectedExam.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {format(parseISO(selectedExam.date), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {selectedExam.classes && (
                  <div>
                    <Label className="text-muted-foreground">Turma</Label>
                    <p className="font-medium">{selectedExam.classes.name}</p>
                  </div>
                )}
                {selectedExam.subjects && (
                  <div>
                    <Label className="text-muted-foreground">Disciplina</Label>
                    <p className="font-medium">{selectedExam.subjects.name}</p>
                  </div>
                )}
              </div>
              
              {(selectedExam.start_time || selectedExam.end_time) && (
                <div>
                  <Label className="text-muted-foreground">Horário</Label>
                  <p className="font-medium">
                    {selectedExam.start_time?.slice(0, 5) || '--:--'}
                    {selectedExam.end_time && ` às ${selectedExam.end_time.slice(0, 5)}`}
                  </p>
                </div>
              )}
              
              {selectedExam.location && (
                <div>
                  <Label className="text-muted-foreground">Local</Label>
                  <p className="font-medium">{selectedExam.location}</p>
                </div>
              )}
              
              {selectedExam.description && (
                <div>
                  <Label className="text-muted-foreground">Observações</Label>
                  <p className="text-sm mt-1">{selectedExam.description}</p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedExam(null)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
