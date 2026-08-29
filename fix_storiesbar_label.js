const fs = require('fs');

let code = fs.readFileSync('src/components/domain/StoriesBar.tsx', 'utf8');

// Remove fileInputRef hook
code = code.replace(/const fileInputRef = useRef<HTMLInputElement>\(null\)\n\s*/, '');

// Remove the global hidden input
code = code.replace(/<input type="file" ref=\{fileInputRef\} className="opacity-0 absolute w-0 h-0 pointer-events-none -z-50" accept="image\/\*,video\/\*" onChange=\{handleFileChange\} \/>\n\s*/, '');

// Replace button for "Tu historia" with label
code = code.replace(
  /<button onClick=\{\(\) => fileInputRef\.current\?\.click\(\)\} className="flex flex-col items-center gap-1 min-w-\[72px\] cursor-pointer hover:opacity-80 shrink-0">/,
  `<label className="flex flex-col items-center gap-1 min-w-[72px] cursor-pointer hover:opacity-80 shrink-0">
            <input type="file" className="sr-only" accept="image/*,video/*" onChange={handleFileChange} />`
);
code = code.replace(
  /<\/button>\n\s*\)\}/,
  `</label>\n        )}`
);

// Replace + button on avatar with label
// Wait, the + button is inside a <div onClick={() => setActiveGroupIndex(i)}>.
// If it's a label inside a div with onClick, clicking the label will trigger both the file picker and the div's onClick (opening the story)!
// We need to prevent event propagation.
// But <label> doesn't have onClick easily if we want the native behavior.
// We can use a label with onClick={(e) => e.stopPropagation()}.
code = code.replace(
  /<div \n\s*onClick=\{\(e\) => \{ e\.stopPropagation\(\); fileInputRef\.current\?\.click\(\); \}\}\n\s*className="absolute top-10 right-0 w-5 h-5 bg-\[#E69A21\] text-white rounded-full border-2 border-background flex items-center justify-center text-xs font-bold shadow-sm cursor-pointer hover:scale-110 transition-transform"\n\s*>/,
  `<label 
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-10 right-0 w-5 h-5 bg-[#E69A21] text-white rounded-full border-2 border-background flex items-center justify-center text-xs font-bold shadow-sm cursor-pointer hover:scale-110 transition-transform"
                  >
                    <input type="file" className="sr-only" accept="image/*,video/*" onChange={handleFileChange} />`
);
code = code.replace(
  /\+\n\s*<\/div>/,
  `+\n                  </label>`
);

fs.writeFileSync('src/components/domain/StoriesBar.tsx', code);
console.log('Fixed StoriesBar with label');
