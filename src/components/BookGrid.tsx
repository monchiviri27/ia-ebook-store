// src/app/components/BookGrid.tsx
'use client';

import { Libro } from '@/context/CarritoContext';
import BookCard from '@/components/BookCard';

interface BookGridProps {
  libros: Libro[];
}

export default function BookGrid({ libros }: BookGridProps) {
  if (libros.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-500">No hay libros disponibles en este momento.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {libros.map((libro) => (
        <BookCard key={libro.id} libro={libro} />
      ))}
    </div>
  );
}