import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Types for Library
export interface Book {
  id: number;
  isbn: string | null;
  title: string;
  author: string | null;
  publisher: string | null;
  publication_year: number | null;
  category: string | null;
  quantity: number;
  available: number;
  location: string | null;
  description: string | null;
  cover_url: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface BookLoan {
  id: number;
  book_id: number;
  student_id: number;
  borrowed_at: string;
  due_date: string;
  returned_at: string | null;
  status: 'active' | 'returned' | 'overdue';
  notes: string | null;
  book?: Book;
  student?: { id: number; name: string };
}

export interface BookInsert {
  isbn?: string | null;
  title: string;
  author?: string | null;
  publisher?: string | null;
  publication_year?: number | null;
  category?: string | null;
  quantity?: number;
  available?: number;
  location?: string | null;
  description?: string | null;
  cover_url?: string | null;
}

export interface BookFilters {
  search?: string;
  category?: string | null;
  available_only?: boolean;
}

// Since we don't have actual library tables yet, we'll use local state
// This simulates what the hooks would look like with real database tables

// Mock data for demonstration
const MOCK_BOOKS: Book[] = [];
const MOCK_LOANS: BookLoan[] = [];
const MOCK_CATEGORIES = [
  'Literatura',
  'Matemática',
  'Ciências Naturais',
  'História',
  'Geografia',
  'Português',
  'Inglês',
  'Física',
  'Química',
  'Biologia',
  'Informática',
  'Arte',
  'Educação Física',
  'Outros'
];

export function useBooks(filters: BookFilters = {}) {
  return useQuery({
    queryKey: ['books', filters],
    queryFn: async () => {
      // Simulating database query
      let result = [...MOCK_BOOKS];
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        result = result.filter(b => 
          b.title.toLowerCase().includes(searchLower) ||
          b.author?.toLowerCase().includes(searchLower) ||
          b.isbn?.includes(searchLower)
        );
      }
      
      if (filters.category) {
        result = result.filter(b => b.category === filters.category);
      }
      
      if (filters.available_only) {
        result = result.filter(b => b.available > 0);
      }
      
      return result;
    },
  });
}

export function useBook(bookId: number | null) {
  return useQuery({
    queryKey: ['book', bookId],
    queryFn: async () => {
      if (!bookId) return null;
      return MOCK_BOOKS.find(b => b.id === bookId) || null;
    },
    enabled: !!bookId,
  });
}

export function useCreateBook() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (book: BookInsert) => {
      const newBook: Book = {
        id: Date.now(),
        ...book,
        isbn: book.isbn || null,
        author: book.author || null,
        publisher: book.publisher || null,
        publication_year: book.publication_year || null,
        category: book.category || null,
        quantity: book.quantity || 1,
        available: book.available || book.quantity || 1,
        location: book.location || null,
        description: book.description || null,
        cover_url: book.cover_url || null,
        created_at: new Date().toISOString(),
        updated_at: null,
      };
      MOCK_BOOKS.push(newBook);
      return newBook;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['library-stats'] });
      toast({
        title: 'Sucesso',
        description: 'Livro registado com sucesso',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateBook() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Book> & { id: number }) => {
      const index = MOCK_BOOKS.findIndex(b => b.id === id);
      if (index === -1) throw new Error('Livro não encontrado');
      
      MOCK_BOOKS[index] = { ...MOCK_BOOKS[index], ...data, updated_at: new Date().toISOString() };
      return MOCK_BOOKS[index];
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['book', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['library-stats'] });
      toast({
        title: 'Sucesso',
        description: 'Livro actualizado com sucesso',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteBook() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (bookId: number) => {
      const index = MOCK_BOOKS.findIndex(b => b.id === bookId);
      if (index === -1) throw new Error('Livro não encontrado');
      MOCK_BOOKS.splice(index, 1);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['library-stats'] });
      toast({
        title: 'Sucesso',
        description: 'Livro removido com sucesso',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useBookLoans(filters: { status?: string; book_id?: number; student_id?: number } = {}) {
  return useQuery({
    queryKey: ['book-loans', filters],
    queryFn: async () => {
      let result = [...MOCK_LOANS];
      
      if (filters.status) {
        result = result.filter(l => l.status === filters.status);
      }
      if (filters.book_id) {
        result = result.filter(l => l.book_id === filters.book_id);
      }
      if (filters.student_id) {
        result = result.filter(l => l.student_id === filters.student_id);
      }
      
      return result;
    },
  });
}

export function useCreateLoan() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (loan: { book_id: number; student_id: number; due_date: string; notes?: string }) => {
      const book = MOCK_BOOKS.find(b => b.id === loan.book_id);
      if (!book || book.available <= 0) {
        throw new Error('Livro não disponível');
      }
      
      const newLoan: BookLoan = {
        id: Date.now(),
        book_id: loan.book_id,
        student_id: loan.student_id,
        borrowed_at: new Date().toISOString(),
        due_date: loan.due_date,
        returned_at: null,
        status: 'active',
        notes: loan.notes || null,
      };
      
      // Update book availability
      book.available--;
      
      MOCK_LOANS.push(newLoan);
      return newLoan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['book-loans'] });
      queryClient.invalidateQueries({ queryKey: ['library-stats'] });
      toast({
        title: 'Sucesso',
        description: 'Empréstimo registado com sucesso',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useReturnBook() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (loanId: number) => {
      const loan = MOCK_LOANS.find(l => l.id === loanId);
      if (!loan) throw new Error('Empréstimo não encontrado');
      
      const book = MOCK_BOOKS.find(b => b.id === loan.book_id);
      if (book) {
        book.available++;
      }
      
      loan.returned_at = new Date().toISOString();
      loan.status = 'returned';
      
      return loan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['book-loans'] });
      queryClient.invalidateQueries({ queryKey: ['library-stats'] });
      toast({
        title: 'Sucesso',
        description: 'Devolução registada com sucesso',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useLibraryStats() {
  return useQuery({
    queryKey: ['library-stats'],
    queryFn: async () => {
      const totalBooks = MOCK_BOOKS.reduce((sum, b) => sum + b.quantity, 0);
      const availableBooks = MOCK_BOOKS.reduce((sum, b) => sum + b.available, 0);
      const activeLoans = MOCK_LOANS.filter(l => l.status === 'active').length;
      const overdueLoans = MOCK_LOANS.filter(l => 
        l.status === 'active' && new Date(l.due_date) < new Date()
      ).length;
      
      return {
        totalTitles: MOCK_BOOKS.length,
        totalBooks,
        availableBooks,
        activeLoans,
        overdueLoans,
        categories: MOCK_CATEGORIES,
      };
    },
  });
}

export { MOCK_CATEGORIES as BOOK_CATEGORIES };
