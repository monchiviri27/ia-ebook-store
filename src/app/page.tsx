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

      
    </main>
  );
}
