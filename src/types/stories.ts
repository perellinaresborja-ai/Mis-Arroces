export type OverlayType = 'TEXT' | 'MENTION' | 'LOCATION' | 'RECIPE' | 'GIF' | 'DRAWING' | 'POLL' | 'SLIDER' | 'QUESTION' | 'SESSION' | 'PROFILE' | 'INGREDIENT' | 'POST' | 'LINK';

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
    fontFamily?: string;
    textShadow?: string;
    styleType?: 'clean' | 'highlight' | 'label' | 'minimal' | 'block' | 'handwritten';
  };
}

export interface DrawingOverlay extends BaseOverlay {
  type: 'DRAWING';
  payload: {
    paths: Array<{
      points: Array<{x: number, y: number}>;
      color: string;
      strokeWidth: number;
    }>;
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
    displayStyle?: 'small' | 'card' | 'compact' | 'text';
  };
}

export interface SessionOverlay extends BaseOverlay {
  type: 'SESSION';
  payload: {
    sessionId: string;
    authorName: string;
    coverUrl?: string;
    title?: string;
    displayStyle?: 'compact' | 'card' | 'text';
  };
}

export interface PostOverlay extends BaseOverlay {
  type: 'POST';
  payload: {
    postId: string;
    authorName: string;
    text?: string;
    coverUrl?: string;
    mediaType?: 'IMAGE' | 'VIDEO';
    displayStyle?: 'compact' | 'card' | 'text';
  };
}

export interface ProfileOverlay extends BaseOverlay {
  type: 'PROFILE';
  payload: {
    userId: string;
    username: string;
    avatarUrl?: string;
  };
}

export interface IngredientOverlay extends BaseOverlay {
  type: 'INGREDIENT';
  payload: {
    ingredientId: string;
    name: string;
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

export interface PollOverlay extends BaseOverlay {
  type: 'POLL';
  payload: {
    pollId?: string; // set after saving to DB
    question: string;
    optionA: string;
    optionB: string;
  };
}

export interface SliderOverlay extends BaseOverlay {
  type: 'SLIDER';
  payload: {
    question: string;
    emoji: string;
  };
}

export interface QuestionOverlay extends BaseOverlay {
  type: 'QUESTION';
  payload: {
    question: string;
  };
}

export interface LinkOverlay extends BaseOverlay {
  type: 'LINK';
  payload: {
    url: string;
    title?: string;
  };
}

export type StoryOverlay = TextOverlay | DrawingOverlay | MentionOverlay | LocationOverlay | RecipeOverlay | SessionOverlay | ProfileOverlay | IngredientOverlay | GifOverlay | PollOverlay | SliderOverlay | QuestionOverlay | PostOverlay | LinkOverlay;

export function validateOverlay(overlay: any): boolean {
  if (!overlay || typeof overlay !== 'object') return false;
  if (!overlay.id || !overlay.type || typeof overlay.x !== 'number' || typeof overlay.y !== 'number') return false;
  
  switch(overlay.type) {
    case 'TEXT':
      return typeof overlay.payload?.text === 'string' && overlay.payload.text.length <= 500;
    case 'DRAWING':
      return Array.isArray(overlay.payload?.paths);
    case 'MENTION':
    case 'PROFILE':
      return typeof overlay.payload?.userId === 'string' && typeof overlay.payload?.username === 'string';
    case 'LOCATION':
      return typeof overlay.payload?.name === 'string' && overlay.payload.name.length <= 100;
    case 'RECIPE':
      return typeof overlay.payload?.recipeId === 'string' && typeof overlay.payload?.title === 'string';
    case 'SESSION':
      return typeof overlay.payload?.sessionId === 'string' && typeof overlay.payload?.authorName === 'string';
    case 'POST':
      return typeof overlay.payload?.postId === 'string' && typeof overlay.payload?.authorName === 'string';
    case 'INGREDIENT':
      return typeof overlay.payload?.ingredientId === 'string' && typeof overlay.payload?.name === 'string';
    case 'GIF':
      return typeof overlay.payload?.url === 'string' && overlay.payload.url.startsWith('https://');
    case 'LINK':
      return typeof overlay.payload?.url === 'string' && (overlay.payload.url.startsWith('https://') || overlay.payload.url.startsWith('http://'));
    case 'POLL':
      return typeof overlay.payload?.question === 'string' && typeof overlay.payload?.optionA === 'string' && typeof overlay.payload?.optionB === 'string';
    case 'SLIDER':
      return typeof overlay.payload?.question === 'string' && typeof overlay.payload?.emoji === 'string';
    case 'QUESTION':
      return typeof overlay.payload?.question === 'string';
    default:
      return false;
  }
}

export interface MusicConfig {
  track_id?: string;
  start_time_ms?: number;
  duration_ms?: number;
  music_volume?: number;
  original_audio_volume?: number;
}

export function validateMusicConfig(config: any): boolean {
  if (!config || typeof config !== 'object') return false;
  if (!config.track_id && config.original_audio_volume !== undefined) {
    return typeof config.original_audio_volume === 'number' && config.original_audio_volume >= 0 && config.original_audio_volume <= 1;
  }
  if (typeof config.track_id !== 'string' || !config.track_id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) return false;
  if (typeof config.start_time_ms !== 'number' || config.start_time_ms < 0) return false;
  if (typeof config.duration_ms !== 'number' || config.duration_ms <= 0) return false;
  if (typeof config.music_volume !== 'number' || config.music_volume < 0 || config.music_volume > 1) return false;
  if (config.original_audio_volume !== undefined && (typeof config.original_audio_volume !== 'number' || config.original_audio_volume < 0 || config.original_audio_volume > 1)) return false;
  return true;
}

