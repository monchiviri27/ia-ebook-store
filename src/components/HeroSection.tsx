// src/app/components/HeroSection.tsx
import Link from 'next/link';

export default function HeroSection() {
  return (
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
  );
}