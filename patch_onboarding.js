const fs = require('fs');

function patchOnboarding(filePaths) {
  for (const p of filePaths) {
    if (fs.existsSync(p)) {
      let content = fs.readFileSync(p, 'utf8');
      
      const oldBlock1 = `const { data: profile } = await supabase.from("profiles").select("onboarding_completed").eq("id", user.id).single()\n    if (!profile?.onboarding_completed) {\n      const { redirect } = await import("next/navigation")\n      redirect("/onboarding")\n    }`;

      const newBlock1 = `const { data: profile } = await supabase.from("profiles").select("onboarding_completed, username, display_name").eq("id", user.id).single()\n    if (!profile?.onboarding_completed) {\n      // Check if it's a legacy user (has custom username or display name != Chef Arrocero)\n      const isNewUser = profile?.username?.startsWith("arrocero") && profile?.display_name === "Chef Arrocero";\n      if (!isNewUser) {\n        // Auto-complete onboarding for existing legacy users\n        await supabase.from("profiles").update({ onboarding_completed: true }).eq("id", user.id);\n      } else {\n        const { redirect } = await import("next/navigation")\n        redirect("/onboarding")\n      }\n    }`;

      if (content.includes(oldBlock1)) {
        content = content.replace(oldBlock1, newBlock1);
        fs.writeFileSync(p, content, 'utf8');
        console.log("Patched onboarding in " + p);
      }
    }
  }
}

patchOnboarding(['src/app/page.tsx', 'src/app/cookbook/page.tsx', 'src/app/discover/page.tsx', 'src/app/shopping-list/page.tsx']);
