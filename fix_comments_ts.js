const fs = require('fs');
let code = fs.readFileSync('src/components/domain/CommentsModal.tsx', 'utf8');

// Add authorId to component arguments
code = code.replace(
  /export function CommentsModal\(\{[\s\S]*?allowComments\n\}: CommentsModalProps\) \{/,
  `export function CommentsModal({
  isOpen,
  onClose,
  entityType,
  entityId,
  currentUserId,
  authorId,
  allowComments
}: CommentsModalProps) {`
);

// Add showOptionsMenu state
if (!code.includes('const [showOptionsMenu')) {
  code = code.replace(
    /const \[loading, setLoading\] = useState\(true\)/,
    `const [loading, setLoading] = useState(true)\n  const [showOptionsMenu, setShowOptionsMenu] = useState(false)`
  );
}

fs.writeFileSync('src/components/domain/CommentsModal.tsx', code);
console.log("FIXED COMMENTS MODAL");
