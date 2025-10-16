// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';
import { useCarritoConNotificaciones } from '@/hooks/useCarritoConNotificaciones';
import { useToast } from '@/context/ToastContext';

interface Libro {
  id: string;
  titulo: string;
  autor: string;
  descripcion: string;
  precio: number;
  genero: string;
  portada_url: string;
  ruta_pdf: string;
  ruta_epub: string;
}

// Función de descarga mejorada
const descargarArchivo = async (rutaArchivo: string, formato: string, titulo: string, addToast: any) => {
  try {
    const nombreArchivo = titulo.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    // Forzar descarga en lugar de abrir
    const response = await fetch(rutaArchivo);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${nombreArchivo}.${formato}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    addToast(`"${titulo}" descargado en formato ${formato.toUpperCase()} ✅`, 'success');
    
  } catch (error) {
    console.error('Error al descargar:', error);
    addToast(`Error al descargar "${titulo}"`, 'error');
    window.open(rutaArchivo, '_blank');
  }
};

export default function HomePage() {
  const [libros, setLibros] = useState<Libro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { agregarAlCarrito, estaEnCarrito } = useCarritoConNotificaciones();
  const { addToast } = useToast();

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando catálogo de libros...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-4">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error al cargar libros</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Descubre Libros Extraordinarios
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Generados con IA, diseñados para inspirar
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/catalogo" 
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Explorar Catálogo
            </Link>
            <Link 
              href="/admin" 
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Panel Admin
            </Link>
          </div>
        </div>
      </section>

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

          {libros.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-500">No hay libros disponibles en este momento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {libros.map((libro) => (
                <div 
                  key={libro.id} 
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
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
                          onClick={() => descargarArchivo(libro.ruta_pdf, 'pdf', libro.titulo, addToast)}
                          title="Descargar PDF"
                        >
                          <span>📘</span>
                          <span className="hidden sm:inline">PDF</span>
                        </button>
                        <button 
                          className="flex-1 bg-purple-600 text-white py-2 px-2 rounded-lg hover:bg-purple-700 transition-colors text-xs flex items-center justify-center gap-1"
                          onClick={() => descargarArchivo(libro.ruta_epub, 'epub', libro.titulo, addToast)}
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
              ))}
            </div>
          )}

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
