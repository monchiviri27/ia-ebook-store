// src/app/ofertas/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Libro } from '@/context/CarritoContext';
import BookCarousel from '@/components/BookCarousel';
import LoadingState from '@/components/LoadingState';

export default function OfertasPage() {
  const [ofertas, setOfertas] = useState<Libro[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarOfertas = async () => {
      try {
        // Filtrar libros con precio menor a $5 (ofertas)
        const { data, error } = await supabase
          .from('libros')
          .select('*')
          .lt('precio', 5)
          .order('precio');

        if (error) throw error;
        setOfertas(data as Libro[]);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    cargarOfertas();
  }, []);

  if (loading) return <LoadingState />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">💰 Ofertas Especiales</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Libros con precios especiales. ¡Aprovecha estas oportunidades únicas!
          </p>
        </div>

        {ofertas.length > 0 ? (
          <BookCarousel 
            titulo={`Ofertas - ${ofertas.length} libros disponibles`}
            libros={ofertas}
            icono="💰"
          />
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">😔</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              No hay ofertas disponibles
            </h2>
            <p className="text-gray-600">
              Vuelve pronto para descubrir nuestras próximas ofertas especiales.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}