// src/app/page.tsx - VERSIÓN CON CARROUSELS
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Libro } from '@/context/CarritoContext';
import HeroSection from '@/components/HeroSection';
import BookGrid from '@/components/BookGrid';
import BookCarousel from '@/components/BookCarousel';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import Link from 'next/link';

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

  // Filtrar libros para diferentes secciones
  const novedades = libros.slice(0, 8); // Primeros 8 libros como novedades
  const destacados = libros.filter(libro => libro.precio > 5).slice(0, 8); // Libros > $5
  const recomendados = libros.slice().sort(() => Math.random() - 0.5).slice(0, 8); // Aleatorios

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return (
    <main className="min-h-screen bg-gray-50">
      <HeroSection />
      
      {/* Sección de Carrousels */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Novedades */}
          <BookCarousel 
            titulo="🆕 Novedades" 
            libros={novedades}
            icono="🆕"
          />
          
          {/* Destacados */}
          <BookCarousel 
            titulo="⭐ Libros Destacados" 
            libros={destacados}
            icono="⭐"
          />
          
          {/* Recomendados */}
          <BookCarousel 
            titulo="💖 Recomendados para ti" 
            libros={recomendados}
            icono="💖"
          />
          
        </div>
      </section>

      {/* Catálogo Completo (grid tradicional) */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Catálogo Completo
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explora todos nuestros libros disponibles en formato PDF y EPUB.
            </p>
          </div>

          <BookGrid libros={libros} />

          {/* Call to Action */}
          <div className="text-center mt-12">
            <div className="bg-gray-50 rounded-lg shadow-md p-8 max-w-2xl mx-auto">
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
