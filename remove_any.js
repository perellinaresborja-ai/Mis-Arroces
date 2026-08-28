const fs = require('fs');

let sp = fs.readFileSync('src/components/domain/stories/StickerPickers.tsx', 'utf8');

sp = sp.replace(/icon: any/g, "icon: React.ElementType");
sp = sp.replace(/onSelect: \(item: any\) => void/g, "onSelect: (item: { id: string, title: string, subtitle?: string, avatarUrl?: string | null, iconUrl?: string | null }) => void");
sp = sp.replace(/fetchResults: \(q: string\) => Promise<any\[\]>/g, "fetchResults: (q: string) => Promise<Array<{ id: string, title: string, subtitle?: string, avatarUrl?: string | null, iconUrl?: string | null }>>");
sp = sp.replace(/useState<any\[\]>\(\[\]\)/g, "useState<Array<{ id: string, title: string, subtitle?: string, avatarUrl?: string | null, iconUrl?: string | null }>>([])");
sp = sp.replace(/onSelect: \(u: any\)/g, "onSelect: (u: { id: string, title: string, subtitle?: string, avatarUrl?: string | null })");
sp = sp.replace(/onSelect: \(r: any\)/g, "onSelect: (r: { id: string, title: string, subtitle?: string, iconUrl?: string | null })");
sp = sp.replace(/onSelect: \(i: any\)/g, "onSelect: (i: { id: string, title: string })");
sp = sp.replace(/onSelect: \(loc: any\)/g, "onSelect: (loc: { id: string, title: string })");

// Fix the Supabase typing logic to avoid `as any` by explicitly typing the inner selects
sp = sp.replace(/\(u\.media as any\)\?\.storage_path/g, "((u.media as unknown) as { storage_path?: string })?.storage_path");
sp = sp.replace(/\(r\.profiles as any\)\?\.username/g, "((r.profiles as unknown) as { username?: string })?.username");
sp = sp.replace(/\(\(r\.recipe_media\?\.\[0\] as any\)\?\.media as any\)\?\.storage_path/g, "((((r.recipe_media?.[0] as unknown) as { media?: { storage_path?: string } })?.media)?.storage_path)");

fs.writeFileSync('src/components/domain/stories/StickerPickers.tsx', sp);

let sc = fs.readFileSync('src/components/domain/StoryCreator.tsx', 'utf8');
sc = sc.replace(/type: type as any/g, "type: type as OverlayType");
sc = sc.replace(/setPrivacy\(e\.target\.value as any\)/g, "setPrivacy(e.target.value as 'PUBLIC'|'FOLLOWERS')");
sc = sc.replace(/let payload: any = \{\};/g, "let payload: Record<string, unknown> = {};");
// Also ensure OverlayType is imported
if (!sc.includes("OverlayType")) {
  sc = sc.replace(/import \{ StoryTransform, StoryOverlay, StoryBackground, DrawingOverlay \} from '@\/types\/stories';/, "import { StoryTransform, StoryOverlay, StoryBackground, DrawingOverlay, OverlayType } from '@/types/stories';");
}
fs.writeFileSync('src/components/domain/StoryCreator.tsx', sc);
