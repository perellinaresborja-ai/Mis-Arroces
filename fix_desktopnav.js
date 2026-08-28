const fs = require('fs');
let code = fs.readFileSync('src/components/domain/DesktopNav.tsx', 'utf8');

// 1. Add imports
code = code.replace(
  /import \{ usePathname \} from "next\/navigation"/,
  `import { usePathname } from "next/navigation"\nimport { useEffect, useState } from "react"\nimport { createClient } from "@/lib/supabase/client"`
);

// 2. Add state and effect
const stateAndEffect = `  const pathname = usePathname()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles')
          .select(\`avatar:media_assets!fk_profiles_avatar(storage_path)\`)
          .eq('id', user.id)
          .single();
          
        // @ts-ignore
        if (data?.avatar?.storage_path) {
          // @ts-ignore
          setAvatarUrl(\`https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/\${data.avatar.storage_path}\`);
        }
      }
    };
    fetchUser();
  }, []);`;

code = code.replace(/  const pathname = usePathname\(\)/, stateAndEffect);

// 3. Mark the Profile item with isAvatar: true
code = code.replace(
  /label: "Perfil",\s*\},/s,
  `label: "Perfil",\n      isAvatar: true\n    },`
);

// 4. Update the render loop
const oldRender = `<Icon className={cn(
                  "w-5 h-5",
                  isActive ? "text-primary" : "text-foreground"
                )} />`;

const newRender = `{item.isAvatar && avatarUrl ? (
                  <div className={cn(
                    "w-6 h-6 rounded-full overflow-hidden border-2 flex items-center justify-center shrink-0",
                    isActive ? "border-foreground" : "border-transparent"
                  )}>
                    <img src={avatarUrl} alt="Perfil" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <Icon className={cn(
                    "w-5 h-5",
                    isActive ? "text-primary" : "text-foreground"
                  )} />
                )}`;

code = code.replace(oldRender, newRender);

fs.writeFileSync('src/components/domain/DesktopNav.tsx', code);
console.log("DESKTOP NAV UPDATED");
