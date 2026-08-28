const fs = require('fs');
let code = fs.readFileSync('src/app/login/LoginForm.tsx', 'utf8');

const targetImport = `import { login, signup } from "./actions"`;
const newImport = `import { login, signup } from "./actions"\nimport { useFormStatus } from "react-dom"`;
code = code.replace(targetImport, newImport);

const targetButtons = `<div className="pt-2">
            <button 
              formAction={login}
              className="w-full h-12 bg-charcoal hover:bg-black text-white rounded-xl font-bold text-base transition-colors shadow-md"
            >
              VAMOS AL GRANO
            </button>
          </div>

        <div className="relative py-2 flex items-center">
          <div className="flex-grow border-t border-border/80"></div>
          <span className="shrink-0 px-4 text-sm text-muted-foreground bg-sand">o</span>
          <div className="flex-grow border-t border-border/80"></div>
        </div>
        
        <div className="flex flex-col gap-3">
          <button 
            formAction={signup}
            className="w-full h-12 bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-xl font-bold text-base transition-colors"
          >
            CREAR CUENTA NUEVA
          </button>
        </div>`;

const newButtons = `        <SubmitButtons />`;

code = code.replace(targetButtons, newButtons);

const submitButtonsComponent = `
function SubmitButtons() {
  const { pending, action } = useFormStatus();
  
  const isLoginPending = pending && action === login;
  const isSignupPending = pending && action === signup;

  return (
    <>
      <div className="pt-2">
        <button 
          formAction={login}
          disabled={pending}
          className="w-full h-12 bg-charcoal hover:bg-black disabled:bg-charcoal/50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-base transition-colors shadow-md"
        >
          {isLoginPending ? "INICIANDO SESIÓN..." : "VAMOS AL GRANO"}
        </button>
      </div>

      <div className="relative py-2 flex items-center">
        <div className="flex-grow border-t border-border/80"></div>
        <span className="shrink-0 px-4 text-sm text-muted-foreground bg-sand">o</span>
        <div className="flex-grow border-t border-border/80"></div>
      </div>
      
      <div className="flex flex-col gap-3">
        <button 
          formAction={signup}
          disabled={pending}
          className="w-full h-12 bg-transparent border-2 border-primary disabled:border-primary/50 disabled:text-primary/50 disabled:cursor-not-allowed text-primary hover:bg-primary hover:text-primary-foreground rounded-xl font-bold text-base transition-colors"
        >
          {isSignupPending ? "CREANDO CUENTA..." : "CREAR CUENTA NUEVA"}
        </button>
      </div>
    </>
  )
}
`;

code = code + submitButtonsComponent;

fs.writeFileSync('src/app/login/LoginForm.tsx', code);
