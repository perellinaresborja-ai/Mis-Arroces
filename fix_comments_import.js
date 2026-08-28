const fs = require('fs');
let code = fs.readFileSync('src/components/domain/CommentsModal.tsx', 'utf8');

code = code.replace(/import \{ X, MoreHorizontal, Bookmark, MessageSquareOff, Edit2, Trash2 \} from "lucide-react"/, 'import { X } from "lucide-react"\nimport { PostOptionsMenu } from "./PostOptionsMenu"');

fs.writeFileSync('src/components/domain/CommentsModal.tsx', code);
console.log("FIXED COMMENTS MODAL IMPORT");
