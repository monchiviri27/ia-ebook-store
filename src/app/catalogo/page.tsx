// src/app/catalogo/page.tsx - VERSIÓN CON CARROUSELS
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Libro } from '@/context/CarritoContext';
import BookCarousel from '@/components/BookCarousel';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';

export default function CatalogoPage() {
  const [libros, setLibros] = useState<Libro[]>([]);
  const [generos, setGeneros] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const { data, error } = await supabase
          .from('libros')
          .select('*')
          .order('titulo');

        if (error) throw error;
        
        setLibros(data as Libro[]);
        
        // Extraer géneros únicos
        const todosGeneros = [...new Set(data.map(libro => libro.genero))];
        setGeneros(todosGeneros);
      } catch (err) {
        setError('Error al cargar los libros');
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  // Agrupar libros por género para los carrousels
  const librosPorGenero = generos.map(genero => ({
    genero,
    libros: libros.filter(libro => libro.genero === genero)
  }));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Catálogo Completo</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explora todos nuestros {libros.length} libros organizados por género
          </p>
        </div>

        {/* Carrousel de todos los libros */}
        {libros.length > 0 && (
          <section className="mb-12">
            <BookCarousel 
              titulo="📚 Todos los Libros" 
              libros={libros}
              icono="📚"
            />
          </section>
        )}

        {/* Carrousels por género */}
        <div className="space-y-12">
          {librosPorGenero.map(({ genero, libros }) => (
            libros.length > 0 && (
              <BookCarousel 
                key={genero}
                titulo={genero} 
                libros={libros}
                icono="📖"
              />
            )
          ))}
        </div>

        {/* Empty state */}
        {libros.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              No hay libros disponibles
            </h2>
            <p className="text-gray-600">
              Vuelve más tarde para explorar nuevos títulos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}