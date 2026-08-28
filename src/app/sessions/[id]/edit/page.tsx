import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { EditSessionClient } from "./EditSessionClient"

export default async function EditSessionPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: session } = await supabase
    .from("cooking_sessions")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single()

  if (!session) redirect("/")

  return (
    <div className="max-w-2xl mx-auto p-4 pt-12 md:pt-24 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Editar Cocinado</h1>
      <EditSessionClient session={session} />
    </div>
  )
}
