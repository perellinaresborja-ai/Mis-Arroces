/**
 * Sistema de estilos visuales por toque para stickers de Stories en misarroces.
 * Permite rotar cíclicamente los estilos visuales mediante un toque corto sobre
 * stickers interactivos soportados (MENTION, LOCATION, HASHTAG, PROFILE, RECIPE, INGREDIENT, LINK).
 */

export type StickerStyleVariant = 'default' | 'white' | 'black' | 'glass' | 'orange' | 'text' | string;

export const STICKER_STYLE_VARIANTS: Record<string, StickerStyleVariant[]> = {
  MENTION: ['orange', 'white', 'black', 'glass', 'text'],
  LOCATION: ['default', 'white', 'black', 'glass', 'orange', 'text'],
  HASHTAG: ['default', 'white', 'black', 'glass', 'orange', 'text'],
  PROFILE: ['default', 'white', 'black', 'glass', 'orange', 'text'],
  RECIPE: ['compact', 'white', 'black', 'glass', 'orange', 'text'],
  INGREDIENT: ['default', 'white', 'black', 'glass', 'orange', 'text'],
  LINK: ['default', 'white', 'black', 'glass', 'orange', 'text'],
};

export const SUPPORTED_TAP_STYLE_OVERLAYS = [
  'MENTION',
  'LOCATION',
  'HASHTAG',
  'PROFILE',
  'RECIPE',
  'INGREDIENT',
  'LINK',
] as const;

export type SupportedTapStyleOverlayType = (typeof SUPPORTED_TAP_STYLE_OVERLAYS)[number];

export function isTapStyleSupported(type: string): type is SupportedTapStyleOverlayType {
  return SUPPORTED_TAP_STYLE_OVERLAYS.includes(type as any);
}

/**
 * Obtiene el siguiente estilo visual en ciclo para un tipo de sticker dado.
 */
export function getNextStickerStyle(type: string, currentStyle?: string): string {
  const variants = STICKER_STYLE_VARIANTS[type];
  if (!variants || variants.length === 0) return currentStyle || 'default';

  const normalizedCurrent = currentStyle || variants[0];
  const currentIndex = variants.indexOf(normalizedCurrent as any);
  if (currentIndex === -1) {
    return variants[0];
  }
  const nextIndex = (currentIndex + 1) % variants.length;
  return variants[nextIndex];
}

export interface StickerResolvedStyle {
  variant: string;
  isTextOnly: boolean;
  wrapperClass: string;
  iconClass: string;
  accentClass: string;
  badgeClass?: string;
  inlineStyle?: React.CSSProperties;
}

/**
 * Resuelve las clases visuales completas para un sticker según su tipo y estilo.
 */
export function resolveStickerStyle(type: string, styleVariant?: string): StickerResolvedStyle {
  const rawVariant = styleVariant || (type === 'MENTION' ? 'orange' : type === 'RECIPE' ? 'compact' : 'default');

  // Mapear compatibilidad (ej: 'compact' o 'card' en RECIPE)
  let variant = rawVariant;
  if (type === 'RECIPE' && (variant === 'compact' || variant === 'card')) {
    variant = 'default';
  }

  switch (variant) {
    case 'white':
      return {
        variant: 'white',
        isTextOnly: false,
        wrapperClass: 'bg-white text-zinc-900 border border-black/10 shadow-2xl',
        iconClass: type === 'MENTION' ? 'text-primary' : 'text-primary',
        accentClass: 'text-primary font-bold',
        badgeClass: 'bg-zinc-100 text-zinc-900 border border-zinc-200',
      };
    case 'black':
      return {
        variant: 'black',
        isTextOnly: false,
        wrapperClass: 'bg-zinc-900 text-white border border-white/20 shadow-2xl',
        iconClass: 'text-primary',
        accentClass: 'text-primary font-bold',
        badgeClass: 'bg-white/10 text-white border border-white/15',
      };
    case 'glass':
      return {
        variant: 'glass',
        isTextOnly: false,
        wrapperClass: 'bg-black/55 backdrop-blur-md text-white border border-white/25 shadow-2xl',
        iconClass: 'text-primary',
        accentClass: 'text-primary font-bold',
        badgeClass: 'bg-white/15 text-white border border-white/20',
      };
    case 'orange':
      return {
        variant: 'orange',
        isTextOnly: false,
        wrapperClass: 'bg-primary text-primary-foreground border border-primary-foreground/20 shadow-2xl',
        iconClass: 'text-primary-foreground',
        accentClass: 'text-primary-foreground font-bold',
        badgeClass: 'bg-black/20 text-white border border-white/20',
      };
    case 'text':
      return {
        variant: 'text',
        isTextOnly: true,
        wrapperClass: 'bg-transparent text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]',
        iconClass: 'text-primary drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]',
        accentClass: 'text-primary font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]',
        badgeClass: 'bg-black/50 border border-white/20 text-white drop-shadow-md',
      };
    case 'default':
    default:
      if (type === 'MENTION') {
        return {
          variant: 'orange',
          isTextOnly: false,
          wrapperClass: 'bg-primary text-primary-foreground border border-primary-foreground/20 shadow-2xl',
          iconClass: 'text-primary-foreground',
          accentClass: 'text-primary-foreground font-bold',
          badgeClass: 'bg-black/20 text-white border border-white/20',
        };
      }
      return {
        variant: 'default',
        isTextOnly: false,
        wrapperClass: 'bg-card text-foreground border border-border shadow-2xl',
        iconClass: 'text-primary',
        accentClass: 'text-primary font-bold',
        badgeClass: 'bg-primary/10 text-primary border border-primary/20',
      };
  }
}
