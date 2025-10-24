// src/components/BookCard.tsx - VERSIÓN CORREGIDA
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Libro } from '@/context/CarritoContext';
import { useCarritoConNotificaciones } from '@/hooks/useCarritoConNotificaciones';
import { useDownload } from '@/hooks/useDownload';
import { useState } from 'react';

interface BookCardProps {
  libro: Libro;
}

export default function BookCard({ libro }: BookCardProps) {
  const { agregarAlCarrito, removerDelCarrito, estaEnCarrito } = useCarritoConNotificaciones();
  const { descargarArchivo } = useDownload();
  const [imageLoading, setImageLoading] = useState(true);
  const [downloading, setDownloading] = useState<'pdf' | 'epub' | null>(null);

  // Rating aleatorio para demo
  const rating = Math.random() * 2 + 3;
  const reviews = Math.floor(Math.random() * 100) + 20;

  const handleDownload = async (formato: 'pdf' | 'epub') => {
    setDownloading(formato);
    try {
      await descargarArchivo(
        formato === 'pdf' ? libro.ruta_pdf : libro.ruta_epub,
        formato,
        libro.titulo,
        libro.id // ← PARÁMETRO AÑADIDO
      );
    } finally {
      setDownloading(null);
    }
  };

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

  const estaEnElCarrito = estaEnCarrito(libro.id);

  return (
    <div className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden h-full flex flex-col">
      
      {/* Imagen con enlace a página individual */}
      <Link href={`/libros/${libro.id}`} className="block flex-shrink-0 relative">
        <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
          <Image
            src={libro.portada_url}
            alt={`Portada de ${libro.titulo}`}
            fill
            className={`object-cover transition-transform duration-300 group-hover:scale-102 ${
              imageLoading ? 'blur-sm' : 'blur-0'
            }`}
            onLoad={() => setImageLoading(false)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Loading skeleton */}
          {imageLoading && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
          
          {/* Badge de género */}
          <div className="absolute top-2 left-2">
            <span className="bg-black/85 text-white px-2 py-1 rounded-md text-xs font-medium">
              {libro.genero}
            </span>
          </div>

          {/* Indicador de "En carrito" */}
          {estaEnElCarrito && (
            <div className="absolute top-2 right-2">
              <span className="bg-green-500 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                <span>✅</span>
                <span className="hidden sm:inline">En carrito</span>
              </span>
            </div>
          )}

          {/* Efecto hover sutil */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300" />
        </div>
      </Link>

      {/* Contenido - Más compacto */}
      <div className="p-4 flex-1 flex flex-col">
        
        {/* Título con enlace a página individual */}
        <Link href={`/libros/${libro.id}`} className="group/title block mb-2">
          <h3 className="font-bold text-gray-900 line-clamp-2 text-sm leading-tight group-hover/title:text-blue-600 transition-colors">
            {libro.titulo}
          </h3>
        </Link>
        
        {/* Autor */}
        <p className="text-xs text-gray-600 mb-2 line-clamp-1">
          Por: {libro.autor}
        </p>

        {/* Rating compacto */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={`w-3 h-3 ${
                  star <= Math.floor(rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-1">
            {rating.toFixed(1)} ({reviews})
          </span>
        </div>

        {/* Descripción más corta */}
        <p className="text-gray-700 text-xs mb-3 line-clamp-2 leading-relaxed flex-1">
          {libro.descripcion}
        </p>

        {/* Precio y botones de acción - Más compacto */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-lg font-bold text-green-600">
              ${libro.precio.toFixed(2)}
            </span>
          </div>
          
          <div className="flex gap-1">
            {/* Botón de eliminar (solo visible si está en carrito) */}
            {estaEnElCarrito && (
              <button
                onClick={handleRemoveFromCart}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg font-medium transition-all duration-200 text-sm bg-red-500 hover:bg-red-600 text-white"
                title="Quitar del carrito"
              >
                <span>🗑️</span>
                <span className="hidden sm:inline">Quitar</span>
              </button>
            )}
            
            {/* Botón de agregar (solo visible si NO está en carrito) */}
            {!estaEnElCarrito && (
              <button
                onClick={handleAddToCart}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition-all duration-200 text-sm bg-blue-600 hover:bg-blue-700 text-white"
              >
                <span>+</span>
                <span className="hidden sm:inline">Agregar</span>
              </button>
            )}
          </div>
        </div>

        {/* Botones de descarga compactos */}
        <div className="flex gap-2 border-t pt-3">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDownload('pdf');
            }}
            disabled={downloading === 'pdf'}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 text-xs"
          >
            {downloading === 'pdf' ? (
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>📘</span>
            )}
            <span className="hidden xs:inline">PDF</span>
          </button>
          
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDownload('epub');
            }}
            disabled={downloading === 'epub'}
            className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 px-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 text-xs"
          >
            {downloading === 'epub' ? (
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>📙</span>
            )}
            <span className="hidden xs:inline">EPUB</span>
          </button>
        </div>

        {/* Enlace "Ver detalles" */}
        <Link 
          href={`/libros/${libro.id}`}
          className="block text-center text-blue-600 hover:text-blue-800 text-xs font-medium mt-2 pt-2 border-t border-gray-100"
        >
          Ver detalles completos →
        </Link>
      </div>
    </div>
  );
}