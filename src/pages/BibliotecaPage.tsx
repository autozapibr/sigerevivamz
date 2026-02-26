import React, { useState, useEffect } from 'react';
import { useSearch } from '@/contexts/SearchContext';
import { motion } from 'framer-motion';
import { 
  LibraryBig, Plus, Search, BookOpen, Users, Clock, 
  AlertTriangle, MoreHorizontal, Edit, Trash2, BookMarked,
  ArrowRightLeft, Filter, X
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useBooks,
  useCreateBook,
  useUpdateBook,
  useDeleteBook,
  useBookLoans,
  useLibraryStats,
  BOOK_CATEGORIES,
  type Book,
  type BookInsert,
  type BookFilters,
} from '@/hooks/useLibrary';
import { useStudents } from '@/hooks/useStudents';

export default function BibliotecaPage() {
  const [activeTab, setActiveTab] = useState('catalogo');
  const { searchQuery: searchTerm, setPlaceholder } = useSearch();

  useEffect(() => {
    setPlaceholder('Pesquisar por título, autor ou ISBN...');
    return () => setPlaceholder('Pesquisar educandos, professores, turmas...');
  }, [setPlaceholder]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showLoanDialog, setShowLoanDialog] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  
  const [formData, setFormData] = useState<BookInsert>({
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    publication_year: new Date().getFullYear(),
    category: '',
    quantity: 1,
    location: '',
    description: '',
  });

  const filters: BookFilters = {
    search: searchTerm,
    category: categoryFilter !== 'all' ? categoryFilter : null,
  };

  const { data: books = [], isLoading } = useBooks(filters);
  const { data: stats } = useLibraryStats();
  const { data: loans = [] } = useBookLoans({ status: 'active' });
  const { data: students = [] } = useStudents({ status: 'Ativo' });
  const createBook = useCreateBook();
  const updateBook = useUpdateBook();
  const deleteBook = useDeleteBook();

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      isbn: '',
      publisher: '',
      publication_year: new Date().getFullYear(),
      category: '',
      quantity: 1,
      location: '',
      description: '',
    });
  };

  const handleCreate = async () => {
    await createBook.mutateAsync(formData);
    setShowCreateDialog(false);
    resetForm();
  };

  const handleEdit = (book: Book) => {
    setSelectedBook(book);
    setFormData({
      title: book.title,
      author: book.author || '',
      isbn: book.isbn || '',
      publisher: book.publisher || '',
      publication_year: book.publication_year || new Date().getFullYear(),
      category: book.category || '',
      quantity: book.quantity,
      location: book.location || '',
      description: book.description || '',
    });
    setShowEditDialog(true);
  };

  const handleUpdate = async () => {
    if (selectedBook) {
      await updateBook.mutateAsync({ id: selectedBook.id, ...formData });
      setShowEditDialog(false);
      resetForm();
    }
  };

  const handleDelete = async () => {
    if (selectedBook) {
      await deleteBook.mutateAsync(selectedBook.id);
      setShowDeleteDialog(false);
      setSelectedBook(null);
    }
  };

  const getInitials = (title: string) =>
    title.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

  return (
    <MainLayout title="Biblioteca" subtitle="Gestão de livros e empréstimos">
      <div className="space-y-4 md:space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          <Card className="bg-card/50">
            <CardContent className="p-4 md:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Total Títulos</p>
                  <p className="text-xl md:text-2xl font-bold">{stats?.totalTitles || 0}</p>
                </div>
                <LibraryBig className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-500/10 border-green-500/20">
            <CardContent className="p-4 md:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-green-500">Disponíveis</p>
                  <p className="text-xl md:text-2xl font-bold text-green-500">{stats?.availableBooks || 0}</p>
                </div>
                <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-primary/10 border-primary/20">
            <CardContent className="p-4 md:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-primary">Empréstimos</p>
                  <p className="text-xl md:text-2xl font-bold text-primary">{stats?.activeLoans || 0}</p>
                </div>
                <ArrowRightLeft className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-red-500/10 border-red-500/20">
            <CardContent className="p-4 md:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-red-500">Atrasados</p>
                  <p className="text-xl md:text-2xl font-bold text-red-500">{stats?.overdueLoans || 0}</p>
                </div>
                <AlertTriangle className="w-6 h-6 md:w-8 md:h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <TabsList className="w-full md:w-auto">
              <TabsTrigger value="catalogo" className="flex-1 md:flex-none">
                <BookOpen className="w-4 h-4 mr-2" />
                Catálogo
              </TabsTrigger>
              <TabsTrigger value="emprestimos" className="flex-1 md:flex-none">
                <ArrowRightLeft className="w-4 h-4 mr-2" />
                Empréstimos
              </TabsTrigger>
            </TabsList>
            
            {activeTab === 'catalogo' && (
              <Button onClick={() => { resetForm(); setShowCreateDialog(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Novo Livro</span>
                <span className="sm:hidden">Novo</span>
              </Button>
            )}
          </div>

          {/* Catálogo Tab */}
          <TabsContent value="catalogo" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="p-4 md:pt-6">
                <div className="flex flex-col gap-3 md:flex-row md:gap-4">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas Categorias</SelectItem>
                      {BOOK_CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Books Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <Skeleton className="h-32 w-full mb-3" />
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2" />
                    </CardContent>
                  </Card>
                ))
              ) : books.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="py-12 text-center">
                    <LibraryBig className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-2">
                      {searchTerm || categoryFilter !== 'all'
                        ? 'Nenhum livro encontrado com os filtros aplicados.'
                        : 'Nenhum livro registado ainda.'}
                    </p>
                    <Button 
                      variant="link"
                      onClick={() => { resetForm(); setShowCreateDialog(true); }}
                    >
                      Adicionar primeiro livro
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                books.map((book, index) => (
                  <motion.div
                    key={book.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow group">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-12 h-16 rounded bg-primary/10 flex items-center justify-center shrink-0">
                            <BookMarked className="w-6 h-6 text-primary" />
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="opacity-0 group-hover:opacity-100"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(book)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setSelectedBook(book); setShowLoanDialog(true); }}>
                                <ArrowRightLeft className="w-4 h-4 mr-2" />
                                Emprestar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => { setSelectedBook(book); setShowDeleteDialog(true); }}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        <h3 className="font-semibold line-clamp-2 mb-1">{book.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{book.author || 'Autor desconhecido'}</p>
                        
                        {book.category && (
                          <Badge variant="secondary" className="mb-3">{book.category}</Badge>
                        )}
                        
                        <div className="flex items-center justify-between text-sm pt-3 border-t">
                          <span className="text-muted-foreground">
                            {book.available}/{book.quantity} disponíveis
                          </span>
                          <Badge className={
                            book.available > 0 
                              ? 'bg-green-500/10 text-green-500 border-0'
                              : 'bg-red-500/10 text-red-500 border-0'
                          }>
                            {book.available > 0 ? 'Disponível' : 'Indisponível'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Empréstimos Tab */}
          <TabsContent value="emprestimos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Empréstimos Activos</CardTitle>
                <CardDescription>
                  Lista de livros emprestados aguardando devolução
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loans.length === 0 ? (
                  <div className="text-center py-12">
                    <ArrowRightLeft className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Nenhum empréstimo activo no momento.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {loans.map((loan) => (
                      <div key={loan.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {loan.student?.name?.charAt(0) || 'E'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{loan.book?.title || 'Livro'}</p>
                            <p className="text-sm text-muted-foreground">
                              {loan.student?.name || 'Educando'} • Devolução: {new Date(loan.due_date).toLocaleDateString('pt-MZ')}
                            </p>
                          </div>
                        </div>
                        <Badge className={
                          new Date(loan.due_date) < new Date()
                            ? 'bg-red-500/10 text-red-500 border-0'
                            : 'bg-primary/10 text-primary border-0'
                        }>
                          {new Date(loan.due_date) < new Date() ? 'Atrasado' : 'Em dia'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create/Edit Book Dialog */}
      <Dialog open={showCreateDialog || showEditDialog} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false);
          setShowEditDialog(false);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {showEditDialog ? 'Editar Livro' : 'Novo Livro'}
            </DialogTitle>
            <DialogDescription>
              {showEditDialog ? 'Actualize os dados do livro.' : 'Adicione um novo livro ao catálogo.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                placeholder="Ex: Dom Quixote"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="author">Autor</Label>
                <Input
                  id="author"
                  placeholder="Ex: Miguel de Cervantes"
                  value={formData.author || ''}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="isbn">ISBN</Label>
                <Input
                  id="isbn"
                  placeholder="Ex: 978-85-..."
                  value={formData.isbn || ''}
                  onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="publisher">Editora</Label>
                <Input
                  id="publisher"
                  placeholder="Ex: Editora XYZ"
                  value={formData.publisher || ''}
                  onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Ano de Publicação</Label>
                <Input
                  id="year"
                  type="number"
                  placeholder="2024"
                  value={formData.publication_year || ''}
                  onChange={(e) => setFormData({ ...formData, publication_year: parseInt(e.target.value) || null })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select 
                  value={formData.category || ''} 
                  onValueChange={(v) => setFormData({ ...formData, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {BOOK_CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantidade</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  value={formData.quantity || 1}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Localização na Biblioteca</Label>
              <Input
                id="location"
                placeholder="Ex: Estante A3, Prateleira 2"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Sinopse ou observações..."
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateDialog(false);
              setShowEditDialog(false);
              resetForm();
            }}>
              Cancelar
            </Button>
            <Button 
              onClick={showEditDialog ? handleUpdate : handleCreate}
              disabled={!formData.title || createBook.isPending || updateBook.isPending}
            >
              {(createBook.isPending || updateBook.isPending) 
                ? 'A guardar...' 
                : showEditDialog ? 'Guardar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Livro</DialogTitle>
            <DialogDescription>
              Tem a certeza que deseja eliminar o livro{' '}
              <strong>{selectedBook?.title}</strong>? Esta acção não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleteBook.isPending}
            >
              {deleteBook.isPending ? 'A eliminar...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Loan Dialog */}
      <Dialog open={showLoanDialog} onOpenChange={setShowLoanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registar Empréstimo</DialogTitle>
            <DialogDescription>
              Emprestar: <strong>{selectedBook?.title}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Educando</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar educando" />
                </SelectTrigger>
                <SelectContent>
                  {students.map(student => (
                    <SelectItem key={student.id} value={student.id.toString()}>
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Data de Devolução</Label>
              <Input type="date" min={new Date().toISOString().split('T')[0]} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLoanDialog(false)}>
              Cancelar
            </Button>
            <Button>Confirmar Empréstimo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
