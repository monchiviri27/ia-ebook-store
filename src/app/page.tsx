// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Libro } from '@/context/CarritoContext';
import HeroSection from '@/components/HeroSection';
import BookGrid from '@/components/BookGrid';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';

import Link from 'next/link';

// O si ya tienes Link importado, asegúrate de que esté disponible en todo el componente

export default function HomePage() {
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

        if (error) {
          console.error('Error de Supabase:', error);
          setError('Error al cargar los libros desde la base de datos');
          return;
        }

        if (!data || data.length === 0) {
          setError('No se encontraron libros en la base de datos');
          return;
        }

        setLibros(data as Libro[]);

      } catch (err) {
        console.error('Error general:', err);
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
    <main className="min-h-screen bg-gray-50">
      <HeroSection />
      
      {/* Catálogo de Libros */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nuestros Libros Destacados
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explora nuestra colección de libros únicos, disponibles en formato PDF y EPUB para tu comodidad.
            </p>
          </div>

          <BookGrid libros={libros} />

          {/* Call to Action */}
          <div className="text-center mt-12">
            <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                ¿No encuentras lo que buscas?
              </h3>
              <p className="text-gray-600 mb-6">
                Próximamente agregaremos más títulos a nuestra colección. 
                ¡Mantente atento a las novedades!
              </p>
              <Link 
                href="/admin" 
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                🛠️ Agregar Más Libros
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
