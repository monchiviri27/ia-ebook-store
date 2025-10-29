// src/components/SearchBar.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';

interface Libro {
  id: string;
  titulo: string;
  autor: string;
  precio: number;
  genero: string;
  portada_url: string;
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState<Libro[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Cerrar resultados al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Buscar libros (misma lógica que tu modal)
  useEffect(() => {
    const buscarLibros = async () => {
      if (!query.trim()) {
        setResultados([]);
        setShowResults(false);
        return;
      }

      setLoading(true);
      setShowResults(true);
      
      try {
        const { data, error } = await supabase
          .from('libros')
          .select('id, titulo, autor, precio, genero, portada_url')
          .or(`titulo.ilike.%${query}%,autor.ilike.%${query}%,genero.ilike.%${query}%`)
          .limit(8); // Un poco menos que el modal

        if (error) throw error;
        setResultados(data || []);
      } catch (error) {
        console.error('Error buscando libros:', error);
        setResultados([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(buscarLibros, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleResultClick = () => {
    setShowResults(false);
    setQuery('');
  };

  return (
    <div ref={searchRef} className="bg-white border-b border-gray-200 py-4 relative">
      <div className="max-w-4xl mx-auto px-4">
        <div className="relative">
          {/* Input de búsqueda */}
          <input
            type="text"
            placeholder="Buscar libros por título, autor o género..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query && setShowResults(true)}
            className="w-full px-6 py-4 pl-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg shadow-sm transition-all duration-200"
          />
          
          {/* Icono de lupa */}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Botón de buscar */}
          <button
            onClick={() => query && setShowResults(true)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            Buscar
          </button>
        </div>

        {/* Resultados - Dropdown */}
        {showResults && (
          <div className="absolute top-full left-4 right-4 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50 animate-fadeIn">
            {loading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600 text-sm">Buscando libros...</p>
              </div>
            ) : resultados.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {resultados.map((libro) => (
                  <Link
                    key={libro.id}
                    href={`/libros/${libro.id}`}
                    onClick={handleResultClick}
                    className="flex items-center space-x-4 p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="relative w-12 h-16 flex-shrink-0">
                      <Image
                        src={libro.portada_url}
                        alt={libro.titulo}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{libro.titulo}</h3>
                      <p className="text-sm text-gray-600">Por: {libro.autor}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {libro.genero}
                        </span>
                        <span className="text-sm font-bold text-green-600">
                          ${libro.precio.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : query ? (
              <div className="p-6 text-center">
                <div className="text-3xl mb-2">🔍</div>
                <p className="text-gray-600">No se encontraron libros para "{query}"</p>
                <p className="text-sm text-gray-500 mt-1">Intenta con otras palabras clave</p>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}