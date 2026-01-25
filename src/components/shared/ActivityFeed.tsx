import { motion } from 'framer-motion';
import { LucideIcon, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';

interface Activity {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  timestamp: Date;
  color?: string;
}

interface ActivityFeedProps {
  title?: string;
  activities: Activity[];
  maxItems?: number;
}

export function ActivityFeed({ title = 'Actividades Recentes', activities, maxItems = 5 }: ActivityFeedProps) {
  const displayActivities = activities.slice(0, maxItems);

  const colorClasses: Record<string, string> = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
    error: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayActivities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma actividade recente
            </p>
          ) : (
            displayActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="flex gap-3 pb-3 border-b last:border-0 last:pb-0"
              >
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    colorClasses[activity.color || 'primary']
                  }`}
                >
                  <activity.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{activity.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>
                      {formatDistanceToNow(activity.timestamp, {
                        addSuffix: true,
                        locale: pt,
                      })}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
