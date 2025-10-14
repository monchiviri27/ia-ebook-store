'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface FormData {
  titulo: string;
  autor: string;
  descripcion: string;
  precio: string;
  genero: string;
  portada_url: string;
  ruta_pdf: string;
  ruta_epub: string;
}

export default function AdminPage() {
  const [formData, setFormData] = useState<FormData>({
    titulo: '',
    autor: '',
    descripcion: '',
    precio: '',
    genero: '',
    portada_url: '',
    ruta_pdf: '',
    ruta_epub: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Validar que el precio sea un número válido
      const precioNumero = parseFloat(formData.precio);
      if (isNaN(precioNumero) || precioNumero < 0) {
        setMessage('❌ El precio debe ser un número válido mayor o igual a 0');
        setLoading(false);
        return;
      }

      // Preparar los datos para insertar
      const libroData = {
        titulo: formData.titulo.trim(),
        autor: formData.autor.trim(),
        descripcion: formData.descripcion.trim(),
        precio: precioNumero,
        genero: formData.genero,
        portada_url: formData.portada_url.trim(),
        ruta_pdf: formData.ruta_pdf.trim(),
        ruta_epub: formData.ruta_epub.trim(),
      };

      // Verificar que todos los campos requeridos estén llenos
      const camposRequeridos = ['titulo', 'autor', 'descripcion', 'genero', 'portada_url', 'ruta_pdf', 'ruta_epub'];
      const camposVacios = camposRequeridos.filter(campo => !libroData[campo as keyof typeof libroData]);
      
      if (camposVacios.length > 0) {
        setMessage(`❌ Faltan campos requeridos: ${camposVacios.join(', ')}`);
        setLoading(false);
        return;
      }

      console.log('Enviando datos:', libroData);

      // Insertar en Supabase
      const { data, error } = await supabase
        .from('libros')
        .insert([libroData])
        .select();

      if (error) {
        console.error('Error de Supabase:', error);
        setMessage(`❌ Error al agregar el libro: ${error.message}`);
        return;
      }

      console.log('Libro agregado:', data);
      setMessage('✅ Libro agregado exitosamente!');
      
      // Limpiar formulario
      setFormData({
        titulo: '',
        autor: '',
        descripcion: '',
        precio: '',
        genero: '',
        portada_url: '',
        ruta_pdf: '',
        ruta_epub: '',
      });

    } catch (error: any) {
      console.error('Error general:', error);
      setMessage(`❌ Error al agregar el libro: ${error.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const generos = [
    'Fantasía', 'Ciencia Ficción', 'Romance', 'Thriller', 
    'Misterio', 'Desarrollo Personal', 'Negocios', 'Tecnología',
    'Historia', 'Biografía', 'Infantil', 'Juvenil', 'Autoayuda'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Panel de Administración
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          {message && (
            <div className={`p-4 rounded-lg mb-6 ${
              message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título del Libro *
              </label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: El Secreto del Bosque Encantado"
              />
            </div>

            {/* Autor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Autor *
              </label>
              <input
                type="text"
                name="autor"
                value={formData.autor}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: María González"
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe el libro..."
              />
            </div>

            {/* Precio y Género */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio (USD) *
                </label>
                <input
                  type="number"
                  name="precio"
                  value={formData.precio}
                  onChange={handleChange}
                  required
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="9.99"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Género *
                </label>
                <select
                  name="genero"
                  value={formData.genero}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar género</option>
                  {generos.map(genero => (
                    <option key={genero} value={genero}>{genero}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* URLs */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL de la Portada *
                </label>
                <input
                  type="url"
                  name="portada_url"
                  value={formData.portada_url}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://klgagrgeyixfmovgzhst.supabase.co/storage/v1/object/public/portadas/libro.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL del PDF *
                </label>
                <input
                  type="url"
                  name="ruta_pdf"
                  value={formData.ruta_pdf}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://klgagrgeyixfmovgzhst.supabase.co/storage/v1/object/public/ebooks/libro.pdf"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL del EPUB *
                </label>
                <input
                  type="url"
                  name="ruta_epub"
                  value={formData.ruta_epub}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://klgagrgeyixfmovgzhst.supabase.co/storage/v1/object/public/ebooks/libro.epub"
                />
              </div>
            </div>

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? 'Agregando Libro...' : '📚 Agregar Libro a la Tienda'}
            </button>
          </form>
        </div>

        {/* Instrucciones */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">
            📋 Instrucciones para agregar libros:
          </h3>
          <ul className="text-blue-700 space-y-2 text-sm">
            <li>• <strong>Sube los archivos a Supabase Storage</strong> primero</li>
            <li>• <strong>Portadas:</strong> Bucket "portadas" (formatos: JPG, PNG, WebP)</li>
            <li>• <strong>Libros:</strong> Bucket "ebooks" (formatos: PDF, EPUB)</li>
            <li>• <strong>Copia las URLs públicas</strong> y pégalas en el formulario</li>
            <li>• <strong>Ejemplo de URL:</strong> https://klgagrgeyixfmovgzhst.supabase.co/storage/v1/object/public/ebooks/mi-libro.pdf</li>
          </ul>
        </div>
      </div>
    </div>
  );
}