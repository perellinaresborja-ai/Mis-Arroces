import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function run() {
  // 1. Allergens
  const { data: allergens } = await supabase.from('allergens').select('*')
  
  const getAlg = (n: string) => allergens?.find(a => a.name.includes(n))?.id

  // 2. Ingredients
  const updates = [
    {
      name: 'arroz bomba',
      kcal: 350, protein: 7, carbs: 78, fat: 1, fiber: 1.5, salt: 0
    },
    {
      name: 'pollo',
      kcal: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, salt: 0.1
    },
    {
      name: 'caldo de pollo',
      kcal: 15, protein: 1, carbs: 1, fat: 1, fiber: 0, salt: 1.2
    },
    {
      name: 'gamba',
      kcal: 99, protein: 21, carbs: 0, fat: 1.5, fiber: 0, salt: 0.5,
      allergen: 'Crustáceos'
    },
    {
      name: 'calamar',
      kcal: 80, protein: 16, carbs: 2, fat: 1, fiber: 0, salt: 0.4,
      allergen: 'Moluscos'
    },
    {
      name: 'aceite',
      kcal: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, salt: 0
    }
  ]

  for (const up of updates) {
    const { data: ings } = await supabase.from('ingredients').select('id, name:normalized_name').ilike('normalized_name', `%${up.name}%`)
    if (ings && ings.length > 0) {
      for (const ing of ings) {
        await supabase.from('ingredients').update({
          kcal_per_100: up.kcal,
          protein_g_per_100: up.protein,
          carbs_g_per_100: up.carbs,
          fat_g_per_100: up.fat,
          fiber_g_per_100: up.fiber,
          salt_g_per_100: up.salt,
          nutrition_complete: true
        }).eq('id', ing.id)
        
        if (up.allergen) {
          const algId = getAlg(up.allergen)
          if (algId) {
            await supabase.from('ingredient_allergens').upsert({
              ingredient_id: ing.id,
              allergen_id: algId
            })
          }
        }
      }
      console.log(`Updated ${up.name}`)
    }
  }
}

run().catch(console.error)
