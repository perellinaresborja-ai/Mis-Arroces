const fs = require('fs');

let content = fs.readFileSync('src/components/domain/CommentSection.tsx', 'utf8');

// Import useAuthPrompt
content = content.replace(
  'import { useAutocomplete } from "@/lib/autocomplete"',
  'import { useAutocomplete } from "@/lib/autocomplete"\nimport { useAuthPrompt } from "@/components/providers/AuthPromptProvider"'
);

// Replace router.push("/login?next=...") with showAuthPrompt() in CommentThread
content = content.replace(
  /const router = useRouter\(\)/g,
  'const { showAuthPrompt } = useAuthPrompt()\n  const router = useRouter()'
);

content = content.replace(
  /if \(!currentUserId\) \{\s*router\.push\("\/login\?next=" \+ encodeURIComponent\(pathname\)\)\s*return\s*\}/g,
  `if (!currentUserId) {
      showAuthPrompt("Crea tu cuenta para participar en la conversación.")
      return
    }`
);

// Fix input area
content = content.replace(
  /disabled=\{!currentUserId \|\| isPending\}/g,
  `disabled={isPending}
                  onClick={() => {
                    if (!currentUserId) showAuthPrompt("Crea tu cuenta para participar en la conversación.")
                  }}
                  readOnly={!currentUserId}`
);

fs.writeFileSync('src/components/domain/CommentSection.tsx', content, 'utf8');
