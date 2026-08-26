const fs = require('fs');

let page = fs.readFileSync('src/app/[userParam]/page.tsx', 'utf8');

// Add import
page = page.replace(
  'import { InviteButton } from "@/components/domain/InviteButton"',
  'import { InviteButton } from "@/components/domain/InviteButton"\nimport { ProfileFollowButton } from "@/components/domain/ProfileFollowButton"'
);

// Replace form block
const formRegex = /\{\!isSelf && \([\s\S]*?<\/form>\s*<\/div>\s*\)\}/;

const replacement = `{!isSelf && (
              <div className="mt-5">
                {!user ? (
                  <ProfileFollowButton isAuthenticated={false} followStatus={null} targetId={profile.id} isPrivate={profile.privacy_level === "PRIVATE"} />
                ) : (
                  <form action={async () => {
                    "use server"
                    const { toggleFollow } = await import("@/app/actions/social")
                    await toggleFollow(profile.id, profile.privacy_level === "PRIVATE", followStatus)
                  }}>
                    <Button 
                      type="submit"
                      variant={followStatus === 'ACCEPTED' ? 'outline' : followStatus === 'PENDING' ? 'secondary' : 'default'} 
                      className="min-w-[120px] rounded-full font-bold shadow-sm"
                    >
                      {followStatus === 'ACCEPTED' ? 'Siguiendo' : followStatus === 'PENDING' ? 'Solicitud enviada' : 'Seguir'}
                    </Button>
                  </form>
                )}
              </div>
            )}`;

page = page.replace(formRegex, replacement);

fs.writeFileSync('src/app/[userParam]/page.tsx', page, 'utf8');
