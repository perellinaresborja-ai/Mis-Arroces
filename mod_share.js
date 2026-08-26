const fs = require('fs');
let content = fs.readFileSync('src/components/domain/ShareButton.tsx', 'utf8');

const logic = `
  const recipeMatch = path.match(/\\/recipes\\/([^/?]+)/);
  const sessionMatch = path.match(/\\/sessions\\/([^/?]+)/);
  const recipeId = recipeMatch ? recipeMatch[1] : null;
  const sessionId = sessionMatch ? sessionMatch[1] : null;
`;
content = content.replace('const baseUrl = ', logic + '\n  const baseUrl = ');

const button = `
          {isAuth && (recipeId || sessionId) && (
            <Button className="w-full justify-start rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 mt-2" variant="default" onClick={() => {
              window.location.href = \`/create/story?\${recipeId ? \`recipe_id=\${recipeId}\` : \`session_id=\${sessionId}\`}\`
            }}>
              Añadir a mi Story
            </Button>
          )}
`;
content = content.replace(/<\/div>\s*<\/div>\s*<\/div>\s*\)\s*}\s*\)/, `</div>\n${button}\n        </div>\n      </div>\n    )\n  }\n)`);

fs.writeFileSync('src/components/domain/ShareButton.tsx', content, 'utf8');
