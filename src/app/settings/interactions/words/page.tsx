import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { addHiddenWord, removeHiddenWord } from "@/app/actions/settings"
import AddWordForm from "./components/AddWordForm"

export default async function HiddenWordsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/auth")
  }

  // Fetch hidden words
  const { data: words } = await (supabase as any).from('hidden_words')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-[100dvh] bg-background pb-20">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <header className="flex items-center gap-4 mb-4">
          <Link href="/settings" className="p-2 -ml-2 rounded-full hover:bg-muted transition">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold">Palabras ocultas</h1>
        </header>
        <p className="text-muted-foreground text-sm mb-8 pl-12 -mt-4">
          Los comentarios en tus publicaciones que contengan estas palabras no serán visibles para nadie (excepto para quien los escribió).
        </p>

        <AddWordForm />

        <div className="mt-6 bg-card rounded-3xl border border-border overflow-hidden">
          {(!words || words.length === 0) ? (
            <p className="text-muted-foreground text-center py-8">No has ocultado ninguna palabra.</p>
          ) : (
            <div className="flex flex-col">
              {words.map((w, index) => (
                <div key={w.id} className={"flex items-center justify-between p-4 "}>
                  <p className="font-medium">{w.word}</p>
                  <form action={async (formData) => { "use server"; await removeHiddenWord(formData); }}>
                    <input type="hidden" name="wordId" value={w.id} />
                    <button type="submit" className="text-sm text-red-500 font-medium hover:text-red-600 transition p-2">
                      Eliminar
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


