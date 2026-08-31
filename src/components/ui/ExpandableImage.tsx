"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

interface ExpandableImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function ExpandableImage({ src, alt, className }: ExpandableImageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle escape key and scrolling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Prevent scrolling
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      <img 
        src={src} 
        alt={alt} 
        className={`${className || ''} cursor-pointer hover:opacity-90 transition-opacity`} 
        onClick={() => setIsOpen(true)} 
      />
      
      {mounted && isOpen && createPortal(
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div className="relative inline-flex animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <img 
              src={src} 
              alt={alt} 
              className="max-w-[95vw] max-h-[90vh] object-contain rounded-xl shadow-2xl" 
            />
            <button 
              className="absolute top-2 right-2 md:top-3 md:right-3 p-1.5 md:p-2 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm transition-colors border border-white/10 shadow-sm"
              onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
              title="Cerrar (Esc)"
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
