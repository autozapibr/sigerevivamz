import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ActionItem {
  label: string;
  onClick: () => void;
}

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: ActionItem | React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  const renderAction = () => {
    if (!action) return null;
    if (React.isValidElement(action)) return action;
    const actionItem = action as ActionItem;
    return (
      <Button onClick={actionItem.onClick}>
        {actionItem.label}
      </Button>
    );
  };

  return (
    <Card>
      <CardContent className="text-center py-12">
        {Icon && <Icon className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />}
        <h3 className="text-lg font-semibold mb-2 text-foreground">{title}</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">{description}</p>
        {renderAction()}
      </CardContent>
    </Card>
  );
}
