const fs = require('fs');
let code = fs.readFileSync('src/components/domain/StoryCreator.tsx', 'utf8');

// 1. Change ImageIcon to Camera in the bottom menu
code = code.replace(/<ImageIcon size=\{20\}\/>/g, '<Camera size={20}/>');
// Make sure Camera is imported
if (!code.includes('Camera')) {
  code = code.replace(/import \{ ([^}]+) \} from 'lucide-react';/, "import { $1, Camera } from 'lucide-react';");
}

// 2. Add the big central button if !draftMediaUrl
const centerButton = `
          {!draftMediaUrl && (
            <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
              <label className="bg-primary hover:bg-primary/90 text-primary-foreground w-24 h-24 rounded-full flex flex-col items-center justify-center cursor-pointer pointer-events-auto transition-transform hover:scale-105 shadow-2xl">
                <input type="file" className="sr-only" accept="image/*,video/*" onChange={handleFileChange} />
                <Camera size={40} />
                <span className="text-sm font-bold mt-1">Subir</span>
              </label>
            </div>
          )}
`;

// Insert it right after <SharedStoryRenderer ... />
const anchor = 'mode="EDITOR"\n          />';
if (code.includes(anchor)) {
  code = code.replace(anchor, anchor + centerButton);
  fs.writeFileSync('src/components/domain/StoryCreator.tsx', code);
  console.log('Added big central button');
} else {
  // Try alternative anchor
  const altAnchor = 'mode="EDITOR" />';
  if (code.includes(altAnchor)) {
    code = code.replace(altAnchor, altAnchor + centerButton);
    fs.writeFileSync('src/components/domain/StoryCreator.tsx', code);
    console.log('Added big central button (alt anchor)');
  } else {
    // Just append after SharedStoryRenderer
    const genericAnchor = '<SharedStoryRenderer';
    const genericEnd = code.indexOf('/>', code.indexOf(genericAnchor));
    if (genericEnd !== -1) {
      code = code.substring(0, genericEnd + 2) + centerButton + code.substring(genericEnd + 2);
      fs.writeFileSync('src/components/domain/StoryCreator.tsx', code);
      console.log('Added big central button (generic anchor)');
    } else {
      console.log('Could not find SharedStoryRenderer');
    }
  }
}
