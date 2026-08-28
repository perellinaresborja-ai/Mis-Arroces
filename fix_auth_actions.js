const fs = require('fs');
let code = fs.readFileSync('src/app/login/actions.ts', 'utf8');

// Replace the error handling in signup and login
const errorMapper = `
function mapAuthError(errorMsg: string): string {
  const msg = errorMsg.toLowerCase();
  if (msg.includes("email rate limit exceeded") || msg.includes("too many requests")) {
    return "Se han realizado demasiados intentos. Espera unos minutos antes de volver a intentarlo.";
  }
  if (msg.includes("user already registered")) {
    return "Este correo ya está registrado.";
  }
  if (msg.includes("invalid login credentials")) {
    return "Correo o contraseña incorrectos.";
  }
  if (msg.includes("password should be at least")) {
    return "La contraseña debe tener al menos 6 caracteres.";
  }
  if (msg.includes("invalid email")) {
    return "Correo electrónico no válido.";
  }
  return "Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.";
}
`;

if (!code.includes('mapAuthError')) {
  code = code.replace('"use server"\n', '"use server"\n' + errorMapper);
}

// In login:
const loginError = `  if (error) {
    redirect(\`/login?error=\${encodeURIComponent(error.message)}\`)
  }`;
const newLoginError = `  if (error) {
    redirect(\`/login?error=\${encodeURIComponent(mapAuthError(error.message))}\`)
  }`;
code = code.replace(loginError, newLoginError);

// In signup:
const signupError = `  if (error) {
    redirect(\`/login?error=\${encodeURIComponent(error.message)}\`)
  }`;
const newSignupError = `  if (error) {
    redirect(\`/login?error=\${encodeURIComponent(mapAuthError(error.message))}\`)
  }`;
code = code.replace(signupError, newSignupError);

const signupSuccess = `redirect("/login?message=Revisa tu email para activar la cuenta")`;
const newSignupSuccess = `redirect("/login?message=Cuenta creada. Revisa tu correo para confirmar tu cuenta.")`;
code = code.replace(signupSuccess, newSignupSuccess);

fs.writeFileSync('src/app/login/actions.ts', code);
