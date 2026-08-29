const fs = require('fs');

let code = fs.readFileSync('src/components/domain/GlobalCreateMenu.tsx', 'utf8');

// Remove fileInputRef hook
code = code.replace(/const fileInputRef = useRef<HTMLInputElement>\(null\)\n\s*/, '');

// Remove global hidden input
code = code.replace(/<input type="file" ref=\{fileInputRef\} className="opacity-0 absolute w-0 h-0 pointer-events-none -z-50" accept="image\/\*,video\/\*" onChange=\{handleFileChange\} \/>\n\s*/, '');

// Update options.map rendering
code = code.replace(
  /\{options\.map\(\(option\) => \(\n\s*<button\n\s*key=\{option\.label\}\n\s*onClick=\{\(\) => handleNavigate\(option\)\}\n\s*className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-muted transition-colors text-left font-semibold text-sm"\n\s*>\n\s*<option\.icon className="w-5 h-5 text-muted-foreground" \/>\n\s*\{option\.label\}\n\s*<\/button>\n\s*\)\)\}/,
  `{options.map((option: any) => (
              option.isFilePicker ? (
                <label
                  key={option.label}
                  className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-muted transition-colors text-left font-semibold text-sm cursor-pointer m-0"
                >
                  <input type="file" className="sr-only" accept="image/*,video/*" onChange={handleFileChange} />
                  <option.icon className="w-5 h-5 text-muted-foreground" />
                  {option.label}
                </label>
              ) : (
                <button
                  key={option.label}
                  onClick={() => handleNavigate(option)}
                  className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-muted transition-colors text-left font-semibold text-sm"
                >
                  <option.icon className="w-5 h-5 text-muted-foreground" />
                  {option.label}
                </button>
              )
            ))}`
);

fs.writeFileSync('src/components/domain/GlobalCreateMenu.tsx', code);
console.log('Fixed GlobalCreateMenu with label');
