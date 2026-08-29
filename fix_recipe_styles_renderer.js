const fs = require('fs');
let code = fs.readFileSync('src/components/domain/SharedStoryRenderer.tsx', 'utf8');

const recipeRegex = /case 'RECIPE': \{[\s\S]*?return <div onClick=\{handleClick\}[\s\S]*?<\/div>;\s*\}/s;

const newRecipeRenderer = `case 'RECIPE': {
      const p = overlay.payload;
      const style = p.displayStyle || 'compact';

      const handleClick = (e: any) => { 
        e.stopPropagation();
        if (mode === 'VIEWER') window.location.href = '/recipes/' + p.recipeId; 
      };

      if (style === 'compact') {
        return (
          <div onClick={handleClick} className="bg-card border border-border text-foreground px-3 py-1.5 rounded-full font-bold flex items-center gap-2 shadow-xl cursor-pointer text-sm pointer-events-auto transition-transform hover:scale-105">
            <span className="truncate max-w-[150px]">{p.title || 'Receta'}</span>
            <span className="text-primary text-xs ml-1 border-l pl-2 border-border/50">Ver</span>
          </div>
        );
      }

      if (style === 'text') {
        return (
          <div onClick={handleClick} className="text-white drop-shadow-md px-2 py-1 flex flex-col items-center cursor-pointer pointer-events-auto hover:opacity-80 transition-opacity">
            <span className="font-bold text-lg">{p.title || 'Receta'}</span>
            <span className="text-xs bg-black/40 px-2 py-0.5 rounded-full mt-1">Ver receta ➔</span>
          </div>
        );
      }

      return (
        <div onClick={handleClick} className="bg-card rounded-2xl overflow-hidden shadow-2xl border border-border flex flex-col w-48 cursor-pointer pointer-events-auto transition-transform hover:scale-105">
          <div className="h-28 bg-muted relative">
            {p.coverUrl ? (
              <img src={p.coverUrl} className="w-full h-full object-cover" alt={p.title} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground"><Utensils size={32} opacity={0.5}/></div>
            )}
          </div>
          <div className="p-3 flex flex-col gap-1 text-center bg-card">
            <span className="font-bold text-foreground text-sm truncate">{p.title || 'Receta'}</span>
            <span className="text-xs font-semibold text-primary">Ver receta</span>
          </div>
        </div>
      );
    }`;

code = code.replace(recipeRegex, newRecipeRenderer);
fs.writeFileSync('src/components/domain/SharedStoryRenderer.tsx', code);
console.log('Patched renderer for recipe styles');
