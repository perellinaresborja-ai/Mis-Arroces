const fs = require('fs');

let code = fs.readFileSync('src/components/domain/ShareDMModal.tsx', 'utf8');

code = code.replace(
  /className="pl-9 border-border bg-muted\/50"/,
  `className="pl-9 border-border bg-muted/50 text-foreground font-medium"`
);

fs.writeFileSync('src/components/domain/ShareDMModal.tsx', code);
console.log("FIXED INPUT TEXT COLOR");
