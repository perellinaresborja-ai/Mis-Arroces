const fs = require('fs');

let f = fs.readFileSync('src/app/recipes/[id]/edit/EditRecipeForm.tsx', 'utf8');

// 1. Add ChevronUp, ChevronDown imports if missing
if (!f.includes('ChevronUp') && f.includes('lucide-react')) {
  f = f.replace(/import {([^}]+)} from "lucide-react"/, 'import { $1, ChevronUp, ChevronDown } from "lucide-react"');
}

// 2. Add CollapsibleSection component inside the file but outside the main component, or inside
// Let's put it outside the EditRecipeForm component.
const collapsibleComponent = `
function CollapsibleSection({ title, defaultOpen = false, children, rightAction }: { title: React.ReactNode, defaultOpen?: boolean, children: React.ReactNode, rightAction?: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)
  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden mb-8">
      <div className="flex justify-between items-center w-full p-4 md:p-6 hover:bg-muted/30 transition-colors bg-card cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <h2 className="font-bold text-lg text-charcoal flex-1">{title}</h2>
        <div className="flex items-center gap-4">
          {rightAction && <div onClick={e => e.stopPropagation()}>{rightAction}</div>}
          {isOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" /> : <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />}
        </div>
      </div>
      {isOpen && (
        <div className="p-4 md:p-6 pt-0 border-t border-border mt-4">
          {children}
        </div>
      )}
    </div>
  )
}
`;

if (!f.includes('function CollapsibleSection')) {
  // Put it right before `export default function EditRecipeForm`
  f = f.replace('export default function EditRecipeForm', collapsibleComponent + '\nexport default function EditRecipeForm');
}

// Make sure React is available for React.useState, React.ReactNode
if (!f.includes('import React')) {
  f = f.replace('import { useState', 'import React, { useState');
}

fs.writeFileSync('src/app/recipes/[id]/edit/EditRecipeForm.tsx', f, 'utf8');
