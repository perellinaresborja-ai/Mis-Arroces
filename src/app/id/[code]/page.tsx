import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Shield, CheckCircle2, User, ArrowRight, ExternalLink } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  return {
    title: `ID Oficial · misarroces`,
    description: `Identificación digital oficial de miembro en misarroces.es`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function MemberIdPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const cleanCode = code?.trim();

  if (!cleanCode || !/^[a-zA-Z0-9_-]{6,64}$/.test(cleanCode)) {
    notFound();
  }

  const supabase = await createClient();

  // Buscar la identidad pública por su código único permanente
  const { data: identity, error: identityErr } = await supabase
    .from("user_identities" as any)
    .select(`
      id,
      public_code,
      is_active,
      created_at,
      user_id
    `)
    .eq("public_code", cleanCode)
    .maybeSingle();

  let isFounder = false;
  let formattedFounderNumber: string | null = null;
  let displayName = "";
  let username = "";
  let avatarUrl = "https://www.misarroces.es/logopaellaicono.png";

  // Si no existe o está desactivada en DB
  if (identityErr || !identity || !(identity as any).is_active) {
    // Si es el código de demostración para pruebas de Fundador #099
    if (cleanCode === "a8f9c1e2b4d63f01") {
      isFounder = true;
      formattedFounderNumber = "099";
      displayName = "Borja";
      username = "perellinares";
    } else {
      return (
        <main className="min-h-screen bg-[#F7F5F0] flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-card border border-border rounded-3xl p-6 text-center shadow-lg">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-foreground mb-1">ID no disponible</h1>
            <p className="text-sm text-muted-foreground mb-5">
              Este identificador no existe o ha sido revocado.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground font-bold text-sm rounded-xl"
            >
              Ir a misarroces.es
            </Link>
          </div>
        </main>
      );
    }
  } else {
    // Cargar datos del perfil y condición de Fundador desde Supabase
    const userId = (identity as any).user_id;

    const [profileRes, founderRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path)")
        .eq("id", userId)
        .maybeSingle(),
      supabase
        .from("founders" as any)
        .select("founder_number")
        .eq("user_id", userId)
        .maybeSingle(),
    ]);

    const profile = profileRes.data;
    if (!profile) {
      notFound();
    }

    const founderData = founderRes.data as any;
    isFounder = typeof founderData?.founder_number === "number" && founderData.founder_number >= 0 && founderData.founder_number <= 99;
    formattedFounderNumber = isFounder ? String(founderData.founder_number).padStart(3, "0") : null;

    displayName = profile.display_name || `@${profile.username}`;
    username = profile.username;
    avatarUrl = profile.avatar?.storage_path
      ? `https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${profile.avatar.storage_path}`
      : "https://www.misarroces.es/logopaellaicono.png";
  }

  const qrImageUrl = `/api/qr/${cleanCode}`;

  return (
    <main className="min-h-screen bg-[#F7F5F0] flex flex-col items-center justify-center p-4 py-8">
      {/* Contenedor Principal */}
      <div className="w-full max-w-[340px] flex flex-col items-center">
        
        {/* Indicador de Estado Discreto */}
        <div className="inline-flex items-center gap-1.5 bg-emerald-50/80 border border-emerald-200/80 text-emerald-700 px-3 py-0.5 rounded-full text-[11px] font-medium mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
          <span>ID válido</span>
        </div>

        {/* Tarjeta ID Vertical (Aprobada) */}
        <div className="w-full bg-[#FAF8F5] border-[1.5px] border-[#EA580C] rounded-[24px] p-2 shadow-xl text-center relative overflow-hidden">
          <div className="border border-[#EAE3D7] rounded-[18px] p-4 bg-[#FDFBF7]">
            
            {/* Encabezado con logo e icono paella */}
            <div className="flex items-center justify-center gap-1.5 mb-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logopaellaicono.png"
                alt="Icono paella"
                className="w-5 h-5 object-contain"
              />
              <span className="text-[16px] font-black tracking-tight text-[#18181B] leading-none">
                mis<span className="text-[#EA580C]">arroces</span>
              </span>
            </div>

            {/* Distinción Admin / Fundador / Usuario */}
            {username === 'perellinares' ? (
              <div className="inline-block bg-white border border-[#18181B] rounded-full px-2.5 py-0.5 text-[8.5px] font-extrabold text-[#18181B] tracking-widest uppercase mb-2 shadow-2xs">
                ID ADMIN
              </div>
            ) : isFounder ? (
              <div className="inline-block bg-white border border-[#EA580C] rounded-full px-2.5 py-0.5 text-[8.5px] font-extrabold text-[#EA580C] tracking-widest uppercase mb-2 shadow-2xs">
                ID FUNDADOR
              </div>
            ) : (
              <div className="inline-block bg-white border border-zinc-300 rounded-full px-2.5 py-0.5 text-[8.5px] font-extrabold text-zinc-600 tracking-widest uppercase mb-2 shadow-2xs">
                ID misarroces
              </div>
            )}

            {/* Número protagonista de Fundador (si aplica) */}
            {isFounder && (
              <div className="text-4xl font-black tracking-tight text-[#18181B] leading-none mb-1 font-mono whitespace-nowrap">
                <span className="text-[#18181B] text-3xl font-extrabold mr-0.5">#</span>
                {formattedFounderNumber}
              </div>
            )}

            {/* @usuario actual */}
            <div className="text-[14.5px] font-extrabold text-[#18181B] truncate leading-tight mt-1.5 mb-3">
              @{username}
            </div>

            {/* QR Centrado */}
            <div className="bg-white p-2 rounded-xl border border-zinc-200 shadow-sm inline-block mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrImageUrl}
                alt={`QR ID ${cleanCode}`}
                className="w-[104px] h-[104px] rounded-md block"
                width={104}
                height={104}
              />
            </div>

            {/* Pie de ID con micro-sello */}
            <div className="border-t border-dashed border-[#E0D8CB] pt-2 mt-0.5">
              {isFounder ? (
                <>
                  <div className="text-[9.5px] font-extrabold text-[#18181B] tracking-widest uppercase leading-tight mb-0.5">
                    ✦ LOS 100 ✦
                  </div>
                  <div className="text-[9px] font-bold text-zinc-400 tracking-tight leading-tight">
                    misarroces.es
                  </div>
                </>
              ) : (
                <div className="text-[9px] font-bold text-zinc-400 tracking-wider uppercase leading-tight">
                  COMUNIDAD · misarroces.es
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Botón para ver perfil completo */}
        <div className="w-full mt-4 flex flex-col gap-2">
          <Link
            href={`/@${username}`}
            className="w-full flex items-center justify-center gap-2 bg-[#18181B] hover:bg-black text-white font-bold text-xs py-3 px-4 rounded-2xl shadow-sm transition-all active:scale-98"
          >
            <span>Ver perfil en misarroces</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#EA580C]" />
          </Link>
        </div>

        {/* Footer legal */}
        <p className="text-[10px] text-zinc-400 mt-5 text-center">
          Identificación digital intransferible · © 2026 misarroces.es
        </p>

      </div>
    </main>
  );
}
