const fs = require('fs');
let code = fs.readFileSync('src/components/domain/CommentsModal.tsx', 'utf8');

code = code.replace(
  /export function CommentsModal\(\{ isOpen, onClose, entityType, entityId, currentUserId, allowComments \}: CommentsModalProps\) \{/,
  `export function CommentsModal({ isOpen, onClose, entityType, entityId, currentUserId, authorId, allowComments }: CommentsModalProps) {\n  const [showOptionsMenu, setShowOptionsMenu] = useState(false)`
);

fs.writeFileSync('src/components/domain/CommentsModal.tsx', code);
console.log("FIXED TS PROPS");
