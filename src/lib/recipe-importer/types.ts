export type SourcePlatform = 'WEB' | 'TIKTOK' | 'YOUTUBE' | 'INSTAGRAM';

export type ExtractionStatus = 'COMPLETE' | 'PARTIAL' | 'UNSTRUCTURED';

export interface ImportedIngredient {
  raw_text: string;
}

export interface ImportedInstruction {
  step_number: number;
  text: string;
  notes?: string | null;
}

export interface ImportedRecipe {
  source_platform: SourcePlatform;
  source_url: string;              // Canonical clean URL without tracking params
  external_id: string | null;      // Unique external platform ID when available
  title: string | null;
  description: string | null;
  author_name: string | null;
  servings: number | null;         // NULL if not explicitly stated in source
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  total_time_minutes: number | null;
  ingredients: ImportedIngredient[];
  instructions: ImportedInstruction[];
  raw_source_text: string | null;
  extraction_status: ExtractionStatus;
  warning_notes?: string[];
}

export interface ImportResult {
  success: boolean;
  recipe?: ImportedRecipe;
  error?: string;
  isInsufficient?: boolean;
  missingConfig?: boolean;
}
