const fs = require('fs');

let code = fs.readFileSync('src/components/domain/StoriesBar.tsx', 'utf8');

// 1. Add imports
code = code.replace(
  /import \{ StoriesViewer \} from "\.\/StoriesViewer"/,
  `import { StoriesViewer } from "./StoriesViewer"
import { useRef } from "react"
import { useRouter } from "next/navigation"
import { setGlobalStoryDraft } from "@/lib/story-draft"`
);

// 2. Add router and ref to component
code = code.replace(
  /const \[activeGroupIndex, setActiveGroupIndex\] = useState<number \| null>\(null\)/,
  `const [activeGroupIndex, setActiveGroupIndex] = useState<number | null>(null)
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setGlobalStoryDraft(file);
    router.push("/create/story");
    // Reset input
    e.target.value = "";
  }`
);

// 3. Replace the Link for !hasMyStories with a button that triggers file picker
code = code.replace(
  /<Link href="\/create\/story" className="flex flex-col items-center gap-1 min-w-\[72px\] cursor-pointer hover:opacity-80 shrink-0">/,
  `<button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-1 min-w-[72px] cursor-pointer hover:opacity-80 shrink-0">`
);
code = code.replace(
  /<\/Link>\n\s*\)}/,
  `</button>\n        )}`
);

// 4. Add the hidden input to the top of the return
code = code.replace(
  /<div className="w-full bg-card border border-border p-4 rounded-3xl flex gap-4 overflow-x-auto hide-scrollbar shadow-sm">/,
  `<div className="w-full bg-card border border-border p-4 rounded-3xl flex gap-4 overflow-x-auto hide-scrollbar shadow-sm">
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileChange} />`
);

fs.writeFileSync('src/components/domain/StoriesBar.tsx', code);
console.log('Fixed StoriesBar.tsx');
