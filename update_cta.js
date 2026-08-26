const fs = require('fs');

const path = 'src/components/domain/StoriesViewer.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace the Recipe CTA
content = content.replace(
  /\{\/\* Linked Content CTA \*\/\}\s*\{currentStory\.recipe_id && \([\s\S]*?<\/Link>\s*<\/div>\s*\)\}/m,
  `{/* Linked Content CTA */}
        {currentStory.recipe_id && (
          <div className="absolute bottom-24 left-0 w-full flex justify-center z-20 pointer-events-none px-4">
            <Link 
              href={\`/recipes/\${currentStory.recipe_id}\`} 
              className="w-full max-w-sm flex items-center bg-zinc-900/90 backdrop-blur-md rounded-2xl p-2 gap-3 shadow-2xl pointer-events-auto transition-transform hover:scale-105 border border-white/10"
            >
              {currentStory.recipe?.recipe_media?.[0]?.media?.storage_path ? (
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                  <img 
                    src={\`https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/\${currentStory.recipe.recipe_media[0].media.storage_path}\`} 
                    alt="Recipe"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-white/10 shrink-0 flex items-center justify-center">
                  <span className="text-white/50 text-xs font-bold">R</span>
                </div>
              )}
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[10px] text-white/70 font-bold uppercase tracking-wider">Ver receta</p>
                <p className="text-sm font-bold text-white truncate">{currentStory.recipe?.name || "Receta compartida"}</p>
              </div>
              <div className="w-6 h-6 shrink-0 mr-1 flex items-center justify-center text-white/50">
                &rarr;
              </div>
            </Link>
          </div>
        )}`
);

// Replace the Session CTA
content = content.replace(
  /\{currentStory\.session_id && \([\s\S]*?<\/Link>\s*<\/div>\s*\)\}/m,
  `{currentStory.session_id && (
          <div className="absolute bottom-24 left-0 w-full flex justify-center z-20 pointer-events-none px-4">
            <Link 
              href={\`/sessions/\${currentStory.session_id}\`} 
              className="w-full max-w-sm flex items-center bg-zinc-900/90 backdrop-blur-md rounded-2xl p-2 gap-3 shadow-2xl pointer-events-auto transition-transform hover:scale-105 border border-white/10"
            >
              {currentStory.session?.session_media?.[0]?.media?.storage_path ? (
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                  <img 
                    src={\`https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/\${currentStory.session.session_media[0].media.storage_path}\`} 
                    alt="Session"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-white/10 shrink-0 flex items-center justify-center">
                  <span className="text-white/50 text-xs font-bold">C</span>
                </div>
              )}
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[10px] text-white/70 font-bold uppercase tracking-wider">Ver resultado</p>
                <p className="text-sm font-bold text-white truncate">Sesión de cocinado</p>
              </div>
              <div className="w-6 h-6 shrink-0 mr-1 flex items-center justify-center text-white/50">
                &rarr;
              </div>
            </Link>
          </div>
        )}`
);

fs.writeFileSync(path, content, 'utf8');
