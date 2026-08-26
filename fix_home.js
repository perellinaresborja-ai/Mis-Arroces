const fs = require('fs');

let page = fs.readFileSync('src/app/page.tsx', 'utf8');

// Remove redirect
page = page.replace(
  /if \(!user\) \{\s*const \{ redirect \} = await import\("next\/navigation"\)\s*redirect\("\/login"\)\s*\}/,
  ''
);

// Add Guest CTA in the JSX if !user
const jsxToFind = `<div className="mt-8 relative z-10 w-full max-w-2xl mx-auto space-y-6">`;
const guestCta = `
          {!user && (
            <div className="bg-muted/30 border border-border p-6 rounded-3xl flex flex-col items-center justify-center text-center gap-4 shadow-sm mb-6">
              <h2 className="text-xl font-bold font-serif text-charcoal">Únete a Mis Arroces</h2>
              <p className="text-sm text-muted-foreground">Únete a Mis Arroces para guardar recetas, comentar y compartir tus elaboraciones.</p>
              <div className="flex gap-3 w-full sm:w-auto mt-2">
                <Link href="/login" className={buttonVariants({ className: "rounded-xl font-bold bg-olive hover:bg-olive/90 text-white" })}>Crear cuenta</Link>
                <Link href="/login" className={buttonVariants({ variant: "outline", className: "rounded-xl font-bold" })}>Iniciar sesión</Link>
              </div>
            </div>
          )}
`;

page = page.replace(jsxToFind, jsxToFind + guestCta);

// Fix profile check when user exists
page = page.replace(
  `const { data: profile } = await supabase.from("profiles").select("onboarding_completed").eq("id", user.id).single()
  if (!profile?.onboarding_completed) {
    const { redirect } = await import("next/navigation")
    redirect("/onboarding")
  }`,
  `if (user) {
    const { data: profile } = await supabase.from("profiles").select("onboarding_completed").eq("id", user.id).single()
    if (!profile?.onboarding_completed) {
      const { redirect } = await import("next/navigation")
      redirect("/onboarding")
    }
  }`
);

fs.writeFileSync('src/app/page.tsx', page, 'utf8');
