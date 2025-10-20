// src/app/catalogo/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Libro } from '@/context/CarritoContext';
import BookGrid from '@/components/BookGrid';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';

export default function CatalogoPage() {
  const [libros, setLibros] = useState<Libro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarLibros = async () => {
      try {
        const { data, error } = await supabase
          .from('libros')
          .select('*')
          .order('titulo');

        if (error) throw error;
        setLibros(data as Libro[]);
      } catch (err) {
        setError('Error al cargar los libros');
      } finally {
        setLoading(false);
      }
    };

    cargarLibros();
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Catálogo Completo</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explora todos nuestros libros disponibles. {libros.length} títulos encontrados.
          </p>
        </div>

        <BookGrid libros={libros} />
      </div>
    </div>
  );
}