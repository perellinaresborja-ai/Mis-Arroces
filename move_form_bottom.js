const fs = require('fs');

let code = fs.readFileSync('src/components/domain/CommentSection.tsx', 'utf8');

// The original form block:
// {allowComments ? (
//   <form onSubmit={handleSubmit} className="space-y-2 mb-6">
// ...
//   </form>
// ) : (
//   <div className="bg-muted p-3 rounded-xl text-sm text-center text-muted-foreground mb-6">
//     Los comentarios están desactivados para esta publicación.
//   </div>
// )}

const start = code.indexOf('{allowComments ? (');
const end = code.indexOf('</div>\n      )}', start) + 16;

const formCode = code.substring(start, end);

// Remove the form from the top
code = code.replace(formCode, '');

// I'll place it at the very bottom of the CommentSection's root div
const lastDivIdx = code.lastIndexOf('</div>\n  )\n}');
code = code.substring(0, lastDivIdx) + 
`
      <div className="sticky bottom-0 bg-background/95 backdrop-blur pt-2 pb-safe-bottom z-10 w-full mt-4 border-t border-border/50">
        ${formCode}
      </div>
` + code.substring(lastDivIdx);

fs.writeFileSync('src/components/domain/CommentSection.tsx', code);
console.log('Moved form to sticky bottom');
