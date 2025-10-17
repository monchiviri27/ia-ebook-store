// src/app/components/BookCard.tsx
'use client';

import Image from 'next/image';
import { Libro } from '@/context/CarritoContext';
import { useCarritoConNotificaciones } from '@/hooks/useCarritoConNotificaciones';
import { useDownload } from '@/hooks/useDownload';

interface BookCardProps {
  libro: Libro;
}

export default function BookCard({ libro }: BookCardProps) {
  const { agregarAlCarrito, estaEnCarrito } = useCarritoConNotificaciones();
  const { descargarArchivo } = useDownload();

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Portada del Libro */}
      <div className="relative h-48 sm:h-56 w-full">
        <Image
          src={libro.portada_url}
          alt={`Portada de ${libro.titulo}`}
          fill
          style={{ objectFit: 'cover' }}
          className="w-full"
        />
      </div>

      {/* Información del Libro */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm sm:text-base">
          {libro.titulo}
        </h3>
        
        <p className="text-xs sm:text-sm text-gray-600 mb-2">
          Por: {libro.autor}
        </p>
        
        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2">
          {libro.genero}
        </span>
        
        <p className="text-gray-700 text-xs sm:text-sm mb-3 line-clamp-2">
          {libro.descripcion}
        </p>
        
        {/* Precio */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-bold text-green-600">
            ${libro.precio.toFixed(2)}
          </span>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex gap-2">
            <button 
              className="flex-1 bg-green-600 text-white py-2 px-2 rounded-lg hover:bg-green-700 transition-colors text-xs flex items-center justify-center gap-1"
              onClick={() => descargarArchivo(libro.ruta_pdf, 'pdf', libro.titulo)}
              title="Descargar PDF"
            >
              <span>📘</span>
              <span className="hidden sm:inline">PDF</span>
            </button>
            <button 
              className="flex-1 bg-purple-600 text-white py-2 px-2 rounded-lg hover:bg-purple-700 transition-colors text-xs flex items-center justify-center gap-1"
              onClick={() => descargarArchivo(libro.ruta_epub, 'epub', libro.titulo)}
              title="Descargar EPUB"
            >
              <span>📙</span>
              <span className="hidden sm:inline">EPUB</span>
            </button>
          </div>
          
          <button 
            className={`py-2 px-3 rounded-lg transition-colors text-xs flex items-center justify-center gap-1 ${
              estaEnCarrito(libro.id)
                ? 'bg-gray-600 text-white hover:bg-gray-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            onClick={() => agregarAlCarrito(libro)}
          >
            <span>{estaEnCarrito(libro.id) ? '✅' : '🛒'}</span>
            <span className="hidden sm:inline">
              {estaEnCarrito(libro.id) ? 'En Carrito' : 'Agregar'}
            </span>
            <span className="sm:hidden">
              {estaEnCarrito(libro.id) ? '✓' : '+'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}