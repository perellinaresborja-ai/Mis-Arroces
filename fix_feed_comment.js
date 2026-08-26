const fs = require('fs');

let file = fs.readFileSync('src/components/domain/FeedCard.tsx', 'utf8');

if (!file.includes('useAuthPrompt')) {
  file = file.replace(
    'import { cn, formatRelativeTime } from "@/lib/utils"',
    'import { cn, formatRelativeTime } from "@/lib/utils"\nimport { useAuthPrompt } from "@/components/providers/AuthPromptProvider"'
  );
}

file = file.replace(
  'export function FeedCard({',
  'export function FeedCard({\n'
);

// Add useAuthPrompt inside the component
if (!file.includes('const { showAuthPrompt } = useAuthPrompt()')) {
  file = file.replace(
    'const [isCommentsOpen, setIsCommentsOpen] = useState(false)',
    'const [isCommentsOpen, setIsCommentsOpen] = useState(false)\n  const { showAuthPrompt } = useAuthPrompt()'
  );
}

// Update the click handler
const oldButton = '<button onClick={() => setIsCommentsOpen(true)} className="flex items-center gap-1.5 hover:opacity-70 transition-opacity">';
const newButton = `<button onClick={() => {
            if (!currentUserId) {
              showAuthPrompt("Crea tu cuenta para participar en la conversación.")
              return
            }
            setIsCommentsOpen(true)
          }} className="flex items-center gap-1.5 hover:opacity-70 transition-opacity">`;

if (file.includes(oldButton)) {
  file = file.replace(oldButton, newButton);
}

fs.writeFileSync('src/components/domain/FeedCard.tsx', file, 'utf8');
