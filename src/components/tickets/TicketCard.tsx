import React from 'react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { MessageSquare, Clock, User, Tag, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
  Ticket,
  getStatusLabel,
  getStatusColor,
  getPriorityLabel,
  getPriorityColor,
  getCategoryLabel,
  getCategoryColor,
} from '@/hooks/useTickets';

interface TicketCardProps {
  ticket: Ticket;
  onClick?: () => void;
  isSelected?: boolean;
}

export function TicketCard({ ticket, onClick, isSelected }: TicketCardProps) {
  const getInitials = (name: string) =>
    name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/30",
        isSelected && "border-primary shadow-md bg-primary/5"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <Badge variant="outline" className="shrink-0 text-xs font-mono">
              {ticket.ticket_number}
            </Badge>
            <Badge className={cn("shrink-0 text-xs", getPriorityColor(ticket.priority))}>
              {getPriorityLabel(ticket.priority)}
            </Badge>
          </div>
          <Badge className={cn("shrink-0 text-xs border", getStatusColor(ticket.status))}>
            {getStatusLabel(ticket.status)}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
          {ticket.title}
        </h3>

        {/* Description preview */}
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {ticket.description}
        </p>

        {/* Category */}
        <div className="flex items-center gap-2 mb-3">
          <Tag className="w-3.5 h-3.5 text-muted-foreground" />
          <Badge variant="secondary" className={cn("text-xs", getCategoryColor(ticket.category))}>
            {getCategoryLabel(ticket.category)}
          </Badge>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6">
              <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                {getInitials(ticket.created_by_name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground truncate max-w-[120px]">
                {ticket.created_by_name}
              </p>
              {ticket.created_by_role && (
                <p className="text-[10px] text-muted-foreground capitalize">
                  {ticket.created_by_role.toLowerCase()}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs">
              {format(new Date(ticket.created_at), "dd MMM", { locale: pt })}
            </span>
          </div>
        </div>

        {/* Assigned indicator */}
        {ticket.assigned_to_name && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
            <User className="w-3.5 h-3.5" />
            <span>Atribuído a: <strong className="text-foreground">{ticket.assigned_to_name}</strong></span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
