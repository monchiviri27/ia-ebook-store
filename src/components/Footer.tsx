// src/components/Footer.tsx
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="font-bold text-white">📚</span>
              </div>
              <span className="text-xl font-bold">IA eBookStore</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Tu tienda de libros digitales de última generación. Descubre obras únicas creadas con inteligencia artificial.
            </p>
            <div className="flex space-x-4">
              <span className="text-gray-400">🐦</span>
              <span className="text-gray-400">📘</span>
              <span className="text-gray-400">📷</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/catalogo" className="text-gray-400 hover:text-white transition-colors">
                  Catálogo
                </Link>
              </li>
              <li>
                <Link href="/novedades" className="text-gray-400 hover:text-white transition-colors">
                  Novedades
                </Link>
              </li>
              <li>
                <Link href="/ofertas" className="text-gray-400 hover:text-white transition-colors">
                  Ofertas
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Soporte</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/contacto" className="text-gray-400 hover:text-white transition-colors">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-white transition-colors">
                  Preguntas Frecuentes
                </Link>
              </li>
              <li>
                <Link href="/terminos" className="text-gray-400 hover:text-white transition-colors">
                  Términos de Servicio
                </Link>
              </li>
              <li>
                <Link href="/privacidad" className="text-gray-400 hover:text-white transition-colors">
                  Política de Privacidad
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-t border-gray-700">
          <div className="text-center">
            <div className="text-2xl mb-2">🚚</div>
            <p className="text-sm font-medium">Descarga Inmediata</p>
            <p className="text-xs text-gray-400">Acceso instantáneo</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">🔒</div>
            <p className="text-sm font-medium">Pago Seguro</p>
            <p className="text-xs text-gray-400">Con Stripe</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">📱</div>
            <p className="text-sm font-medium">Multi-formato</p>
            <p className="text-xs text-gray-400">PDF & EPUB</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">🤖</div>
            <p className="text-sm font-medium">IA Avanzada</p>
            <p className="text-xs text-gray-400">Contenido único</p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <p className="text-gray-400">
              © 2025 <span className="text-white font-semibold">IA eBookStore</span>. Todos los derechos reservados.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
            <span>📧 soporte@iaebookstore.com</span>
            <span>🌍 Hecho con Next.js & Supabase</span>
          </div>
        </div>
      </div>
    </footer>
  );
}