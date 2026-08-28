const fs = require('fs');
let code = fs.readFileSync('src/components/domain/CommentsModal.tsx', 'utf8');

// replace the hardcoded menu with PostOptionsMenu
code = code.replace(
  /\{isOwner && \([\s\S]*?<\/div>\n\s*\)\}/,
  `{isOwner && <PostOptionsMenu entityType={entityType} entityId={entityId} allowComments={allowComments} onDeleted={onClose} />}`
);

// Add import
if (!code.includes('PostOptionsMenu')) {
  code = code.replace(/import \{ X.*\} from "lucide-react"/, `import { X } from "lucide-react"\nimport { PostOptionsMenu } from "./PostOptionsMenu"`);
  // Remove unused lucide imports
  code = code.replace(/import \{ X, MoreHorizontal, Bookmark, MessageSquareOff, Edit2, Trash2 \}/, `import { X }`);
}

fs.writeFileSync('src/components/domain/CommentsModal.tsx', code);
console.log("REPLACED IN COMMENTS MODAL");

let socialCode = fs.readFileSync('src/components/domain/SocialElaborationModal.tsx', 'utf8');

// Add import
if (!socialCode.includes('PostOptionsMenu')) {
  socialCode = socialCode.replace(/import \{ X.*\} from "lucide-react"/, `import { X } from "lucide-react"\nimport { PostOptionsMenu } from "./PostOptionsMenu"`);
  
  // Actually SocialElaborationModal uses other lucide imports, so let's just append it after lucide imports
  socialCode = socialCode.replace(/import \{ (.*?) \} from "lucide-react"/, `import { $1 } from "lucide-react"\nimport { PostOptionsMenu } from "./PostOptionsMenu"`);
}

// Find isOwner in SocialElaborationModal
if (!socialCode.includes('const isOwner =')) {
  socialCode = socialCode.replace(/if \(!isOpen\) return null/, `if (!isOpen) return null\n  const isOwner = currentUserId === item.author?.id`);
}

// Insert into MOBILE HEADER
socialCode = socialCode.replace(
  /<button onClick=\{onClose\} className="p-2"><X className="w-5 h-5"\/><\/button>/,
  `<div className="flex items-center gap-1">\n            {isOwner && <PostOptionsMenu entityType={item.entity_type} entityId={item.id} allowComments={item.allow_comments ?? true} onDeleted={onClose} />}\n            <button onClick={onClose} className="p-2"><X className="w-5 h-5"/></button>\n          </div>`
);

// Insert into DESKTOP HEADER
socialCode = socialCode.replace(
  /<button onClick=\{onClose\} className="p-2 hover:bg-muted rounded-full transition-colors"><X className="w-5 h-5"\/><\/button>/,
  `<div className="flex items-center gap-1">\n              {isOwner && <PostOptionsMenu entityType={item.entity_type} entityId={item.id} allowComments={item.allow_comments ?? true} onDeleted={onClose} />}\n              <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors"><X className="w-5 h-5"/></button>\n            </div>`
);

fs.writeFileSync('src/components/domain/SocialElaborationModal.tsx', socialCode);
console.log("ADDED TO SOCIAL ELABORATION MODAL");

