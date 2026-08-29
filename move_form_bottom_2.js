const fs = require('fs');

let code = fs.readFileSync('src/components/domain/CommentSection.tsx', 'utf8');

// The original form block
const start = code.indexOf('{allowComments ? (');
const endStr = 'Los comentarios están desactivados para esta publicación.\n        </div>\n      )}';
const endStrCRLF = 'Los comentarios están desactivados para esta publicación.\r\n        </div>\r\n      )}';
let end = code.indexOf(endStr);
if (end === -1) end = code.indexOf(endStrCRLF);
if (end === -1) {
  console.log('Cannot find end string');
  // fallback search
  end = code.indexOf(')}', code.indexOf('desactivados para esta')) + 2;
} else {
  end += endStr.length;
}

const formCode = code.substring(start, end);
console.log('Found form length: ' + formCode.length);

// Remove the form from the top
code = code.replace(formCode, '');

// I'll place it at the very bottom of the CommentSection's root div
const lastDivIdx = code.lastIndexOf('</div>'); // This is the last closing div of the component
code = code.substring(0, lastDivIdx) + 
`
      <div className="sticky bottom-0 bg-background/95 backdrop-blur pt-2 pb-safe-bottom z-10 w-full mt-4 border-t border-border/50">
        ${formCode}
      </div>
` + code.substring(lastDivIdx);

fs.writeFileSync('src/components/domain/CommentSection.tsx', code);
console.log('Moved form to sticky bottom 2');
