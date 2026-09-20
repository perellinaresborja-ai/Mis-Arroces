"use client"

export function CookiePreferencesButton() {
  return (
    <button 
      onClick={() => {
        document.cookie = "cookie_consent=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.reload();
      }}
      className="px-6 py-2 bg-muted border border-border rounded-xl font-medium hover:bg-muted/80 text-foreground"
    >
      Configurar / Revocar Preferencias de Cookies
    </button>
  )
}
