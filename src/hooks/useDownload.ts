// hooks/useDownload.ts - CON NUEVAS NOTIFICACIONES
import { useToast } from '@/context/ToastContext';

export const useDownload = () => {
  const { addToast } = useToast();

  const descargarArchivo = async (
    rutaArchivo: string, 
    formato: 'pdf' | 'epub', 
    titulo: string,
    portadaUrl?: string,
    autor?: string
  ) => {
    try {
      const nombreArchivo = titulo.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      
      // Notificación de inicio
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
      
      // Notificación de éxito
      addToast({
        type: 'success',
        title: '✅ Descarga completada',
        message: `"${titulo}" en formato ${formato.toUpperCase()}`,
        duration: 4000,
      });
      
    } catch (error) {
      console.error('Error al descargar:', error);
      
      // Notificación de error
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