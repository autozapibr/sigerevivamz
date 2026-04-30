/**
 * Hook genérico para eliminações reversíveis com toast "Anular".
 *
 * Como funciona:
 *  1. Chama-se `softDelete(item)` quando o utilizador pede para eliminar.
 *  2. Mostra-se um toast "Anular" durante 6 segundos.
 *  3. Se o utilizador NÃO clicar em "Anular", executa-se a eliminação real.
 *  4. Se clicar, nada é apagado (a UI reverte sozinha invalidando o cache).
 *
 * Pressuposto: o componente que chama deve fazer optimistic update
 * (esconder localmente o item) e o `commit` faz o DELETE real no Supabase.
 */
import { toast } from "sonner";

interface UndoableDeleteOptions<T> {
  /** Texto principal do toast (ex.: "Matrícula eliminada") */
  message: string;
  /** Texto secundário (ex.: nome do educando) */
  description?: string;
  /** Tempo até confirmar (ms). Default 6000. */
  delay?: number;
  /** Função que executa o DELETE real (ex.: chamada Supabase). */
  commit: (item: T) => Promise<void> | void;
  /** Callback após confirmação bem sucedida (ex.: invalidar query). */
  onConfirmed?: (item: T) => void;
  /** Callback se o utilizador anular (ex.: invalidar query para repor item). */
  onUndone?: (item: T) => void;
  /** Callback se o commit falhar. */
  onError?: (err: unknown, item: T) => void;
}

export function useUndoableDelete<T>() {
  return (item: T, opts: UndoableDeleteOptions<T>) => {
    let cancelled = false;
    const delay = opts.delay ?? 6000;

    const timer = window.setTimeout(async () => {
      if (cancelled) return;
      try {
        await opts.commit(item);
        opts.onConfirmed?.(item);
      } catch (err) {
        console.error("[undoable-delete] commit falhou:", err);
        opts.onError?.(err, item);
        toast.error("Não foi possível eliminar.", {
          description: err instanceof Error ? err.message : undefined,
        });
        opts.onUndone?.(item);
      }
    }, delay);

    toast(opts.message, {
      description: opts.description,
      duration: delay,
      action: {
        label: "Anular",
        onClick: () => {
          cancelled = true;
          window.clearTimeout(timer);
          toast.success("Acção anulada.");
          opts.onUndone?.(item);
        },
      },
    });
  };
}
