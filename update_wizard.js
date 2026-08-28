const fs = require('fs');

let wizard = fs.readFileSync('src/app/onboarding/OnboardingWizard.tsx', 'utf8');

// Update imports
if (!wizard.includes('acceptActiveLegalDocuments')) {
  wizard = wizard.replace(
    /import \{ toggleFollow \} from "@\/app\/actions\/social"/,
    `import { toggleFollow } from "@/app/actions/social"\nimport { acceptActiveLegalDocuments } from "@/app/actions/legal"\nimport Link from "next/link"`
  );
}

// Add state for legal acceptance
if (!wizard.includes('const [legalAccepted')) {
  wizard = wizard.replace(
    /const \[step, setStep\] = useState\(1\)/,
    `const [step, setStep] = useState(1)\n  const [legalAccepted, setLegalAccepted] = useState(false)`
  );
}

// Update complete button in step 2 to go to step 3 instead
wizard = wizard.replace(
  /<Button onClick=\{handleComplete\} disabled=\{loading\} className="w-full font-bold rounded-xl bg-olive hover:bg-olive\/90 text-white">([\s\S]*?)<\/Button>[\s\S]*?<Button onClick=\{handleComplete\} disabled=\{loading\} variant="ghost" className="w-full font-bold rounded-xl text-muted-foreground">([\s\S]*?)<\/Button>/g,
  `<Button onClick={() => setStep(3)} disabled={loading} className="w-full font-bold rounded-xl bg-olive hover:bg-olive/90 text-white">
              Continuar
            </Button>
            <Button onClick={() => setStep(3)} disabled={loading} variant="ghost" className="w-full font-bold rounded-xl text-muted-foreground">
              Saltar este paso
            </Button>`
);

// Add step 3 JSX
const step3JSX = `
      {step === 3 && (
        <div className="bg-card border border-border p-6 rounded-3xl shadow-sm space-y-6">
          <div className="text-center space-y-2 mb-6">
            <h1 className="text-2xl font-bold font-serif text-charcoal">Casi terminamos</h1>
            <p className="text-muted-foreground text-sm">Para crear una cuenta en MisArroces, debes aceptar nuestras Condiciones de uso y confirmar que has leído nuestra Política de privacidad.</p>
          </div>

          <div className="space-y-4 mb-8">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center mt-1">
                <input 
                  type="checkbox"
                  className="peer sr-only"
                  checked={legalAccepted}
                  onChange={(e) => setLegalAccepted(e.target.checked)}
                />
                <div className="w-5 h-5 rounded border border-border bg-background peer-checked:bg-primary peer-checked:border-primary transition-colors flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
              </div>
              <span className="text-sm font-medium leading-relaxed select-none text-foreground group-hover:text-foreground/80">
                He leído y acepto las <Link href="/legal/terms" target="_blank" className="text-primary hover:underline">Condiciones de uso</Link> y confirmo que he leído la <Link href="/legal/privacy" target="_blank" className="text-primary hover:underline">Política de privacidad</Link>.
              </span>
            </label>
          </div>

          <div className="space-y-3 pt-4 border-t border-border">
            <Button 
              onClick={async () => {
                setLoading(true)
                try {
                  await acceptActiveLegalDocuments()
                  await completeOnboardingAction(inviteCode)
                  router.refresh()
                  router.push("/")
                } catch(e) {
                  setError("Error al completar el registro.")
                  setLoading(false)
                }
              }} 
              disabled={loading || !legalAccepted} 
              className="w-full font-bold rounded-xl bg-olive hover:bg-olive/90 text-white"
              size="lg"
            >
              {loading ? "Creando cuenta..." : "ACEPTAR Y CREAR CUENTA"}
            </Button>
            <Button onClick={() => setStep(2)} disabled={loading} variant="ghost" className="w-full font-bold rounded-xl text-muted-foreground">
              Atrás
            </Button>
          </div>
        </div>
      )}
`;

if (!wizard.includes('step === 3')) {
  wizard = wizard.replace(
    /<\/div>\n  \)\n\}/,
    `      ${step3JSX}\n    </div>\n  )\n}`
  );
}

// Update the progress bar to 3 steps
wizard = wizard.replace(
  /<div className=\{\`h-2 w-12 rounded-full \$\{step >= 2 \? 'bg-primary' : 'bg-muted'\}\`\} \/>/,
  `<div className={\`h-2 w-12 rounded-full \${step >= 2 ? 'bg-primary' : 'bg-muted'}\`} />
          <div className={\`h-2 w-12 rounded-full \${step >= 3 ? 'bg-primary' : 'bg-muted'}\`} />`
);
wizard = wizard.replace(
  /Paso \{step\} de 2/,
  `Paso {step} de 3`
);

fs.writeFileSync('src/app/onboarding/OnboardingWizard.tsx', wizard);
console.log("UPDATED ONBOARDING WIZARD");
