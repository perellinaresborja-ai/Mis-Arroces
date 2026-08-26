const fs = require('fs');

let file = fs.readFileSync('src/components/domain/CommentSection.tsx', 'utf8');

if (!file.includes('useAuthPrompt } from "@/components/providers/AuthPromptProvider"')) {
  file = file.replace(
    'import { cn, formatRelativeTime } from "@/lib/utils"',
    'import { cn, formatRelativeTime } from "@/lib/utils"\nimport { useAuthPrompt } from "@/components/providers/AuthPromptProvider"'
  );
  fs.writeFileSync('src/components/domain/CommentSection.tsx', file, 'utf8');
}
