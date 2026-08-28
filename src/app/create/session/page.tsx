import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function CreateSessionRedirectPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }

  // To create a session, you must select a recipe first.
  // We'll redirect the user to their cookbook with a query param
  redirect("/cookbook?action=cook");
}
