const fs = require('fs');
let code = fs.readFileSync('src/components/domain/FeedCard.tsx', 'utf8');

const regex = /<header className="flex items-center justify-between">[\s\S]*?<\/header>/;

const newHeader = `<header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={\`/@\${user.username}\`} className="w-10 h-10 rounded-full bg-muted overflow-hidden shrink-0 block">
            {avatar && <img src={avatar} alt={user.username} className="w-full h-full object-cover" />}
          </Link>
          <div>
            <div className="flex items-center">
              <Link href={\`/@\${user.username}\`} className="font-bold text-[15px] hover:underline">
                {user.display_name || \`@\${user.username}\`}
              </Link>
            </div>
            {user.display_name && (
              <div className="text-[13px] text-muted-foreground flex items-center gap-1">
                <Link href={\`/@\${user.username}\`} className="hover:underline">@{user.username}</Link> <span>·</span> {formatRelativeTime(createdAt)}
              </div>
            )}
          </div>
        </div>
        
        <div className="shrink-0 ml-2">
          {currentUserId !== user.id && (
            <FeedFollowButton 
              isAuthenticated={!!currentUserId} 
              initialStatus={followStatus || null} 
              targetId={user.id} 
              isPrivate={user.privacy_level === 'PRIVATE'} 
            />
          )}
        </div>
      </header>`;

code = code.replace(regex, newHeader);
fs.writeFileSync('src/components/domain/FeedCard.tsx', code);
console.log("REPLACED HEADER ALIGNMENT!");
