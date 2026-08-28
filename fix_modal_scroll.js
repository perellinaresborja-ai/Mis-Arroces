const fs = require('fs');
let code = fs.readFileSync('src/components/domain/FollowsModal.tsx', 'utf8');

code = code.replace(/className="overflow-y-auto flex-1 p-4"/g, 'className="overflow-y-auto flex-1 p-4 pb-48"');

fs.writeFileSync('src/components/domain/FollowsModal.tsx', code);
