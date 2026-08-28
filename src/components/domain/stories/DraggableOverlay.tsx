"use client";
import React, { useRef, useEffect, useState } from 'react';
import { StoryOverlay } from '@/types/stories';

interface DraggableOverlayProps {
  overlay: StoryOverlay;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (overlay: StoryOverlay) => void;
  onDelete: () => void;
  onMoveLayer: (direction: number) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
}

export function DraggableOverlay({ overlay, isSelected, onSelect, onUpdate, onDelete, onMoveLayer, containerRef, children }: DraggableOverlayProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const handlePointerDown = (e: PointerEvent) => {
      e.stopPropagation();
      onSelect();
      isDragging.current = true;
      el.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      // Calculate delta as percentage of container
      const dx = e.movementX / rect.width;
      const dy = e.movementY / rect.height;
      
      onUpdate({
        ...overlay,
        x: Math.max(0, Math.min(1, overlay.x + dx)),
        y: Math.max(0, Math.min(1, overlay.y + dy))
      });
    };

    const handlePointerUp = (e: PointerEvent) => {
      isDragging.current = false;
      el.releasePointerCapture(e.pointerId);
    };

    el.addEventListener('pointerdown', handlePointerDown);
    el.addEventListener('pointermove', handlePointerMove);
    el.addEventListener('pointerup', handlePointerUp);
    el.addEventListener('pointercancel', handlePointerUp);

    return () => {
      el.removeEventListener('pointerdown', handlePointerDown);
      el.removeEventListener('pointermove', handlePointerMove);
      el.removeEventListener('pointerup', handlePointerUp);
      el.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [overlay, onUpdate, onSelect, containerRef]);
  
  return (
    <div
      ref={elementRef}
      style={{
        position: 'absolute',
        left: `${overlay.x * 100}%`,
        top: `${overlay.y * 100}%`,
        transform: `translate(-50%, -50%) scale(${overlay.scale}) rotate(${overlay.rotation}deg)`,
        zIndex: overlay.zIndex,
        touchAction: 'none' // Prevent scrolling while dragging
      }}
      className={`cursor-grab active:cursor-grabbing ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}`}
    >
      <div style={{ pointerEvents: 'none' }}>
        {children}
      </div>
      
      {isSelected && (
        <div 
          className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/90 backdrop-blur rounded-lg p-1"
          onPointerDown={e => e.stopPropagation()} // Prevent drag when clicking controls
        >
          <button onClick={() => onUpdate({...overlay, scale: overlay.scale + 0.1})} className="w-8 h-8 text-white font-bold">+</button>
          <button onClick={() => onUpdate({...overlay, scale: Math.max(0.2, overlay.scale - 0.1)})} className="w-8 h-8 text-white font-bold">-</button>
          <button onClick={() => onUpdate({...overlay, rotation: (overlay.rotation + 15) % 360})} className="w-8 h-8 text-white font-bold">↻</button>
          <button onClick={() => onMoveLayer(1)} className="w-8 h-8 text-white font-bold">↑</button>
          <button onClick={() => onMoveLayer(-1)} className="w-8 h-8 text-white font-bold">↓</button>
          <button onClick={() => onDelete()} className="w-8 h-8 text-red-500 font-bold">✕</button>
        </div>
      )}
    </div>
  );
}
