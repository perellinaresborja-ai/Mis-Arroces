"use client";
import React, { useRef, useEffect, useState } from 'react';
import { useGesture } from '@use-gesture/react';
import { StoryOverlay } from '@/types/stories';

interface DraggableOverlayProps {
  overlay: StoryOverlay;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (overlay: StoryOverlay) => void;
  onDelete: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
  onDragStateChange?: (isDragging: boolean) => void;
}

export function DraggableOverlay({ 
  overlay, 
  isSelected, 
  onSelect, 
  onUpdate, 
  onDelete,
  onDragStateChange,
  containerRef, 
  children 
}: DraggableOverlayProps) {
  
  const elementRef = useRef<HTMLDivElement>(null);
  const [local, setLocal] = useState({ x: overlay.x, y: overlay.y, scale: overlay.scale, rotation: overlay.rotation });

  // Sync from props if updated externally
  useEffect(() => {
    setLocal({ x: overlay.x, y: overlay.y, scale: overlay.scale, rotation: overlay.rotation });
  }, [overlay.x, overlay.y, overlay.scale, overlay.rotation]);

  const bind = useGesture({
    onDragStart: ({ event }) => {
      // event.stopPropagation();
      onSelect();
      onDragStateChange?.(true);
    },
    onDrag: ({ movement: [mx, my], event, memo }) => {
      event?.stopPropagation(); // Prevent background from dragging
      if (!containerRef.current) return memo;
      
      if (!memo) {
        memo = { startX: local.x, startY: local.y };
      }
      
      const rect = containerRef.current.getBoundingClientRect();
      const nextX = memo.startX + mx / rect.width;
      const nextY = memo.startY + my / rect.height;
      
      setLocal(prev => ({ ...prev, x: nextX, y: nextY }));
      return memo;
    },
    onDragEnd: ({ event, xy: [clientX, clientY] }) => {
      onDragStateChange?.(false);
      
      // Hit test for trash zone
      const droppedOn = document.elementFromPoint(clientX, clientY);
      if (droppedOn?.closest('#story-trash')) {
        onDelete();
        return;
      }
      
      // Flush to parent
      setLocal(current => {
        onUpdate({ ...overlay, x: current.x, y: current.y });
        return current;
      });
    },
    onPinchStart: ({ event }) => {
      onSelect();
    },
    onPinch: ({ offset: [d, a], event }) => {
      event?.stopPropagation();
      setLocal(prev => ({ ...prev, scale: d, rotation: a }));
    },
    onPinchEnd: () => {
      // Flush to parent
      setLocal(current => {
        onUpdate({ ...overlay, scale: current.scale, rotation: current.rotation });
        return current;
      });
    }
  }, {
    drag: { pointer: { capture: false } },
    pinch: { 
      scaleBounds: { min: 0.2, max: 10 },
      from: () => [local.scale, local.rotation]
    }
  });

  const bindProps = bind() as React.DOMAttributes<HTMLDivElement>;
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (bindProps.onPointerDown) bindProps.onPointerDown(e);
    e.stopPropagation();
    onSelect();
  };

  return (
    <div
      {...bindProps}
      onPointerDown={handlePointerDown}
      style={{
        position: 'absolute',
        left: `${local.x * 100}%`,
        top: `${local.y * 100}%`,
        transform: `translate(-50%, -50%) scale(${local.scale}) rotate(${local.rotation}deg)`,
        zIndex: overlay.zIndex,
        touchAction: 'none'
      }}
      className={`draggable-overlay cursor-grab active:cursor-grabbing ${isSelected ? 'ring-2 ring-white/50 rounded-lg' : ''}`}
    >
      <div style={{ pointerEvents: 'none' }}>
        {children}
      </div>
    </div>
  );
}




