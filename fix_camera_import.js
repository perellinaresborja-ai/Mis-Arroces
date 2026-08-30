const fs = require('fs');
let code = fs.readFileSync('src/components/domain/messages/MessageInput.tsx', 'utf8');

if (!code.includes('import { Image as ImageIcon, Video, X, ArrowUp, Camera }')) {
  // It probably just had the original import. Let's force it.
  code = code.replace(/import { Image as ImageIcon, Video, X, ArrowUp } from "lucide-react"/, 'import { Image as ImageIcon, Video, X, ArrowUp, Camera } from "lucide-react"');
}
fs.writeFileSync('src/components/domain/messages/MessageInput.tsx', code);
console.log('Fixed camera import');
