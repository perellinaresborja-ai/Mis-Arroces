const fs = require('fs');

let code = fs.readFileSync('src/components/domain/SharedStoryRenderer.tsx', 'utf8');

code = code.replace(
  /onClick=\{\(e\) => \{\n\s*if \(\['POLL'/,
  `data-story-interactive={['POLL', 'QUESTION', 'SLIDER', 'MENTION', 'LOCATION', 'RECIPE', 'INGREDIENT', 'SESSION', 'PROFILE'].includes(overlay.type) ? "true" : undefined}
                onClick={(e) => {
                  if (['POLL'`
);

fs.writeFileSync('src/components/domain/SharedStoryRenderer.tsx', code);
console.log('Fixed SharedStoryRenderer interactive data attribute');
