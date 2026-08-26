const fs = require('fs');
let file = fs.readFileSync('src/app/login/LoginForm.tsx', 'utf8');

file = file.replace(
  'type="email"',
  'type="email" autoComplete="email"'
);

file = file.replace(
  'type={showPassword ? "text" : "password"}',
  'type={showPassword ? "text" : "password"} autoComplete="current-password"'
);

fs.writeFileSync('src/app/login/LoginForm.tsx', file, 'utf8');
