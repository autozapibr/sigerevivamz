import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ActionItem {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  icon?: LucideIcon | React.ReactNode;
  actions?: ActionItem[] | React.ReactNode;
}

export function PageHeader({ title, subtitle, description, icon, actions }: PageHeaderProps) {
  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    const Icon = icon as LucideIcon;
    return <Icon className="h-8 w-8 text-primary" />;
  };

  const renderActions = () => {
    if (!actions) return null;
    if (React.isValidElement(actions)) return actions;
    const actionItems = actions as ActionItem[];
    if (actionItems.length === 0) return null;
    
    return (
      <div className="flex gap-2">
        {actionItems.map((action, index) => (
          <Button
            key={index}
            onClick={action.onClick}
            variant={action.variant || 'default'}
          >
            {action.icon && <action.icon className="h-4 w-4 mr-2" />}
            {action.label}
          </Button>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        {renderIcon()}
        <div>
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
          {description && <p className="text-muted-foreground mt-1">{description}</p>}
        </div>
      </div>
      {renderActions()}
    </div>
  );
}
