// src/hooks/useDownload.ts - VERSIÓN CORREGIDA
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
      
      // Mensaje mejorado con información útil
      addToast(
        `"${titulo}" descargado en formato ${formato.toUpperCase()} ✅\nÁbrelo con Adobe Acrobat o Calibre para mejor experiencia.`,
        'success'
      );
      
    } catch (error) {
      console.error('Error al descargar:', error);
      addToast(`Error al descargar "${titulo}"`, 'error');
      window.open(rutaArchivo, '_blank');
    }
  };

  return { descargarArchivo };
};