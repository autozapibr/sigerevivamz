import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CurrencyInput } from '@/components/shared/CurrencyInput';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, AlertTriangle } from 'lucide-react';
import { useLateFeeSettings, useUpdateLateFeeSettings } from '@/hooks/useLateFees';
import {
  LATE_FEE_MODE_LABELS,
  LATE_FEE_MODE_HELP,
  calculateLateFee,
  type LateFeeMode,
  type LateFeeSettings,
} from '@/lib/lateFee';
import { formatMZN } from '@/lib/validators/mozambique';

const MODES = Object.keys(LATE_FEE_MODE_LABELS) as LateFeeMode[];
const usesFixed = (m: LateFeeMode) => m === 'FIXED_ONCE' || m === 'FIXED_MONTHLY';
const usesPercent = (m: LateFeeMode) => m.startsWith('PERCENT');

export default function MultasConfigPage() {
  const { data: settings, isLoading } = useLateFeeSettings();
  const updateSettings = useUpdateLateFeeSettings();

  const [form, setForm] = useState<LateFeeSettings>({
    id: 1,
    mode: 'FIXED_ONCE',
    fixed_amount: 50,
    percent: 0,
    grace_days: 0,
    is_active: true,
  });

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const handleSave = () => {
    updateSettings.mutate({
      mode: form.mode,
      fixed_amount: Number(form.fixed_amount) || 0,
      percent: Number(form.percent) || 0,
      grace_days: Number(form.grace_days) || 0,
      is_active: form.is_active,
    });
  };

  // Exemplo ao vivo: propina de 1.100 MT, vencida há ~2 meses.
  const exampleDue = new Date();
  exampleDue.setMonth(exampleDue.getMonth() - 2);
  const exampleFee = calculateLateFee({
    amount: 1100,
    dueDate: exampleDue.toISOString().slice(0, 10),
    status: 'Atrasado',
    settings: { ...form, is_active: true },
  });

  return (
    <MainLayout title="Multas de Atraso" subtitle="Configure como as multas de propinas são calculadas">
      <motion.div
        className="space-y-6 max-w-3xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Regra de Multa</CardTitle>
            <CardDescription>
              Define o cálculo automático da multa aplicada às propinas em atraso.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" /> A carregar…
              </div>
            ) : (
              <>
                {/* Activar/desactivar */}
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">Aplicar multas de atraso</p>
                    <p className="text-sm text-muted-foreground">
                      Se desactivado, nenhuma multa é calculada.
                    </p>
                  </div>
                  <Switch
                    checked={form.is_active}
                    onCheckedChange={(v) => setForm({ ...form, is_active: v })}
                  />
                </div>

                {/* Modo */}
                <div className="space-y-2">
                  <Label>Modo de cálculo</Label>
                  <Select
                    value={form.mode}
                    onValueChange={(v) => setForm({ ...form, mode: v as LateFeeMode })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MODES.map((m) => (
                        <SelectItem key={m} value={m}>{LATE_FEE_MODE_LABELS[m]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">{LATE_FEE_MODE_HELP[form.mode]}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Valor fixo */}
                  <div className={usesFixed(form.mode) ? '' : 'opacity-50'}>
                    <CurrencyInput
                      label="Valor fixo da multa (MZN)"
                      value={form.fixed_amount}
                      onChange={(v) => setForm({ ...form, fixed_amount: parseFloat(v) || 0 })}
                      disabled={!usesFixed(form.mode)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Usado nos modos de valor fixo.
                    </p>
                  </div>

                  {/* Percentual */}
                  <div className={usesPercent(form.mode) ? 'space-y-2' : 'space-y-2 opacity-50'}>
                    <Label>Percentual da multa (%)</Label>
                    <Input
                      type="number"
                      min={0}
                      step="0.1"
                      value={form.percent}
                      onChange={(e) => setForm({ ...form, percent: parseFloat(e.target.value) || 0 })}
                      disabled={!usesPercent(form.mode)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Usado nos modos percentuais (sobre o valor da propina).
                    </p>
                  </div>
                </div>

                {/* Tolerância */}
                <div className="space-y-2 max-w-xs">
                  <Label>Dias de tolerância</Label>
                  <Input
                    type="number"
                    min={0}
                    step="1"
                    value={form.grace_days}
                    onChange={(e) => setForm({ ...form, grace_days: parseInt(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Dias após o vencimento antes de a multa começar a contar.
                  </p>
                </div>

                {/* Exemplo */}
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <p className="text-sm font-medium mb-1">Exemplo</p>
                  <p className="text-sm text-muted-foreground">
                    Propina de <strong>{formatMZN(1100)}</strong> vencida há ~2 meses →
                    multa de <strong className="text-foreground">{formatMZN(exampleFee)}</strong>
                    {' '}(total a pagar: <strong>{formatMZN(1100 + exampleFee)}</strong>).
                  </p>
                </div>

                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    A multa é calculada automaticamente no momento do pagamento e pode ser
                    ajustada manualmente pela secretaria em cada propina, se necessário.
                  </span>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSave} disabled={updateSettings.isPending} className="gap-2">
                    {updateSettings.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Guardar configuração
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </MainLayout>
  );
}
