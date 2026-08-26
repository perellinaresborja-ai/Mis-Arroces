const fs = require('fs');

let file = fs.readFileSync('src/components/domain/OwnerRecipeActions.tsx', 'utf8');

if (!file.includes('EntityInsightsModal')) {
  file = file.replace(
    'import Link from "next/link"',
    'import Link from "next/link"\nimport { EntityInsightsModal } from "./EntityInsightsModal"\nimport { BarChart2 } from "lucide-react"'
  );
  
  file = file.replace(
    'const [menuOpen, setMenuOpen] = useState(false)',
    'const [menuOpen, setMenuOpen] = useState(false)\n  const [insightsOpen, setInsightsOpen] = useState(false)'
  );
  
  const insightsBtn = `              <button 
                onClick={() => { setInsightsOpen(true); setMenuOpen(false); }}
                className="w-full flex items-center px-4 py-3 text-sm font-medium hover:bg-muted transition-colors border-b border-border"
              >
                <BarChart2 className="w-4 h-4 mr-3" />
                Ver estadísticas
              </button>`;

  // Inject before handleRevertDraft button
  const revertBtn = `<button 
                onClick={handleRevertDraft}`;
  
  file = file.replace(revertBtn, insightsBtn + '\n              ' + revertBtn);
  
  const modalInject = `<EntityInsightsModal 
        isOpen={insightsOpen} 
        onClose={() => setInsightsOpen(false)} 
        entityType="RECIPE" 
        entityId={recipeId} 
      />`;
      
  file = file.replace(
    '</>',
    modalInject + '\n    </>'
  );

  fs.writeFileSync('src/components/domain/OwnerRecipeActions.tsx', file, 'utf8');
}
