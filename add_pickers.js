const fs = require('fs');

let sp = fs.readFileSync('src/components/domain/stories/StickerPickers.tsx', 'utf8');

const newPickers = `
export function SessionPicker({ onSelect }: { onSelect: (s: { id: string, title: string, subtitle?: string, iconUrl?: string | null }) => void }) {
  const supabase = createClient()
  return <GenericSearchPicker 
    title="Sesión" icon={ChefHat} placeholder="Buscar sesión..."
    onSelect={onSelect}
    fetchResults={async (q) => {
      const { data } = await supabase.from('cooking_sessions').select('id, recipe_id').limit(10)
      return (data || []).map((s: { id: string, recipe_id: string }) => ({
        id: s.id,
        title: "Sesión " + s.id.substring(0, 5),
        subtitle: "Receta: " + s.recipe_id.substring(0, 5)
      }))
    }}
  />
}

export function ProfilePicker({ onSelect }: { onSelect: (u: { id: string, title: string, subtitle?: string, avatarUrl?: string | null }) => void }) {
  const supabase = createClient()
  return <GenericSearchPicker 
    title="Perfil" icon={UserIcon} placeholder="Buscar perfil..."
    onSelect={onSelect}
    fetchResults={async (q) => {
      const { data } = await supabase.from('profiles').select('id, username, display_name').ilike('username', \`%\${q}%\`).limit(10)
      return (data || []).map((u: { id: string, username: string, display_name: string | null }) => ({
        id: u.id,
        title: u.username,
        subtitle: u.display_name || '',
      }))
    }}
  />
}
`;

// Insert the new pickers before the LocationPicker
sp = sp.replace('export function LocationPicker', newPickers + '\nexport function LocationPicker');
fs.writeFileSync('src/components/domain/stories/StickerPickers.tsx', sp);
