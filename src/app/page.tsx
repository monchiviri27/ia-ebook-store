// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

// ✅ FUNCIÓN DE DESCARGA - Pégala aquí
const descargarArchivo = async (rutaArchivo: string, formato: string, titulo: string) => {
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
    
  } catch (error) {
    console.error('Error al descargar:', error);
    // Fallback: abrir en nueva pestaña
    window.open(rutaArchivo, '_blank');
  }
};

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

export default function HomePage() {
  const [libros, setLibros] = useState<Libro[]>([]);

  useEffect(() => {
    const cargarLibros = async () => {
      const { data, error } = await supabase
        .from('libros')
        .select('*')
        .order('titulo');
      
      if (error) {
        console.error('Error cargando libros:', error);
        return;
      }
      setLibros(data as Libro[]);
    };

    cargarLibros();
  }, []);

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-10 text-gray-800">
          Librería Digital IA
        </h1>
        
        
<div className="text-center mb-8">
  <a 
    href="/admin" 
    className="inline-block bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
  >
    🛠️ Panel de Administración
  </a>
</div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {libros.map((libro) => (
            <div key={libro.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="relative h-64 w-full">
                <Image
                  src={libro.portada_url}
                  alt={`Portada de ${libro.titulo}`}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="w-full"
                />
              </div>

              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {libro.titulo}
                </h2>
                <p className="text-sm text-gray-600 mb-2">
                  Por: {libro.autor}
                </p>
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2">
                  {libro.genero}
                </span>
                <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                  {libro.descripcion}
                </p>
                
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-green-600">
                    ${libro.precio.toFixed(2)}
                  </span>
                </div>

                {/* Botones de descarga - USA LA FUNCIÓN AQUÍ */}
                <div className="flex gap-2">
                  <button 
                    className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center gap-1"
                    onClick={() => descargarArchivo(libro.ruta_pdf, 'pdf', libro.titulo)}
                  >
                    <span>📘</span> PDF
                  </button>
                  <button 
                    className="flex-1 bg-purple-600 text-white py-2 px-3 rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center justify-center gap-1"
                    onClick={() => descargarArchivo(libro.ruta_epub, 'epub', libro.titulo)}
                  >
                    <span>📙</span> EPUB
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
