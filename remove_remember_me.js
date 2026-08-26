const fs = require('fs');
let content = fs.readFileSync('src/app/login/LoginForm.tsx', 'utf8');

const checkboxBlock = `<div className="flex items-center justify-between mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="remember" className="peer appearance-none w-5 h-5 border-2 border-border/80 rounded checked:bg-primary checked:border-primary transition-colors cursor-pointer" defaultChecked />
              <div className="absolute w-5 h-5 flex items-center justify-center pointer-events-none text-white opacity-0 peer-checked:opacity-100">
                <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 10L0 6.13636L1.5 4.68182L4 7.09091L10.5 0.795455L12 2.25L4 10Z" fill="currentColor"/></svg>
              </div>
              <span className="text-sm font-medium text-foreground">Recordar contraseña</span>
            </label>
          </div>`;

content = content.replace(checkboxBlock, "");

fs.writeFileSync('src/app/login/LoginForm.tsx', content, 'utf8');
