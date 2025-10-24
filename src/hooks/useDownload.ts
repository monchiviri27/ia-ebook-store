// hooks/useDownload.ts - VERSIÓN CORREGIDA
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';

export const useDownload = () => {
  const { addToast } = useToast();

  const verificarPropiedadLibro = async (libroId: string): Promise<boolean> => {
    try {
      // En un sistema real, verificarías en la tabla 'descargas' o 'ordenes'
      // Por ahora, simulamos que TODOS pueden descargar (cambiar luego)
      console.log('🔍 Verificando propiedad del libro:', libroId);
      return true; // Temporal - cambiar a false para restringir
    } catch (error) {
      console.error('Error verificando propiedad:', error);
      return false;
    }
  };

  const descargarArchivo = async (
    rutaArchivo: string, 
    formato: 'pdf' | 'epub', 
    titulo: string,
    libroId: string // ← Solo este parámetro es necesario ahora
  ) => {
    try {
      // ✅ VERIFICAR SI EL USUARIO PUEDE DESCARGAR
      const puedeDescargar = await verificarPropiedadLibro(libroId);
      
      if (!puedeDescargar) {
        addToast({
          type: 'warning',
          title: '🔒 Descarga no disponible',
          message: 'Necesitas comprar este libro para descargarlo',
          duration: 5000,
        });
        return;
      }

      const nombreArchivo = titulo.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      
      addToast({
        type: 'info',
        title: 'Iniciando descarga...',
        message: `Preparando "${titulo}"`,
        duration: 2000,
      });

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
      
      addToast({
        type: 'success',
        title: '✅ Descarga completada',
        message: `"${titulo}" en formato ${formato.toUpperCase()}`,
        duration: 4000,
      });
      
    } catch (error) {
      console.error('Error al descargar:', error);
      
      addToast({
        type: 'error',
        title: '❌ Error en descarga',
        message: `No se pudo descargar "${titulo}"`,
        duration: 5000,
      });
      
      window.open(rutaArchivo, '_blank');
    }
  };

  return { descargarArchivo };
};