const fs = require('fs');

let code = fs.readFileSync('src/components/domain/messages/MessageInput.tsx', 'utf8');

code = code.replace(
  /import \{ Image as ImageIcon, Video, X, Send \} from "lucide-react"/,
  'import { Image as ImageIcon, Video, X, ArrowUp } from "lucide-react"'
);

code = code.replace(
  /<Send className="w-4 h-4"\/>/,
  '<ArrowUp className="w-5 h-5" strokeWidth={3} />'
);

fs.writeFileSync('src/components/domain/messages/MessageInput.tsx', code);
console.log('Updated send icon in MessageInput');
