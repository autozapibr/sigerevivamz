import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, TrendingDown, Clock, AlertTriangle } from 'lucide-react';
import { formatMZN } from '@/lib/validators/mozambique';
import { motion } from 'framer-motion';

interface CollectionStatsCardsProps {
  totalDebtors: number;
  totalAmount: number;
  averageDays: number;
  criticalCount: number;
}

export function CollectionStatsCards({
  totalDebtors,
  totalAmount,
  averageDays,
  criticalCount,
}: CollectionStatsCardsProps) {
  const stats = [
    {
      label: 'Inadimplentes',
      value: totalDebtors.toString(),
      subLabel: 'educandos',
      icon: Users,
      color: 'destructive',
      delay: 0.1,
    },
    {
      label: 'Valor em Atraso',
      value: formatMZN(totalAmount),
      subLabel: 'total pendente',
      icon: TrendingDown,
      color: 'warning',
      delay: 0.2,
    },
    {
      label: 'Média de Atraso',
      value: averageDays.toString(),
      subLabel: 'dias',
      icon: Clock,
      color: 'orange',
      delay: 0.3,
    },
    {
      label: 'Críticos',
      value: criticalCount.toString(),
      subLabel: '>60 dias',
      icon: AlertTriangle,
      color: 'primary',
      delay: 0.4,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {stats.map((stat, index) => {
        const colorClasses = {
          destructive: {
            border: 'border-l-destructive',
            bg: 'from-card to-destructive/5',
            text: 'text-destructive',
            iconBg: 'bg-destructive/10',
          },
          warning: {
            border: 'border-l-warning',
            bg: 'from-card to-warning/5',
            text: 'text-warning',
            iconBg: 'bg-warning/10',
          },
          orange: {
            border: 'border-l-orange-500',
            bg: 'from-card to-orange-500/5',
            text: 'text-orange-500',
            iconBg: 'bg-orange-500/10',
          },
          primary: {
            border: 'border-l-primary',
            bg: 'from-card to-primary/5',
            text: 'text-foreground',
            iconBg: 'bg-primary/10',
          },
        }[stat.color];

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: stat.delay }}
          >
            <Card className={`border-l-4 ${colorClasses.border} bg-gradient-to-br ${colorClasses.bg}`}>
              <CardContent className="p-3 md:pt-4 md:p-6">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs md:text-sm text-muted-foreground truncate">{stat.label}</p>
                    <p className={`text-lg md:text-2xl font-bold ${colorClasses.text} truncate`}>
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 md:mt-1 hidden sm:block">
                      {stat.subLabel}
                    </p>
                  </div>
                  <div className={`h-10 w-10 md:h-12 md:w-12 rounded-xl ${colorClasses.iconBg} flex items-center justify-center shrink-0`}>
                    <stat.icon className={`h-5 w-5 md:h-6 md:w-6 ${colorClasses.text}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
