const fs = require('fs');
let code = fs.readFileSync('src/components/domain/ProfileGridCard.tsx', 'utf8');

// Add import for Pin
code = code.replace(
  /import \{ MessageCircle \} from "lucide-react"/,
  `import { MessageCircle, Pin } from "lucide-react"`
);

// Add pin badge
const badgeHtml = `
        {item.is_pinned && (
          <div className="absolute top-1.5 left-1.5 z-10 bg-black/60 text-white p-1 rounded-md backdrop-blur-sm shadow-sm pointer-events-none">
            <Pin className="w-3.5 h-3.5 fill-current transform rotate-45" />
          </div>
        )}
        
        {/* Subtle badge for specific content types */}
`;

code = code.replace(/\{\/\* Subtle badge for specific content types \*\/\}/, badgeHtml);

fs.writeFileSync('src/components/domain/ProfileGridCard.tsx', code);
console.log("UPDATED ProfileGridCard");
