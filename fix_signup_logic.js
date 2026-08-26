const fs = require('fs');
let content = fs.readFileSync('src/app/login/actions.ts', 'utf8');

const oldBlock = `    }
  
    revalidatePath("/", "layout")
    redirect("/cookbook")
  }
  
  export async function logout() {`;

const newBlock = `    }
  
    revalidatePath("/", "layout")
    if (data.session) {
      redirect("/cookbook")
    } else {
      redirect("/login?message=Revisa tu email para confirmar la cuenta")
    }
  }
  
  export async function logout() {`;

content = content.replace(oldBlock, newBlock);

fs.writeFileSync('src/app/login/actions.ts', content, 'utf8');
