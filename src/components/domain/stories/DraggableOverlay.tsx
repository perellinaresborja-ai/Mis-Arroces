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
  onTap?: () => void;
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
  onTap,
  containerRef,
  children 
}: DraggableOverlayProps) {
  
  const [local, setLocal] = useState({ x: overlay.x, y: overlay.y, scale: overlay.scale, rotation: overlay.rotation });

  const latestOverlayRef = useRef(overlay);
  latestOverlayRef.current = overlay;

  const onTapRef = useRef(onTap);
  onTapRef.current = onTap;

  // Track start of interaction for tap vs drag
  const pointerStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const hasMovedBeyondThresholdRef = useRef(false);
  const isPinchingRef = useRef(false);
  const lastTapTimestampRef = useRef(0);

  // Sync from props if updated externally
  useEffect(() => {
    setLocal({ x: overlay.x, y: overlay.y, scale: overlay.scale, rotation: overlay.rotation });
  }, [overlay.x, overlay.y, overlay.scale, overlay.rotation]);

  const triggerTap = () => {
    const now = Date.now();
    // Debounce to prevent duplicate tap triggers within 200ms
    if (now - lastTapTimestampRef.current < 200) return;
    lastTapTimestampRef.current = now;
    if (onTapRef.current) {
      onTapRef.current();
    }
  };

  const DRAG_THRESHOLD_PX = 8;

  const bind = useGesture({
    onDragStart: () => {
      onSelect();
    },
    onDrag: ({ movement: [mx, my], event, memo }) => {
      event?.stopPropagation(); // Prevent background from dragging
      if (!containerRef.current) return memo;
      
      const dist = Math.hypot(mx, my);
      if (dist > DRAG_THRESHOLD_PX) {
        if (!hasMovedBeyondThresholdRef.current) {
          hasMovedBeyondThresholdRef.current = true;
          onDragStateChange?.(true);
        }
      }
      
      // If we haven't exceeded the drag threshold yet, don't move the sticker visually
      if (!hasMovedBeyondThresholdRef.current) {
        return memo;
      }

      if (!memo) {
        memo = { startX: local.x, startY: local.y };
      }
      
      const rect = containerRef.current.getBoundingClientRect();
      const nextX = memo.startX + mx / rect.width;
      const nextY = memo.startY + my / rect.height;
      
      setLocal(prev => ({ ...prev, x: nextX, y: nextY }));
      return memo;
    },
    onDragEnd: ({ tap, xy: [clientX, clientY] }) => {
      onDragStateChange?.(false);

      const elapsed = pointerStartRef.current ? Date.now() - pointerStartRef.current.time : 9999;
      const isShortTap = !isPinchingRef.current && !hasMovedBeyondThresholdRef.current && elapsed < 400;

      if (tap || isShortTap) {
        // Revert any sub-threshold movement back to exact overlay position
        setLocal(prev => ({
          ...prev,
          x: latestOverlayRef.current.x,
          y: latestOverlayRef.current.y
        }));
        triggerTap();
        return; // CRITICAL: Stop here! Do not call onUpdate or test trash on tap
      }

      // Hit test for trash zone
      const droppedOn = document.elementFromPoint(clientX, clientY);
      if (droppedOn?.closest('#story-trash')) {
        onDelete();
        return;
      }
      
      // Flush to parent using latest overlay
      setLocal(current => {
        onUpdate({ ...latestOverlayRef.current, x: current.x, y: current.y });
        return current;
      });
    },
    onPinchStart: () => {
      isPinchingRef.current = true;
      onSelect();
    },
    onPinch: ({ offset: [d, a], event }) => {
      event?.stopPropagation();
      setLocal(prev => ({ ...prev, scale: d, rotation: a }));
    },
    onPinchEnd: () => {
      // Flush to parent
      setLocal(current => {
        onUpdate({ ...latestOverlayRef.current, scale: current.scale, rotation: current.rotation });
        return current;
      });
      setTimeout(() => {
        isPinchingRef.current = false;
      }, 50);
    }
  }, {
    drag: { 
      filterTaps: true,
      tapsThreshold: DRAG_THRESHOLD_PX,
      pointer: { capture: false } 
    },
    pinch: { 
      scaleBounds: { min: 0.2, max: 10 },
      from: () => [local.scale, local.rotation]
    }
  });

  const bindProps = bind() as React.DOMAttributes<HTMLDivElement>;
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointerStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    hasMovedBeyondThresholdRef.current = false;
    if (bindProps.onPointerDown) bindProps.onPointerDown(e);
    e.stopPropagation();
    onSelect();
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (bindProps.onClick) bindProps.onClick(e);
    if (!hasMovedBeyondThresholdRef.current && !isPinchingRef.current) {
      triggerTap();
    }
  };

  return (
    <div
      {...bindProps}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
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
