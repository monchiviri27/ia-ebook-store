// src/components/BusquedaModal.tsx
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

interface BusquedaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BusquedaModal({ isOpen, onClose }: BusquedaModalProps) {
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState<Libro[]>([]);
  const [loading, setLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Cerrar modal al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden'; // Prevenir scroll
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Buscar libros
  useEffect(() => {
    const buscarLibros = async () => {
      if (!query.trim()) {
        setResultados([]);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('libros')
          .select('id, titulo, autor, precio, genero, portada_url')
          .or(`titulo.ilike.%${query}%,autor.ilike.%${query}%,genero.ilike.%${query}%`)
          .limit(10);

        if (error) throw error;
        setResultados(data || []);
      } catch (error) {
        console.error('Error buscando libros:', error);
        setResultados([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(buscarLibros, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20 px-4">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden animate-fadeIn"
      >
        {/* Header del Modal */}
        <div className="border-b border-gray-200 p-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar libros por título, autor o género..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              autoFocus
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button
              onClick={onClose}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Resultados */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Buscando libros...</p>
            </div>
          ) : resultados.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {resultados.map((libro) => (
                <Link
                  key={libro.id}
                  href={`/libro/${libro.id}`}
                  onClick={onClose}
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
            <div className="p-8 text-center">
              <div className="text-4xl mb-2">🔍</div>
              <p className="text-gray-600">No se encontraron libros para "{query}"</p>
              <p className="text-sm text-gray-500 mt-1">Intenta con otras palabras clave</p>
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="text-4xl mb-2">📚</div>
              <p className="text-gray-600">Busca libros por título, autor o género</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}