const fs = require('fs');

let file = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');

if (!file.includes('EntityInsightsModal')) {
  file = file.replace(
    'import Link from "next/link"',
    'import Link from "next/link"\nimport { EntityInsightsModal } from "./EntityInsightsModal"\nimport { BarChart2 } from "lucide-react"'
  );
  
  file = file.replace(
    'const [showViewers, setShowViewers] = useState(false)',
    'const [showViewers, setShowViewers] = useState(false)\n  const [insightsOpen, setInsightsOpen] = useState(false)'
  );
  
  const footerOld = `        {/* Owner Viewers Footer */}
        {isMe && (
          <div className="absolute bottom-4 left-0 w-full flex justify-center z-30">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowViewers(true); setIsPaused(true); }}
              className="flex items-center gap-2 px-4 py-1.5 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-xs font-bold transition-colors"
            >
              <EyeIcon className="w-4 h-4" />
              Visto por {currentStory.viewCount || viewers.length}
            </button>
          </div>
        )}`;

  const footerNew = `        {/* Owner Viewers Footer */}
        {isMe && (
          <div className="absolute bottom-4 left-0 w-full flex justify-center z-30 gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowViewers(true); setIsPaused(true); }}
              className="flex items-center gap-2 px-4 py-1.5 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-xs font-bold transition-colors"
            >
              <EyeIcon className="w-4 h-4" />
              Visto por {currentStory.viewCount || viewers.length}
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setInsightsOpen(true); setIsPaused(true); }}
              className="flex items-center gap-2 px-4 py-1.5 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-xs font-bold transition-colors"
            >
              <BarChart2 className="w-4 h-4" />
              Estadísticas
            </button>
          </div>
        )}`;
  
  if (file.includes(footerOld)) {
      file = file.replace(footerOld, footerNew);
  } else {
      // Sometimes whitespace mismatch
      file = file.replace('Visto por {currentStory.viewCount || viewers.length}\n              </button>\n            </div>', 'Visto por {currentStory.viewCount || viewers.length}\n              </button>\n              <button onClick={(e) => { e.stopPropagation(); setInsightsOpen(true); setIsPaused(true); }} className="flex items-center gap-2 px-4 py-1.5 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-xs font-bold transition-colors"><BarChart2 className="w-4 h-4" />Estadísticas</button>\n            </div>');
  }

  // Inject modal before closing div
  const closingDiv = `    </div>
  )
}`;
  const modalInject = `
      <EntityInsightsModal 
        isOpen={insightsOpen} 
        onClose={() => { setInsightsOpen(false); setIsPaused(false); }} 
        entityType="STORY" 
        entityId={currentStory.id} 
      />
    </div>
  )
}`;
  file = file.replace(closingDiv, modalInject);
  fs.writeFileSync('src/components/domain/StoriesViewer.tsx', file, 'utf8');
}
