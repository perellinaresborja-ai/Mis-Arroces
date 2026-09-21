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

  useEffect(() => {
    if (isOpen) {
      isPopping.current = false;
      window.history.pushState({ modal: modalId }, '');

      const handlePopState = (e: PopStateEvent) => {
        isPopping.current = true;
        onClose();
      };

      window.addEventListener('popstate', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
        // Si se desmonta por cualquier razÃ³n distinta a un popstate (ej. el padre cambia condicionalmente),
        // y todavÃ­a estamos en el estado del modal, debemos limpiar la historia para no dejar un estado "fantasma".
        if (!isPopping.current && window.history.state?.modal === modalId) {
          window.history.back();
        }
      };
    }
  }, [isOpen, onClose, modalId]);

  const closeModal = useCallback(() => {
    // Si cerramos manualmente mediante un botÃ³n en pantalla
    if (window.history.state?.modal === modalId) {
      window.history.back(); // Esto dispararÃ¡ popstate y llamarÃ¡ a onClose
    } else {
      onClose();
    }
  }, [modalId, onClose]);

  return closeModal;
}
