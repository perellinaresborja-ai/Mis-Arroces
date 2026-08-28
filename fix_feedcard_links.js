const fs = require('fs');
let code = fs.readFileSync('src/components/domain/FeedCard.tsx', 'utf8');

const targetHeader = `<header className="flex items-center justify-between">
        <Link href={\`/@\${user.username}\`} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-muted overflow-hidden shrink-0">
            {avatar && <img src={avatar} alt={user.username} className="w-full h-full object-cover" />}
          </div>
          <div>
            <div className="flex items-center">
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
            </div>
            {user.display_name && (
              <div className="text-[13px] text-muted-foreground flex items-center gap-1">
                @{user.username} <span></span> {formatRelativeTime(createdAt)}
              </div>
            )}
          </div>
        </Link>
      </header>`;

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
              {currentUserId !== user.id && (
                <FeedFollowButton 
                  isAuthenticated={!!currentUserId} 
                  initialStatus={followStatus || null} 
                  targetId={user.id} 
                  isPrivate={user.privacy_level === 'PRIVATE'} 
                />
              )}
            </div>
            {user.display_name && (
              <div className="text-[13px] text-muted-foreground flex items-center gap-1">
                <Link href={\`/@\${user.username}\`} className="hover:underline">@{user.username}</Link> <span>·</span> {formatRelativeTime(createdAt)}
              </div>
            )}
          </div>
        </div>
      </header>`;

if (code.includes(targetHeader)) {
    code = code.replace(targetHeader, newHeader);
    fs.writeFileSync('src/components/domain/FeedCard.tsx', code);
    console.log("REPLACED HEADER EXACTLY");
} else {
    // try fuzzy replace
    console.log("Could not find exact block to replace");
}
