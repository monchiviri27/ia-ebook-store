// src/components/ChatbotWidget.tsx - VERSIÓN MOBILE OPTIMIZED
'use client';

import { useState } from 'react';

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Botón flotante - más pequeño en móvil */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 z-50 flex items-center justify-center w-16 h-16 md:w-16 md:h-16 chatbot-button"
        aria-label="Abrir chatbot"
      >
        <span className="text-base md:text-lg">🤖</span>
      </button>

      {/* Ventana del chatbot - responsive */}
      {isOpen && (
        <div className="fixed inset-0 md:inset-auto md:bottom-24 md:right-6 md:w-[420px] md:h-[550px] w-full h-full bg-white md:rounded-lg shadow-xl border border-gray-200 z-50 flex flex-col animate-fade-in-up">
          
          {/* Header */}
          <div className="bg-blue-600 text-white p-3 md:rounded-t-lg flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-lg">🤖</span>
              <h3 className="font-semibold">Asistente de Libros</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 text-lg transition-colors p-1 rounded-full hover:bg-blue-700"
              aria-label="Cerrar chatbot"
            >
              ✕
            </button>
          </div>

          {/* Iframe - ocupa toda la pantalla en móvil */}
          <div className="flex-1 chatbot-iframe-container">
            <iframe
              src="https://guia-literario-chatbot.vercel.app/"
              className="w-full h-full border-0 md:rounded-b-lg"
              title="Chatbot Asistente de Libros"
              loading="lazy"
              allow="microphone"
            />
          </div>
        </div>
      )}

      {/* Overlay para móvil */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/10 md:bg-transparent"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}