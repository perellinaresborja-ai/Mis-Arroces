import { useEffect, useCallback, useRef } from 'react';

/**
 * Hook para interceptar la navegaciÃ³n "atrÃ¡s" en modales de pantalla completa.
 * @param isOpen Si el modal estÃ¡ abierto
 * @param onClose Callback para cerrar el estado en React
 * @param modalId Identificador Ãºnico del modal
 * @returns FunciÃ³n `closeModal` segura que se debe usar en los botones "Cerrar" o "Cancelar"
 */
export function useModalHistory(isOpen: boolean, onClose: () => void, modalId: string) {
  const isPopping = useRef(false);
  const onCloseRef = useRef(onClose);

  // Keep ref updated without triggering re-renders
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      isPopping.current = false;
      window.history.pushState({ modal: modalId }, '');

      const handlePopState = (e: PopStateEvent) => {
        isPopping.current = true;
        onCloseRef.current();
      };

      window.addEventListener('popstate', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isOpen, modalId]);

  const closeModal = useCallback(() => {
    // 1. Forzamos el cierre de React inmediatamente para asegurar que la UI reaccione.
    onCloseRef.current();

    // 2. Limpiamos el historial de forma segura y diferida (300ms) para que Next.js
    // no bloquee el hilo principal con su reconciliación de rutas antes de que 
    // React desmonte visualmente el componente.
    setTimeout(() => {
      try {
        if (window.history.state && window.history.state.modal === modalId) {
          // Unflag before back so we don't double-trigger
          isPopping.current = true;
          window.history.back();
        }
      } catch (e) {
        // Ignorar errores de acceso al historial
      }
    }, 300);
  }, [modalId]);

  return closeModal;
}
