import { motion } from 'framer-motion';
import { Bell, Check, Trash2, AlertCircle, CheckCircle, Info, AlertTriangle, MessageSquare, ExternalLink } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications, useMarkAsRead, useDeleteNotification } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { getCategoryColor, getCategoryLabel } from '@/hooks/useTickets';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'error':
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    default:
      return <MessageSquare className="h-5 w-5 text-blue-500" />;
  }
};

const getNotificationBadgeVariant = (type: string): 'default' | 'destructive' | 'secondary' | 'outline' => {
  const variants: Record<string, 'default' | 'destructive' | 'secondary' | 'outline'> = {
    success: 'default',
    error: 'destructive',
    warning: 'secondary',
    info: 'outline',
  };
  
  return variants[type] || 'outline';
};

export default function Notifications() {
  const { data: notifications = [], isLoading } = useNotifications();
  const markAsRead = useMarkAsRead();
  const deleteNotification = useDeleteNotification();
  const { toast } = useToast();
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead.mutateAsync(id);
      toast({
        title: 'Sucesso',
        description: 'Ticket marcado como em andamento',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar ticket',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification.mutateAsync(id);
      toast({
        title: 'Sucesso',
        description: 'Ticket fechado com sucesso',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao fechar ticket',
        variant: 'destructive',
      });
    }
  };

  const handleNotificationClick = (notification: any) => {
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <MainLayout title="Notificações" subtitle="Tickets e alertas do sistema">
      <div className="space-y-6">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Tickets</p>
                  <p className="text-3xl font-bold text-primary">{notifications.length}</p>
                </div>
                <MessageSquare className="h-12 w-12 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Novos (Abertos)</p>
                  <p className="text-3xl font-bold text-orange-600">{unreadCount}</p>
                </div>
                <AlertCircle className="h-12 w-12 text-orange-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Em Andamento</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {notifications.length - unreadCount}
                  </p>
                </div>
                <Bell className="h-12 w-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botão para ir à página de comunicação */}
        <div className="flex justify-end">
          <Button onClick={() => navigate('/comunicacao')} variant="outline" className="gap-2">
            <ExternalLink className="h-4 w-4" />
            Ver todos os tickets
          </Button>
        </div>

        {/* Lista de Notificações */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Carregando...</div>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum ticket pendente para o seu perfil</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => navigate('/comunicacao')}
              >
                Ir para Comunicação
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card
                  className={`cursor-pointer hover:shadow-md transition-all ${
                    !notification.read ? 'border-l-4 border-l-primary bg-primary/5' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground mb-1">
                              {notification.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {notification.message}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {notification.category && (
                              <Badge className={getCategoryColor(notification.category)}>
                                {getCategoryLabel(notification.category)}
                              </Badge>
                            )}
                            <Badge variant={getNotificationBadgeVariant(notification.type)}>
                              {notification.read ? 'Em andamento' : 'Novo'}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.created_at), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </span>
                          
                          <div className="flex gap-2">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(notification.id);
                                }}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Iniciar atendimento
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(notification.id);
                              }}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Fechar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
