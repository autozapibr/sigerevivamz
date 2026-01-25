import React, { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, RefreshCw, FolderPlus } from 'lucide-react';
import { useFinancialCategories, useCreateCategory } from '@/hooks/useFinancial';
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
  const [newCategoryName, setNewCategoryName] = useState('');
  
  const { data: categories = [] } = useFinancialCategories();
  const createCategory = useCreateCategory();
  
  const filteredCategories = categories.filter(c => c.type === type);
  
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    
    createCategory.mutate(
      { name: newCategoryName.trim(), type },
      {
        onSuccess: (data) => {
          setNewCategoryName('');
          setAddDialogOpen(false);
          // Select the newly created category
          if (data?.id) {
            onChange(data.id.toString());
          }
        },
      }
    );
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
              <SelectItem key={cat.id} value={cat.id.toString()}>
                {cat.name}
              </SelectItem>
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
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder={type === 'Receita' ? 'ex: Propinas, Matrículas...' : 'ex: Salários, Material...'}
                className="mt-1.5"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCategory();
                  }
                }}
              />
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
              disabled={createCategory.isPending || !newCategoryName.trim()}
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
    </>
  );
}
