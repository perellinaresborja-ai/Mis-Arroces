const fs = require('fs');

let code = fs.readFileSync('src/components/domain/PostOptionsMenu.tsx', 'utf8');

code = code.replace(
  /export function PostOptionsMenu\(\{[\s\S]*?\}\) \{/,
  `export function PostOptionsMenu({ 
  entityType, 
  entityId, 
  allowComments, 
  onDeleted,
  isPinned,
  hidePin
}: { 
  entityType: string
  entityId: string
  allowComments: boolean
  onDeleted?: () => void 
  isPinned?: boolean
  hidePin?: boolean
}) {`
);

fs.writeFileSync('src/components/domain/PostOptionsMenu.tsx', code);
console.log('Fixed signature');
