const fs = require('fs');

let loginForm = fs.readFileSync('src/app/login/LoginForm.tsx', 'utf8');

if (!loginForm.includes('Condiciones de Uso')) {
  loginForm = loginForm.replace(
    /<\/form>\n    <\/div>/,
    `</form>
      <div className="mt-8 text-center px-4 relative z-10">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Al registrarte o iniciar sesión, confirmas que has leído y aceptas nuestras <Link href="/legal/terms" className="underline hover:text-charcoal transition-colors">Condiciones de Uso</Link> y <Link href="/legal/privacy" className="underline hover:text-charcoal transition-colors">Política de Privacidad</Link>.
        </p>
      </div>
    </div>`
  );
  fs.writeFileSync('src/app/login/LoginForm.tsx', loginForm);
  console.log("UPDATED LOGIN FORM LINKS");
}
