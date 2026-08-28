const fs = require('fs');
let code = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');

const searchBtn = '            <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-2 hover:bg-black/20 rounded-full transition-colors backdrop-blur-sm relative z-50 pointer-events-auto">\n              <X className="w-6 h-6 drop-shadow-md" />\n            </button>';
const searchBtnFallback = 'onClick={(e) => { e.stopPropagation(); onClose(); }}';

const replaceHeader = `            <div className="flex gap-2 relative z-50 pointer-events-auto">
              <button onClick={handleMenuClick} className="p-2 hover:bg-black/20 rounded-full transition-colors backdrop-blur-sm">
                <MoreHorizontal className="w-6 h-6 drop-shadow-md text-white" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-2 hover:bg-black/20 rounded-full transition-colors backdrop-blur-sm">
                <X className="w-6 h-6 drop-shadow-md text-white" />
              </button>
            </div>`;

if (code.includes(searchBtn)) {
  code = code.replace(searchBtn, replaceHeader);
  console.log('REPLACED EXACT MATCH');
} else {
  // Use regex to find the button block
  const btnRegex = /<button onClick=\{\(e\) => \{ e\.stopPropagation\(\); onClose\(\); \}\}.*?<X className="w-6 h-6 drop-shadow-md" \/>\s*<\/button>/s;
  if (btnRegex.test(code)) {
    code = code.replace(btnRegex, replaceHeader);
    console.log('REPLACED VIA REGEX');
  } else {
    console.log('NOT FOUND AT ALL');
  }
}

fs.writeFileSync('src/components/domain/StoriesViewer.tsx', code);
