// src/app/libros/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Libro } from '@/context/CarritoContext';
import { useCarritoConNotificaciones } from '@/hooks/useCarritoConNotificaciones';
import { useDownload } from '@/hooks/useDownload';
import { useToast } from '@/context/ToastContext';

export default function LibroDetailPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [libro, setLibro] = useState<Libro | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState<'pdf' | 'epub' | null>(null);
  
  const { agregarAlCarrito, estaEnCarrito } = useCarritoConNotificaciones();
  const { descargarArchivo } = useDownload();
  const { addToast } = useToast();

  useEffect(() => {
    const cargarLibro = async () => {
      try {
        const { data, error } = await supabase
          .from('libros')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          setError('Libro no encontrado');
          return;
        }

        setLibro(data as Libro);
      } catch (err) {
        setError('Error al cargar el libro');
      } finally {
        setLoading(false);
      }
    };

    cargarLibro();
  }, [id]);

  const handleDownload = async (formato: 'pdf' | 'epub') => {
  if (!libro) return;
  
  setDownloading(formato);
  try {
    await descargarArchivo(
      formato === 'pdf' ? libro.ruta_pdf : libro.ruta_epub,
      formato,
      libro.titulo,
      libro.portada_url, // ← Nuevo parámetro
      libro.autor        // ← Nuevo parámetro
    );
  } finally {
    setDownloading(null);
  }
};

  const handleAddToCart = () => {
    if (!libro) return;
    agregarAlCarrito(libro);
    addToast(`"${libro.titulo}" agregado al carrito`, 'success');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando libro...</p>
        </div>
      </div>
    );
  }

  if (error || !libro) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Libro no encontrado</h2>
          <p className="text-gray-600 mb-6">{error || 'El libro que buscas no existe.'}</p>
          <Link 
            href="/" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium inline-block"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 transition-colors">
            Inicio
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-600">{libro.titulo}</span>
        </nav>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            
            {/* Columna izquierda - Imagen */}
            <div className="flex flex-col items-center">
              <div className="relative w-full max-w-sm aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden shadow-lg">
                <Image
                  src={libro.portada_url}
                  alt={`Portada de ${libro.titulo}`}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Acciones rápidas */}
              <div className="flex gap-4 mt-6 w-full max-w-sm">
                <button
                  onClick={handleAddToCart}
                  disabled={estaEnCarrito(libro.id)}
                  className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                    estaEnCarrito(libro.id)
                      ? 'bg-gray-600 text-white cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  {estaEnCarrito(libro.id) ? '✅ En Carrito' : '🛒 Agregar al Carrito'}
                </button>
              </div>

              {/* Descargas */}
              <div className="flex gap-3 mt-4 w-full max-w-sm">
                <button
                  onClick={() => handleDownload('pdf')}
                  disabled={downloading === 'pdf'}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {downloading === 'pdf' ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>📘</span>
                  )}
                  PDF
                </button>
                
                <button
                  onClick={() => handleDownload('epub')}
                  disabled={downloading === 'epub'}
                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {downloading === 'epub' ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>📙</span>
                  )}
                  EPUB
                </button>
              </div>
            </div>

            {/* Columna derecha - Información */}
            <div className="flex flex-col">
              {/* Badge y título */}
              <div className="mb-4">
                <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-3">
                  {libro.genero}
                </span>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  {libro.titulo}
                </h1>
                <p className="text-xl text-gray-600 mb-4">Por: {libro.autor}</p>
              </div>

              {/* Precio */}
              <div className="mb-6">
                <span className="text-4xl font-bold text-green-600">
                  ${libro.precio.toFixed(2)}
                </span>
                <span className="text-gray-500 block mt-1">eBook - Descarga inmediata</span>
              </div>

              {/* Descripción completa */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Descripción</h2>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {libro.descripcion}
                </p>
              </div>

              {/* Características */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📦 Lo que obtienes</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="text-green-500">✓</span>
                    Descarga inmediata
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="text-green-500">✓</span>
                    Formato PDF + EPUB
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="text-green-500">✓</span>
                    Acceso ilimitado
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="text-green-500">✓</span>
                    Compatible con todos los dispositivos
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Libros relacionados (opcional) */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Libros que también te pueden gustar</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Aquí podrías agregar libros del mismo género */}
            <div className="text-center text-gray-500 py-8">
              Próximamente: Libros relacionados
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}