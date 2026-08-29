const fs = require('fs');

let code = fs.readFileSync('src/components/domain/StoryCreator.tsx', 'utf8');

if (!code.includes('fileInputRef')) {
  // 1. Add useRef if not there (it probably is but just in case)
  // 2. Add handleFileChange
  code = code.replace(
    /export function StoryCreator\(\{ onClose, onPublish \}: \{ onClose: \(\) => void, onPublish: \(\) => void \}\) \{/,
    `export function StoryCreator({ onClose, onPublish }: { onClose: () => void, onPublish: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setGlobalStoryDraft(file);
    // Reload preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    if (file.type.startsWith("video/")) {
      setMediaType("VIDEO");
    } else {
      setMediaType("IMAGE");
    }
  };`
  );
}

// 3. Add hidden input and Cambiar button
code = code.replace(
  /<div className="flex justify-around bg-zinc-900 rounded-xl p-2">/,
  `<div className="flex justify-around bg-zinc-900 rounded-xl p-2">
                <input type="file" ref={fileInputRef} className="opacity-0 absolute w-0 h-0 pointer-events-none -z-50" accept="image/*,video/*" onChange={handleFileChange} />
                <button onClick={() => fileInputRef.current?.click()} className="p-3 text-white flex flex-col items-center gap-1"><ImageIcon size={20}/><span className="text-xs">Cambiar</span></button>`
);

// We need to make sure ImageIcon is imported
if (!code.includes('ImageIcon')) {
  code = code.replace(
    /import \{ AlignLeft, X, Move, ChevronDown, Check, User, MapPin, ChefHat, Apple \} from "lucide-react"/,
    `import { AlignLeft, X, Move, ChevronDown, Check, User, MapPin, ChefHat, Apple, Image as ImageIcon } from "lucide-react"`
  );
}

fs.writeFileSync('src/components/domain/StoryCreator.tsx', code);
console.log('Added Cambiar to StoryCreator');
