import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

import { createClient } from '@supabase/supabase-js';
import { sendFounderEmail } from './src/lib/email';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseServiceKey) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY no está definida en las variables de entorno.');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function run() {
  const isDryRun = process.argv.includes('--dry-run');

  console.log('========================================================');
  console.log('ENVÍO DE EMAILS DE BIENVENIDA A LOS FUNDADORES INICIALES');
  console.log(isDryRun ? 'MODO: SIMULACIÓN (--dry-run)' : 'MODO: ENVÍO REAL');
  console.log('========================================================\n');

  // 1. Obtener fundadores que no hayan recibido el email aún
  const { data: founders, error: fErr } = await supabaseAdmin
    .from('founders')
    .select('founder_number, user_id, welcome_email_sent_at')
    .is('welcome_email_sent_at', null)
    .order('founder_number', { ascending: true });

  if (fErr) {
    console.error('Error al consultar tabla founders:', fErr);
    process.exit(1);
  }

  if (!founders || founders.length === 0) {
    console.log('Todos los Fundadores ya tienen welcome_email_sent_at registrado. Nada que enviar.');
    process.exit(0);
  }

  console.log(`Se han encontrado ${founders.length} Fundadores pendientes de recibir su email oficial:\n`);

  for (const founder of founders) {
    const formattedNum = String(founder.founder_number).padStart(3, '0');

    // 2. Obtener datos del perfil
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('username, display_name')
      .eq('id', founder.user_id)
      .maybeSingle();

    const username = profile?.username || 'arrocero';
    const displayName = profile?.display_name || username;

    // 3. Obtener public_code permanente de user_identities
    const { data: identity } = await supabaseAdmin
      .from('user_identities')
      .select('public_code')
      .eq('user_id', founder.user_id)
      .maybeSingle();

    const publicCode = identity?.public_code;
    if (!publicCode) {
      console.error(`[ALERTA] El Fundador #${formattedNum} (${username}) no tiene public_code en user_identities. Se omite.`);
      continue;
    }

    // 4. Obtener correo real del usuario desde auth.users
    const { data: authUser, error: authErr } = await supabaseAdmin.auth.admin.getUserById(founder.user_id);
    const email = authUser?.user?.email;

    if (authErr || !email) {
      console.error(`[ALERTA] No se pudo obtener el email del usuario para #${formattedNum} (${founder.user_id}):`, authErr?.message);
      continue;
    }

    const referralUrl = `https://www.misarroces.es/fundadores/r/${publicCode}`;
    const idUrl = `https://www.misarroces.es/id/${publicCode}`;

    console.log(`[PREPARADO] Fundador #${formattedNum} | @${username} | Email: ${email}`);
    console.log(`           ID URL: ${idUrl}`);
    console.log(`           Recomendación: ${referralUrl}`);

    if (isDryRun) {
      console.log('           -> Simulado (no enviado)\n');
      continue;
    }

    // 5. Enviar el correo de bienvenida oficial
    try {
      const response = await sendFounderEmail(email, founder.founder_number, {
        displayName,
        username,
        publicCode,
      });

      if (response.error) {
        console.error(`           -> ERROR Resend para #${formattedNum}:`, response.error);
        continue;
      }

      console.log(`           -> RESEND ÉXITO (ID: ${response.data?.id})`);

      // 6. Marcar welcome_email_sent_at en la base de datos para impedir envíos duplicados
      const { error: updateErr } = await supabaseAdmin
        .from('founders')
        .update({ welcome_email_sent_at: new Date().toISOString() })
        .eq('founder_number', founder.founder_number);

      if (updateErr) {
        console.error(`           -> ERROR al actualizar welcome_email_sent_at:`, updateErr);
      } else {
        console.log(`           -> Registro marcado como enviado con éxito.\n`);
      }
    } catch (sendErr) {
      console.error(`           -> ERROR crítico enviando a ${email}:`, sendErr);
    }
  }

  console.log('Proceso completado.');
}

run().catch((err) => {
  console.error('ERROR NO CONTROLADO:', err);
  process.exit(1);
});
