const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('src/components/domain/InteractiveRecipeView.tsx');
let code = fs.readFileSync(targetFile, 'utf8');

const targetStr = '<div className="bg-card rounded-3xl border border-border p-6 md:p-8 mb-8 overflow-hidden shadow-sm">\n        <ul className="space-y-1">';

const replacementStr = `<div className="bg-card rounded-3xl border border-border p-6 md:p-8 mb-8 overflow-hidden shadow-sm">
        <h3 className="text-xl font-bold font-serif text-charcoal mb-6">Ingredientes</h3>
        <ul className="space-y-1">`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacementStr);
  fs.writeFileSync(targetFile, code, 'utf8');
  console.log("Added 'Ingredientes' title above the list successfully!");
} else {
  console.log("Could not find the target string.");
}
