const fs = require('fs');
let code = fs.readFileSync('src/components/domain/FeedCard.tsx', 'utf8');

// 1. Add props
code = code.replace(
  /user: \{\n    username: string/,
  `user: {\n    id: string\n    username: string\n    privacy_level?: string`
);

if (!code.includes('followStatus?: string | null')) {
  code = code.replace(
    /currentUserId: string \| null/,
    `currentUserId: string | null\n  followStatus?: string | null`
  );
}

// 2. Import FeedFollowButton
if (!code.includes('FeedFollowButton')) {
  code = code.replace(
    /import \{ useAuthPrompt \} from "@\/components\/providers\/AuthPromptProvider"/,
    `import { useAuthPrompt } from "@/components/providers/AuthPromptProvider"\nimport { FeedFollowButton } from "@/components/domain/FeedFollowButton"`
  );
}

// 3. Destructure followStatus
code = code.replace(
  /currentUserId,(\s*)postContent/,
  `currentUserId,\n  followStatus,\n  postContent`
);

// 4. Insert the button in the header
const targetHeader = `<div className="font-bold text-[15px] group-hover:underline">
              {user.display_name || \`@\${user.username}\`}
            </div>`;

const newHeader = `<div className="flex items-center">
              <div className="font-bold text-[15px] group-hover:underline">
                {user.display_name || \`@\${user.username}\`}
              </div>
              {currentUserId !== user.id && (
                <FeedFollowButton 
                  isAuthenticated={!!currentUserId} 
                  initialStatus={followStatus || null} 
                  targetId={user.id} 
                  isPrivate={user.privacy_level === 'PRIVATE'} 
                />
              )}
            </div>`;

code = code.replace(targetHeader, newHeader);

fs.writeFileSync('src/components/domain/FeedCard.tsx', code);
