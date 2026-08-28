const fs = require('fs');
let code = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');
code = code.replace(/import \{ toast \} from "sonner"/, '');
code = code.replace(/toast\.success/g, 'console.log');
code = code.replace(/toast\.error/g, 'console.error');
fs.writeFileSync('src/components/domain/StoriesViewer.tsx', code);
console.log("FIXED TOAST");
