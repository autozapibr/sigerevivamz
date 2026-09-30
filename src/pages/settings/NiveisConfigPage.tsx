import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, Plus, Trash2, Info } from 'lucide-react';
import { useClassGroups, useUpdateClassGroups } from '@/hooks/useClassGroups';
import { useClasses } from '@/hooks/useGrades';
import { classGroupName, type ClassGroup } from '@/lib/classGroups';

export default function NiveisConfigPage() {
  const { data: groups, isLoading } = useClassGroups();
  const updateGroups = useUpdateClassGroups();
  const { data: classes = [] } = useClasses();

  const [rows, setRows] = useState<ClassGroup[]>([]);

  useEffect(() => {
    if (groups) setRows(groups.map((g) => ({ ...g })));
  }, [groups]);

  const setRow = (i: number, patch: Partial<ClassGroup>) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const addRow = () => setRows((prev) => [...prev, { name: 'Novo grupo', pattern: null, min: null, max: null }]);
  const removeRow = (i: number) => setRows((prev) => prev.filter((_, idx) => idx !== i));

  const handleSave = () => {
    const clean = rows
      .filter((r) => r.name.trim())
      .map((r) => ({
        name: r.name.trim(),
        pattern: r.pattern?.trim() ? r.pattern.trim() : null,
        min: r.min != null && !Number.isNaN(r.min) ? Number(r.min) : null,
        max: r.max != null && !Number.isNaN(r.max) ? Number(r.max) : null,
      }));
    updateGroups.mutate(clean);
  };

  // Pré-visualização: como cada turma existente seria classificada.
  const preview = classes
    .map((c) => ({ name: c.name, group: classGroupName(c.name, rows) }))
    .sort((a, b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name));

  return (
    <MainLayout title="Níveis / Grupos de Turmas" subtitle="Defina como as turmas são agrupadas nos relatórios">
      <motion.div
        className="space-y-6 max-w-4xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Grupos de Turmas</CardTitle>
            <CardDescription>
              Cada turma é classificada pelo nome. Use um <strong>padrão de nome</strong> (ex.: "PEPE")
              ou um <strong>intervalo de classes</strong> (ex.: 1 a 6 para Primária). O padrão tem
              prioridade sobre o intervalo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" /> A carregar…
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {rows.map((r, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-end rounded-lg border p-3">
                      <div className="col-span-12 sm:col-span-4">
                        <Label className="text-xs text-muted-foreground">Nome do grupo</Label>
                        <Input
                          value={r.name}
                          onChange={(e) => setRow(i, { name: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div className="col-span-12 sm:col-span-3">
                        <Label className="text-xs text-muted-foreground">Padrão no nome</Label>
                        <Input
                          placeholder="ex.: PEPE"
                          value={r.pattern ?? ''}
                          onChange={(e) => setRow(i, { pattern: e.target.value || null })}
                          className="mt-1"
                        />
                      </div>
                      <div className="col-span-5 sm:col-span-2">
                        <Label className="text-xs text-muted-foreground">Classe de</Label>
                        <Input
                          type="number"
                          min={0}
                          value={r.min ?? ''}
                          onChange={(e) => setRow(i, { min: e.target.value === '' ? null : parseInt(e.target.value) })}
                          className="mt-1"
                        />
                      </div>
                      <div className="col-span-5 sm:col-span-2">
                        <Label className="text-xs text-muted-foreground">até</Label>
                        <Input
                          type="number"
                          min={0}
                          value={r.max ?? ''}
                          onChange={(e) => setRow(i, { max: e.target.value === '' ? null : parseInt(e.target.value) })}
                          className="mt-1"
                        />
                      </div>
                      <div className="col-span-2 sm:col-span-1 flex justify-end">
                        <Button variant="ghost" size="icon" onClick={() => removeRow(i)} title="Remover">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 justify-between">
                  <Button variant="outline" onClick={addRow} className="gap-2">
                    <Plus className="w-4 h-4" /> Adicionar grupo
                  </Button>
                  <Button onClick={handleSave} disabled={updateGroups.isPending} className="gap-2">
                    {updateGroups.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Guardar
                  </Button>
                </div>

                <div className="flex items-start gap-2 text-xs text-muted-foreground pt-2">
                  <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    O número da classe é lido do nome da turma (ex.: "3ª Classe A" → 3). Turmas que
                    não caírem em nenhum grupo aparecem como "Outras".
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Pré-visualização */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pré-visualização das turmas</CardTitle>
            <CardDescription>Como as turmas actuais ficam classificadas com esta configuração.</CardDescription>
          </CardHeader>
          <CardContent>
            {preview.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma turma registada.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {preview.map((p, i) => (
                  <Badge key={i} variant="outline" className="gap-1">
                    {p.name}
                    <span className="text-muted-foreground">→ {p.group}</span>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </MainLayout>
  );
}
