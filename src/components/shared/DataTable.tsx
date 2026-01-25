import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  title?: string;
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  itemsPerPage?: number;
  isLoading?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  title,
  data,
  columns,
  searchable = true,
  searchPlaceholder = 'Pesquisar...',
  itemsPerPage = 10,
  isLoading = false,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filtrar dados
  const filteredData = searchable
    ? data.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : data;

  // Paginação
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  return (
    <Card>
      {(title || searchable) && (
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {title && <CardTitle>{title}</CardTitle>}
            {searchable && (
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">A carregar...</div>
        ) : paginatedData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? 'Nenhum resultado encontrado' : 'Nenhum dado disponível'}
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((column) => (
                      <TableHead key={column.key}>{column.label}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((item, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      className="border-b transition-colors hover:bg-muted/50"
                    >
                      {columns.map((column) => (
                        <TableCell key={column.key}>
                          {column.render ? column.render(item) : item[column.key]}
                        </TableCell>
                      ))}
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  A mostrar {startIndex + 1} a {Math.min(endIndex, filteredData.length)} de{' '}
                  {filteredData.length} resultados
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Próxima
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
