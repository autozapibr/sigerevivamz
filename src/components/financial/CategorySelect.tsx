import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, RefreshCw, FolderPlus, AlertCircle, Trash2 } from 'lucide-react';
import { useFinancialCategories, useCreateCategory, useDeleteCategory } from '@/hooks/useFinancial';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type TransactionType = Database['public']['Enums']['transaction_type'];

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  type: TransactionType;
  placeholder?: string;
  className?: string;
}

export function CategorySelect({ 
  value, 
  onChange, 
  type, 
  placeholder = 'Seleccione categoria...',
  className 
}: CategorySelectProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: number; name: string } | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const { data: categories = [], refetch } = useFinancialCategories();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();
  
  // Filter categories by type - ensure we only show the correct type
  const filteredCategories = categories.filter(c => c.type === type);
  
  // Check if category already exists
  const categoryExists = filteredCategories.some(
    c => c.name.toLowerCase().trim() === newCategoryName.toLowerCase().trim()
  );
  
  // Clear error when dialog closes
  useEffect(() => {
    if (!addDialogOpen) {
      setError(null);
      setNewCategoryName('');
    }
  }, [addDialogOpen]);
  
  const handleAddCategory = async () => {
    const trimmedName = newCategoryName.trim();
    if (!trimmedName) {
      setError('O nome da categoria é obrigatório');
      return;
    }
    
    // Check for existing category with same name and type
    if (categoryExists) {
      setError('Já existe uma categoria com este nome');
      return;
    }
    
    setError(null);
    
    createCategory.mutate(
      { name: trimmedName, type },
      {
        onSuccess: (data) => {
          setNewCategoryName('');
          setAddDialogOpen(false);
          // Refetch categories to get the updated list
          refetch();
          // Select the newly created category
          if (data?.id) {
            onChange(data.id.toString());
          }
          toast.success(`Categoria "${trimmedName}" criada com sucesso!`);
        },
        onError: (err: any) => {
          // Handle unique constraint violation
          if (err?.message?.includes('unique') || err?.code === '23505') {
            setError('Já existe uma categoria com este nome');
          } else {
            setError(err?.message || 'Erro ao criar categoria');
          }
        },
      }
    );
  };

  const handleDeleteClick = (e: React.MouseEvent, cat: { id: number; name: string }) => {
    e.preventDefault();
    e.stopPropagation();
    setCategoryToDelete(cat);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!categoryToDelete) return;
    
    deleteCategory.mutate(categoryToDelete.id, {
      onSuccess: () => {
        // If the deleted category was selected, clear selection
        if (value === categoryToDelete.id.toString()) {
          onChange('');
        }
        refetch();
        setDeleteDialogOpen(false);
        setCategoryToDelete(null);
      },
      onError: () => {
        setDeleteDialogOpen(false);
        setCategoryToDelete(null);
      },
    });
  };
  return (
    <>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {filteredCategories.length === 0 ? (
            <div className="px-2 py-3 text-center text-sm text-muted-foreground">
              Nenhuma categoria encontrada
            </div>
          ) : (
            filteredCategories.map(cat => (
              <div 
                key={cat.id} 
                className="relative flex items-center group"
              >
                <SelectItem value={cat.id.toString()} className="flex-1 pr-8">
                  {cat.name}
                </SelectItem>
                <button
                  type="button"
                  onClick={(e) => handleDeleteClick(e, cat)}
                  className="absolute right-2 p-1 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 rounded transition-opacity"
                  title="Remover categoria"
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive/70 hover:text-destructive" />
                </button>
              </div>
            ))
          )}
          
          {/* Separator */}
          <div className="my-1 border-t" />
          
          {/* Add new category option */}
          <div
            role="button"
            className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground transition-colors gap-2"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setAddDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 text-primary" />
            <span className="text-primary font-medium">Adicionar categoria</span>
          </div>
        </SelectContent>
      </Select>

      {/* Add Category Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderPlus className="h-5 w-5 text-primary" />
              Nova Categoria
            </DialogTitle>
            <DialogDescription>
              Adicionar categoria de {type === 'Receita' ? 'receita' : 'despesa'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="categoryName">Nome da Categoria</Label>
              <Input
                id="categoryName"
                value={newCategoryName}
                onChange={(e) => {
                  setNewCategoryName(e.target.value);
                  setError(null);
                }}
                placeholder={type === 'Receita' ? 'ex: Propinas, Matrículas...' : 'ex: Salários, Material...'}
                className={`mt-1.5 ${error ? 'border-destructive' : ''}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCategory();
                  }
                }}
                autoFocus
              />
              {error && (
                <p className="text-sm text-destructive mt-1.5 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {error}
                </p>
              )}
              {categoryExists && !error && newCategoryName.trim() && (
                <p className="text-sm text-amber-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Esta categoria já existe
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setAddDialogOpen(false);
                setNewCategoryName('');
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddCategory}
              disabled={createCategory.isPending || !newCategoryName.trim() || categoryExists}
              className="gap-2"
            >
              {createCategory.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover a categoria "{categoryToDelete?.name}"? 
              Esta acção não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCategoryToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteCategory.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
