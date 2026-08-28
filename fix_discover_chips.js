const fs = require('fs');

let code = fs.readFileSync('src/app/discover/page.tsx', 'utf8');

const oldChips = `{/* Quick Chips Concept */}
          <section>
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
              {varieties?.slice(0, 4).map(v => (
                <Link key={v.id} href={\`/discover?q=\${v.name}&tab=arroces&variety=\${v.id}\`} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-full text-sm font-bold whitespace-nowrap shrink-0 hover:bg-secondary/80 transition">
                  {v.name}
                </Link>
              ))}
              {styles?.slice(0, 3).map(s => (
                <Link key={s.id} href={\`/discover?q=\${s.name}&tab=arroces&style=\${s.id}\`} className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-bold whitespace-nowrap shrink-0 hover:bg-primary/20 transition">
                  {s.name}
                </Link>
              ))}
            </div>
          </section>`;

const newChips = `{/* Quick Chips Concept */}
          <section>
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
              {['Seco', 'Caldoso', 'Meloso'].map(term => (
                <Link key={term} href={\`/discover?q=\${term}&tab=arroces\`} className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-bold whitespace-nowrap shrink-0 hover:bg-primary/20 transition">
                  {term}
                </Link>
              ))}
              {['Pescado', 'Marisco', 'Carne', 'Verdura'].map(term => (
                <Link key={term} href={\`/discover?q=\${term}&tab=arroces\`} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-full text-sm font-bold whitespace-nowrap shrink-0 hover:bg-secondary/80 transition">
                  {term}
                </Link>
              ))}
            </div>
          </section>`;

code = code.replace(oldChips, newChips);

fs.writeFileSync('src/app/discover/page.tsx', code);
