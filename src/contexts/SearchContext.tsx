import React, { createContext, useContext, useState, useCallback } from 'react';

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  placeholder: string;
  setPlaceholder: (placeholder: string) => void;
}

const SearchContext = createContext<SearchContextType>({
  searchQuery: '',
  setSearchQuery: () => {},
  placeholder: 'Pesquisar educandos, professores, turmas...',
  setPlaceholder: () => {},
});

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [placeholder, setPlaceholder] = useState('Pesquisar educandos, professores, turmas...');

  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery, placeholder, setPlaceholder }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  return useContext(SearchContext);
}
