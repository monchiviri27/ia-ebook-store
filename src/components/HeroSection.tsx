// src/components/HeroSection.tsx - CON IMAGEN REAL
import Link from 'next/link';
import Image from 'next/image';

export default function HeroSection() {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Imagen de fondo que ocupa toda la hero section */}
      <div className="absolute inset-0 z-0">
        {/* IMAGEN REAL - reemplaza la ruta con tu imagen */}
        <Image
          src="/hero-section-ia-book-store.jpg" // ← Cambia por tu imagen
          alt="Portadas de libros digitales"
          fill
          className="object-cover"
          priority
        />
        
        {/* Overlay para mejor legibilidad del texto */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Contenido superpuesto */}
      <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm mb-6">
          <span>🎉</span>
          <span>Nuevos lanzamientos semanales</span>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
          Descubre Tu 
          <span className="block bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
            Siguiente Libro Favorito
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl mb-8 leading-relaxed opacity-95 max-w-2xl mx-auto">
          Explora miles de libros digitales únicos. 
          <span className="block font-semibold text-white mt-2">
            Encuentra exactamente lo que buscas.
          </span>
        </p>

        {/* Botones superpuestos */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/catalogo" 
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg text-lg"
          >
            Explorar Catálogo
          </Link>
          <Link 
            href="/novedades" 
            className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 text-lg backdrop-blur-sm"
          >
            Ver Novedades
          </Link>
        </div>

        {/* Elemento decorativo sutil */}
        <div className="mt-12 animate-bounce">
          <span className="text-2xl">📖</span>
        </div>
      </div>
    </section>
  );
}