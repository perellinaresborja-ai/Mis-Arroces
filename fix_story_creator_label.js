const fs = require('fs');

let code = fs.readFileSync('src/components/domain/StoryCreator.tsx', 'utf8');

code = code.replace(/const fileInputRef = useRef<HTMLInputElement>\(null\);\n\s*/, '');

code = code.replace(
  /<input type="file" ref=\{fileInputRef\} className="opacity-0 absolute w-0 h-0 pointer-events-none -z-50" accept="image\/\*,video\/\*" onChange=\{handleFileChange\} \/>\n\s*<button onClick=\{\(\) => fileInputRef\.current\?\.click\(\)\} className="p-3 text-white flex flex-col items-center gap-1"><ImageIcon size=\{20\}\/><span className="text-xs">Cambiar<\/span><\/button>/,
  `<label className="p-3 text-white flex flex-col items-center gap-1 cursor-pointer m-0">
                  <input type="file" className="sr-only" accept="image/*,video/*" onChange={handleFileChange} />
                  <ImageIcon size={20}/><span className="text-xs">Cambiar</span>
                </label>`
);

fs.writeFileSync('src/components/domain/StoryCreator.tsx', code);
console.log('Fixed StoryCreator Cambiar with label');
