const fs = require('fs');

function fixUseClient(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  // Remove all instances of "use client" (with or without semicolon)
  code = code.replace(/"use client"\s*;?\s*/g, '');
  code = code.replace(/'use client'\s*;?\s*/g, '');
  
  // Clean up any weird empty lines at the very top
  code = code.trimStart();
  
  // Add exactly one "use client" at the very top
  code = '"use client"\n' + code;
  
  fs.writeFileSync(file, code);
}

fixUseClient('src/components/domain/DesktopNav.tsx');
fixUseClient('src/components/domain/BottomNav.tsx');
