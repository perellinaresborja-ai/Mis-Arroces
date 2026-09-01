"use client"
import { useState } from "react";
import { Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function PrivacyToggle({ initialIsPrivate, userId }: { initialIsPrivate: boolean; userId: string }) {
  const [isPrivate, setIsPrivate] = useState(initialIsPrivate);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (loading) return;
    const nextState = !isPrivate;
    setIsPrivate(nextState);
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase.from("profiles").update({ privacy_level: nextState ? "PRIVATE" : "PUBLIC" }).eq("id", userId);
    } catch (e) {
      console.error(e);
      setIsPrivate(!nextState); // revert
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition cursor-pointer" onClick={handleToggle}>
      <div className="flex items-center gap-3">
        <Lock className="w-5 h-5 text-muted-foreground" />
        <div className="flex flex-col">
          <span className="font-medium text-foreground">Cuenta privada</span>
        </div>
      </div>
      <div className={`w-12 h-6 rounded-full p-1 transition-colors flex items-center ${isPrivate ? "bg-primary" : "bg-muted-foreground/30"}`}>
        <div className={`bg-white w-4 h-4 rounded-full shadow-sm transition-transform ${isPrivate ? "translate-x-6" : "translate-x-0"}`}></div>
      </div>
    </div>
  );
}
