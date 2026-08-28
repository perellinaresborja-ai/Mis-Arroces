const fs = require('fs');
let code = fs.readFileSync('src/app/[userParam]/page.tsx', 'utf8');

// 1. Import FollowsModal
if (!code.includes('FollowsModal')) {
    code = code.replace(
        /import \{ ProfileGridCard \} from "@\/components\/domain\/ProfileGridCard"/,
        `import { ProfileGridCard } from "@/components/domain/ProfileGridCard"\nimport { FollowsModal } from "@/components/domain/FollowsModal"`
    );
}

// 2. Replace the static stats with FollowsModal
const targetStats = `<div className="flex flex-col items-center">
              <span className="font-bold text-foreground text-[17px] leading-none">{followersCount || 0}</span>
              <span className="text-muted-foreground text-[11px] uppercase tracking-wider mt-1">Seguidores</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-foreground text-[17px] leading-none">{followingCount || 0}</span>
              <span className="text-muted-foreground text-[11px] uppercase tracking-wider mt-1">Siguiendo</span>
            </div>`;

const newStats = `<FollowsModal 
              targetUserId={profile.id} 
              currentUserId={user?.id || null} 
              followersCount={followersCount || 0} 
              followingCount={followingCount || 0} 
            />`;

if (code.includes(targetStats)) {
    code = code.replace(targetStats, newStats);
    fs.writeFileSync('src/app/[userParam]/page.tsx', code);
    console.log("REPLACED STATS IN PROFILE");
} else {
    // Try fuzzy
    const regex = /<div className="flex flex-col items-center">\s*<span className="font-bold text-foreground text-\[17px\] leading-none">\{followersCount \|\| 0\}<\/span>\s*<span className="text-muted-foreground text-\[11px\] uppercase tracking-wider mt-1">Seguidores<\/span>\s*<\/div>\s*<div className="flex flex-col items-center">\s*<span className="font-bold text-foreground text-\[17px\] leading-none">\{followingCount \|\| 0\}<\/span>\s*<span className="text-muted-foreground text-\[11px\] uppercase tracking-wider mt-1">Siguiendo<\/span>\s*<\/div>/;
    if (regex.test(code)) {
        code = code.replace(regex, newStats);
        fs.writeFileSync('src/app/[userParam]/page.tsx', code);
        console.log("REPLACED STATS IN PROFILE FUZZY");
    } else {
        console.log("STATS NOT FOUND");
    }
}
