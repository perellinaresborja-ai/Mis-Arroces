"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function acceptFollowRequest(followerId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase
    .from("follows")
    .update({ status: 'ACCEPTED' })
    .match({ follower_id: followerId, following_id: user.id })

  if (error) throw new Error("Failed to accept")
  revalidatePath("/profile/requests")
}

export async function rejectFollowRequest(followerId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase
    .from("follows")
    .delete()
    .match({ follower_id: followerId, following_id: user.id })

  if (error) throw new Error("Failed to reject")
  revalidatePath("/profile/requests")
}
