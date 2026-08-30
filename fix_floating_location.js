const fs = require('fs');
let code = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');

const mapBlock = `      {floatingEmojis.map(e => (
        <div key={e.id} className="absolute bottom-20 left-1/2 text-4xl animate-float-up pointer-events-none drop-shadow-xl z-50 flex items-center justify-center w-12 h-12" style={{ marginLeft: \`\${e.x}px\` }}>
          {e.emoji === 'PAELLA' ? <PaellaIcon className="w-12 h-12 text-primary" /> : e.emoji}
        </div>
      ))}`;

code = code.replace(mapBlock + '\n', '');
code = code.replace(mapBlock, '');

// Now we need to insert it at the very end of the MAIN relative container.
// The main relative container ends with:
//       </div>
//     </div>
//   )
// }

const lastDiv = code.lastIndexOf('</div>\n    </div>\n  )\n}');
if (lastDiv !== -1) {
  code = code.substring(0, lastDiv) + '\n' + mapBlock + '\n' + code.substring(lastDiv);
} else {
  console.log("Could not find the end of the root container.");
}

fs.writeFileSync('src/components/domain/StoriesViewer.tsx', code);
console.log('Fixed floating emoji rendering location');
