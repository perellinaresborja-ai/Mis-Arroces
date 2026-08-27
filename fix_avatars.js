const fs = require('fs');

// Fix messaging.ts
let msgCode = fs.readFileSync('src/app/actions/messaging.ts', 'utf8');
msgCode = msgCode.replace(
  "user:profiles!inner(id, username, display_name, avatar_media_id)",
  "user:profiles!inner(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path))"
);
fs.writeFileSync('src/app/actions/messaging.ts', msgCode);

// Fix page.tsx (Chat Header)
let pageCode = fs.readFileSync('src/app/messages/[conversationId]/page.tsx', 'utf8');
pageCode = pageCode.replace(
  "user:profiles!inner(id, username, display_name)",
  "user:profiles!inner(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path))"
);

pageCode = pageCode.replace(
  '<div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center font-bold">\n          {otherMember?.user?.username?.[0]?.toUpperCase()}\n        </div>',
  `{otherMember?.user?.avatar?.storage_path ? (
          <img src={\`\${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/recipe_media/\${otherMember.user.avatar.storage_path}\`} className="w-10 h-10 rounded-full object-cover shrink-0" alt="" />
        ) : (
          <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center font-bold shrink-0">
            {otherMember?.user?.username?.[0]?.toUpperCase()}
          </div>
        )}`
);
fs.writeFileSync('src/app/messages/[conversationId]/page.tsx', pageCode);

// Fix MessagesLayoutClient.tsx (Inbox List)
let layoutCode = fs.readFileSync('src/components/domain/messages/MessagesLayoutClient.tsx', 'utf8');
layoutCode = layoutCode.replace(
  "{c.otherMember?.user?.avatar_media_id ? (\n                      <img src={c.otherMember.user.avatar_media_id} className=\"w-full h-full object-cover\" alt=\"\" />\n                    ) : (",
  `{c.otherMember?.user?.avatar?.storage_path ? (
                      <img src={\`\${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/recipe_media/\${c.otherMember.user.avatar.storage_path}\`} className="w-full h-full object-cover" alt="" />
                    ) : (`
);
fs.writeFileSync('src/components/domain/messages/MessagesLayoutClient.tsx', layoutCode);
