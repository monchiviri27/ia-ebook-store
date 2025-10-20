// src/components/BookCarousel.tsx
'use client';

import { useRef } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import BookCarouselCard from './BookCarouselCard';
import { Libro } from '@/context/CarritoContext';

interface BookCarouselProps {
  titulo: string;
  libros: Libro[];
  icono?: string;
}

export default function BookCarousel({ titulo, libros, icono = '📚' }: BookCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  if (libros.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4 px-4 sm:px-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span>{icono}</span>
          {titulo}
        </h2>
        
        {libros.length > 4 && (
          <div className="flex gap-2">
            <button
              onClick={scrollLeft}
              className="p-2 rounded-full bg-white border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm"
              aria-label="Anterior"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
            <button
              onClick={scrollRight}
              className="p-2 rounded-full bg-white border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm"
              aria-label="Siguiente"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="relative">
        <div
          ref={carouselRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-4 sm:px-6 py-2 snap-x snap-mandatory"
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            scrollPadding: '0 1rem'
          }}
        >
          {libros.map((libro) => (
            <div key={libro.id} className="snap-start">
              <BookCarouselCard libro={libro} />
            </div>
          ))}
        </div>

        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-50 to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none" />
      </div>
    </section>
  );
}