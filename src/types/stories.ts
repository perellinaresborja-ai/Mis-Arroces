export type OverlayType = 'TEXT' | 'MENTION' | 'LOCATION' | 'RECIPE' | 'GIF';

export interface StoryTransform {
  scale: number;
  translateX: number;
  translateY: number;
  rotation?: number;
}

export interface StoryBackground {
  type: 'color' | 'blur';
  value: string; // Hex color or empty for blur
}

export interface BaseOverlay {
  id: string;
  type: OverlayType;
  x: number; // 0 to 1 normalized
  y: number; // 0 to 1 normalized
  scale: number;
  rotation: number;
  zIndex: number;
}

export interface TextOverlay extends BaseOverlay {
  type: 'TEXT';
  payload: {
    text: string;
    color: string;
    backgroundColor?: string;
    align?: 'left' | 'center' | 'right';
  };
}

export interface MentionOverlay extends BaseOverlay {
  type: 'MENTION';
  payload: {
    userId: string;
    username: string;
  };
}

export interface LocationOverlay extends BaseOverlay {
  type: 'LOCATION';
  payload: {
    name: string;
    placeId?: string;
  };
}

export interface RecipeOverlay extends BaseOverlay {
  type: 'RECIPE';
  payload: {
    recipeId: string;
    title: string;
    coverUrl?: string;
  };
}

export interface GifOverlay extends BaseOverlay {
  type: 'GIF';
  payload: {
    gifId: string;
    url: string;
    aspectRatio: number;
  };
}

export type StoryOverlay = TextOverlay | MentionOverlay | LocationOverlay | RecipeOverlay | GifOverlay;

export function validateOverlay(overlay: any): boolean {
  if (!overlay || typeof overlay !== 'object') return false;
  if (!overlay.id || !overlay.type || typeof overlay.x !== 'number' || typeof overlay.y !== 'number') return false;
  if (overlay.x < -1 || overlay.x > 2 || overlay.y < -1 || overlay.y > 2) return false;
  if (overlay.scale < 0.1 || overlay.scale > 10) return false;
  
  switch(overlay.type) {
    case 'TEXT':
      return typeof overlay.payload?.text === 'string' && overlay.payload.text.length <= 200;
    case 'MENTION':
      return typeof overlay.payload?.userId === 'string' && typeof overlay.payload?.username === 'string';
    case 'LOCATION':
      return typeof overlay.payload?.name === 'string' && overlay.payload.name.length <= 100;
    case 'RECIPE':
      return typeof overlay.payload?.recipeId === 'string' && typeof overlay.payload?.title === 'string';
    case 'GIF':
      return typeof overlay.payload?.url === 'string' && overlay.payload.url.startsWith('https://');
    default:
      return false;
  }
}
