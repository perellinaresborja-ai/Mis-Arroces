const fs = require('fs');

let file = fs.readFileSync('src/components/domain/ShareButton.tsx', 'utf8');

if (!file.includes('createClient')) {
  file = file.replace(
    'import { Button } from "@/components/ui/button"',
    'import { Button } from "@/components/ui/button"\nimport { createClient } from "@/lib/supabase/client"'
  );
}

if (!file.includes('const [isAuth, setIsAuth] = useState(false)')) {
  file = file.replace(
    'const [isMounted, setIsMounted] = useState(false)',
    'const [isMounted, setIsMounted] = useState(false)\n  const [isAuth, setIsAuth] = useState(false)'
  );
  
  file = file.replace(
    'useEffect(() => setIsMounted(true), [])',
    `useEffect(() => {
    setIsMounted(true)
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => setIsAuth(!!user))
  }, [])`
  );
}

const shareStoryBtn = `<div className="mt-3">
              <Button variant="outline" className="w-full font-bold rounded-xl" size="lg" onClick={() => window.location.href = \`/create/story?share=\${encodeURIComponent(path)}\`}>
                
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                  Compartir en Historia
                
              </Button>
            </div>`;

const newShareStoryBtn = `{isAuth && (
            <div className="mt-3">
              <Button variant="outline" className="w-full font-bold rounded-xl" size="lg" onClick={() => window.location.href = \`/create/story?share=\${encodeURIComponent(path)}\`}>
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                  Compartir en Historia
              </Button>
            </div>
            )}`;

file = file.replace(shareStoryBtn, newShareStoryBtn);

fs.writeFileSync('src/components/domain/ShareButton.tsx', file, 'utf8');
