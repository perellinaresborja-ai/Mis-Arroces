const fs = require('fs');
let code = fs.readFileSync('src/components/domain/CommentSection.tsx', 'utf8');

// Replace the Send icon with ArrowUp in lucide-react import
code = code.replace(/Send \}/, 'ArrowUp }');
code = code.replace(/Send, /, 'ArrowUp, '); // just in case

// Replace the button JSX
const oldButtonRegex = /<button\s+type="submit"\s+disabled=\{isPending \|\| !newComment\.trim\(\)\}\s+className="flex items-center justify-center p-2 mx-1 mb-1 text-primary hover:text-primary\/80 disabled:opacity-50 disabled:text-muted-foreground transition-colors shrink-0"\s+title="Publicar"\s*>\s*<Send className="w-5 h-5 -ml-0\.5" strokeWidth=\{1\.5\} \/>\s*<\/button>/;

const newButton = `<button 
                  type="submit" 
                  disabled={isPending || !newComment.trim()} 
                  className="flex items-center justify-center w-8 h-8 mx-2 mb-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100 transition-colors shrink-0"
                  title="Publicar"
                >
                  <ArrowUp className="w-5 h-5" strokeWidth={2.5} />
                </button>`;

if (oldButtonRegex.test(code)) {
    code = code.replace(oldButtonRegex, newButton);
    fs.writeFileSync('src/components/domain/CommentSection.tsx', code);
    console.log("REPLACED COMMENT SEND BUTTON");
} else {
    console.log("REGEX FAILED. TRYING FALLBACK...");
    // Fallback if formatting is slightly different
    code = code.replace(/<Send className="w-5 h-5 -ml-0\.5" strokeWidth=\{1\.5\} \/>/, '<ArrowUp className="w-5 h-5" strokeWidth={2.5} />');
    code = code.replace(/className="flex items-center justify-center p-2 mx-1 mb-1 text-primary hover:text-primary\/80 disabled:opacity-50 disabled:text-muted-foreground transition-colors shrink-0"/, 'className="flex items-center justify-center w-8 h-8 mx-2 mb-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100 transition-colors shrink-0"');
    fs.writeFileSync('src/components/domain/CommentSection.tsx', code);
    console.log("USED FALLBACK");
}
