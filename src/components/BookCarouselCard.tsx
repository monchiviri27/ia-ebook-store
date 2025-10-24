// components/BookCarouselCard.tsx - CON BOTONES DE DESCARGA
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Libro } from '@/context/CarritoContext';
import { useCarritoConNotificaciones } from '@/hooks/useCarritoConNotificaciones';
import { useDownload } from '@/hooks/useDownload';
import { useState } from 'react';

interface BookCarouselCardProps {
  libro: Libro;
}

export default function BookCarouselCard({ libro }: BookCarouselCardProps) {
  const { agregarAlCarrito, estaEnCarrito, removerDelCarrito } = useCarritoConNotificaciones();
  const { descargarArchivo } = useDownload();
  const [downloading, setDownloading] = useState<'pdf' | 'epub' | null>(null);
  const estaEnElCarrito = estaEnCarrito(libro.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    agregarAlCarrito(libro);
  };

  const handleRemoveFromCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    removerDelCarrito(libro.id);
  };

  const handleDownload = async (formato: 'pdf' | 'epub', e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
  setDownloading(formato);
  try {
    await descargarArchivo(
      formato === 'pdf' ? libro.ruta_pdf : libro.ruta_epub,
      formato,
      libro.titulo,
      libro.id
    );
  } finally {
    setDownloading(null);
  }
};

  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 overflow-hidden w-56 h-96 flex-shrink-0">
      
      <Link href={`/libros/${libro.id}`} className="block h-full">
        {/* Imagen con altura fija */}
        <div className="relative h-56 bg-gray-100 overflow-hidden">
          <Image
            src={libro.portada_url}
            alt={`Portada de ${libro.titulo}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="224px"
          />
          
          <div className="absolute top-2 left-2">
            <span className="bg-black/85 text-white px-2 py-1 rounded-md text-xs font-medium">
              {libro.genero}
            </span>
          </div>

          {estaEnElCarrito && (
            <div className="absolute top-2 right-2">
              <div className="bg-green-500 text-white p-1 rounded-full">
                <span className="text-xs">✅</span>
              </div>
            </div>
          )}
        </div>

        {/* Contenido con altura restante fija */}
        <div className="p-4 h-40 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors mb-1">
              {libro.titulo}
            </h3>
            
            <p className="text-xs text-gray-600 line-clamp-1 mb-2">
              {libro.autor}
            </p>
          </div>

          {/* Precio y botón de carrito */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-base font-bold text-green-600">
              ${libro.precio.toFixed(2)}
            </span>
            
            <div className="flex gap-1">
              {estaEnElCarrito ? (
                <button
                  onClick={handleRemoveFromCart}
                  className="w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs flex items-center justify-center transition-colors"
                  title="Quitar del carrito"
                >
                  🗑️
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="w-7 h-7 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs flex items-center justify-center transition-colors"
                >
                  +
                </button>
              )}
            </div>
          </div>

          {/* Botones de descarga */}
          <div className="flex gap-2 border-t pt-2">
            <button
              onClick={(e) => handleDownload('pdf', e)}
              disabled={downloading === 'pdf'}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-1.5 px-2 rounded text-xs flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
            >
              {downloading === 'pdf' ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>📘</span>
              )}
              PDF
            </button>
            
            <button
              onClick={(e) => handleDownload('epub', e)}
              disabled={downloading === 'epub'}
              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-1.5 px-2 rounded text-xs flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
            >
              {downloading === 'epub' ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>📙</span>
              )}
              EPUB
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}