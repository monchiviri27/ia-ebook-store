// src/components/Header.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo que lleva al inicio */}
          <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
            📚 eBookStore
          </Link>
          
          {/* Navegación */}
          <nav className="flex gap-6">
            <Link 
              href="/" 
              className={`${
                pathname === '/' ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'
              } transition-colors`}
            >
              Inicio
            </Link>
            
            <Link 
              href="/admin" 
              className={`${
                pathname === '/admin' ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'
              } transition-colors`}
            >
              Administración
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}