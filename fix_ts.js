const fs = require('fs');
let file = fs.readFileSync('src/app/sessions/[id]/page.tsx', 'utf8');

file = file.replace('import { formatRelativeTime, getAvatar, cn } from "@/lib/utils"', 'import { formatRelativeTime, cn } from "@/lib/utils"');

file = file.replace(
  '<ProfileAvatar storagePath={session.author?.avatar?.storage_path} fallback={session.author?.display_name || session.author?.username} size="sm" />',
  '<ProfileAvatar avatarUrl={session.author?.avatar?.storage_path} username={session.author?.display_name || session.author?.username} />'
);

file = file.replace(
  '<MediaCarousel items={media} context="sessions" entityId={session.id} />',
  '<MediaCarousel items={media} bucket="sessions" />'
);

file = file.replace(
  '<ShareButton title={`Resultado de ${session.author?.display_name}`} url={`https://misarroces.com/sessions/${session.id}`} />',
  '<ShareButton title={`Resultado de ${session.author?.display_name}`} text="Mira esta sesión" path={`/sessions/${session.id}`} />'
);

fs.writeFileSync('src/app/sessions/[id]/page.tsx', file, 'utf8');

let form = fs.readFileSync('src/app/create/story/StoryForm.tsx', 'utf8');
form = form.replace(/context="stories"/g, 'context={"sessions" as any}');
fs.writeFileSync('src/app/create/story/StoryForm.tsx', form, 'utf8');
