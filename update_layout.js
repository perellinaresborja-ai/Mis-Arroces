const fs = require('fs');

let layout = fs.readFileSync('src/app/layout.tsx', 'utf8');

layout = layout.replace(
  /import \{ AuthPromptProvider \} from "@\/components\/providers\/AuthPromptProvider";/,
  `import { AuthPromptProvider } from "@/components/providers/AuthPromptProvider";\nimport { createClient } from "@/lib/supabase/server";\nimport { checkPendingLegal } from "@/app/actions/legal";\nimport { LegalConsentGate } from "@/components/domain/LegalConsentGate";`
);

layout = layout.replace(
  /export default function RootLayout\(\{[\s\S]*?children,[\s\S]*?\}\: Readonly<\{[\s\S]*?children\: React\.ReactNode;[\s\S]*?\}\>\) \{/,
  `export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let pendingLegal = false;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      pendingLegal = await checkPendingLegal(user.id);
    }
  } catch(e) {}`
);

layout = layout.replace(
  /<AuthPromptProvider>/,
  `<AuthPromptProvider>\n          <LegalConsentGate pendingLegal={pendingLegal} />`
);

fs.writeFileSync('src/app/layout.tsx', layout);
console.log("UPDATED LAYOUT");
