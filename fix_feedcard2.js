const fs = require('fs');
let code = fs.readFileSync('src/components/domain/FeedCard.tsx', 'utf8');

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

if (code.includes(targetHeader)) {
    code = code.replace(targetHeader, newHeader);
    fs.writeFileSync('src/components/domain/FeedCard.tsx', code);
    console.log("REPLACED EXACTLY");
} else {
    // try a more fuzzy replace
    const regex = /<div className="font-bold text-\[15px\] group-hover:underline">\s*\{user\.display_name \|\| \`@\$\{user\.username\}\`\}\s*<\/div>/s;
    if (regex.test(code)) {
        code = code.replace(regex, newHeader);
        fs.writeFileSync('src/components/domain/FeedCard.tsx', code);
        console.log("REPLACED FUZZY");
    } else {
        console.log("NOT FOUND AT ALL");
    }
}
