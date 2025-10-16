// src/context/ToastContext.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToastContextType {
  addToast: (message: string, type?: Toast['type'], duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: Toast['type'] = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto-remover después de la duración
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration);
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      
      {/* Container de Toasts - POSICIÓN MEJORADA */}
    <div className="fixed bottom-4 left-4 z-50 space-y-2 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-lg shadow-lg border-l-4 animate-toastIn ${
              toast.type === 'success' 
                ? 'bg-green-50 border-green-500 text-green-800' 
                : toast.type === 'error'
                ? 'bg-red-50 border-red-500 text-red-800'
                : toast.type === 'warning'
                ? 'bg-yellow-50 border-yellow-500 text-yellow-800'
                : 'bg-blue-50 border-blue-500 text-blue-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-lg flex-shrink-0">
                  {toast.type === 'success' ? '✅' :
                   toast.type === 'error' ? '❌' :
                   toast.type === 'warning' ? '⚠️' : 'ℹ️'}
                </span>
                <span className="font-medium text-sm">{toast.message}</span>
              </div>
              <button
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-2 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes toastIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-toastIn {
          animation: toastIn 0.3s ease-out;
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast debe ser usado dentro de un ToastProvider');
  }
  return context;
}