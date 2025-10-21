// src/app/generos/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Libro } from '@/context/CarritoContext';
import BookCarousel from '@/components/BookCarousel';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';

export default function GenerosPage() {
  const [libros, setLibros] = useState<Libro[]>([]);
  const [generos, setGeneros] = useState<string[]>([]);
  const [generoSeleccionado, setGeneroSeleccionado] = useState<string>('todos');
  const [loading, setLoading] = useState(true);

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
        setGeneros(['todos', ...todosGeneros]);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const librosFiltrados = generoSeleccionado === 'todos' 
    ? libros 
    : libros.filter(libro => libro.genero === generoSeleccionado);

  if (loading) return <LoadingState />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Géneros Literarios</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explora nuestra colección organizada por géneros
          </p>
        </div>

        {/* Filtros de géneros */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {generos.map(genero => (
            <button
              key={genero}
              onClick={() => setGeneroSeleccionado(genero)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                generoSeleccionado === genero
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {genero === 'todos' ? '📚 Todos los Géneros' : genero}
            </button>
          ))}
        </div>

        {/* Resultados */}
        {librosFiltrados.length > 0 ? (
          <BookCarousel 
            titulo={`${generoSeleccionado === 'todos' ? 'Todos los Libros' : generoSeleccionado}`}
            libros={librosFiltrados}
            icono="📖"
          />
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              No hay libros en este género
            </h2>
            <p className="text-gray-600">
              Prueba con otro género o explora todos nuestros libros.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}