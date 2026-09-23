const { createClient } = require('@supabase/supabase-js');
const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function verify() {
  console.log('=== VERIFICANDO ACTIVACIÓN EN SUPABASE ===\n');

  // 1. Consultar tabla founders
  const { data: founders, error: fErr } = await supabase
    .from('founders')
    .select('founder_number, user_id, granted_at, welcome_email_sent_at')
    .order('founder_number', { ascending: true });

  if (fErr) {
    console.error('ERROR al consultar tabla founders:', fErr);
    process.exit(1);
  }

  console.log(`✓ Total fundadores encontrados: ${founders.length}`);
  if (founders.length !== 8) {
    console.error(`FALLO: Se esperaban exactamente 8 fundadores iniciales (#000 a #007), pero hay ${founders.length}.`);
    process.exit(1);
  }

  // 2. Comprobar que los números son exactamente 0 al 7
  const numbers = founders.map(f => f.founder_number);
  const expectedNumbers = [0, 1, 2, 3, 4, 5, 6, 7];
  const numbersMatch = JSON.stringify(numbers) === JSON.stringify(expectedNumbers);
  if (!numbersMatch) {
    console.error('FALLO en los números asignados:', numbers);
    process.exit(1);
  }
  console.log('✓ Números asignados exactos: #000 al #007 sin saltos ni duplicados.');

  // 3. Comprobar exclusión de ADMIN (misarroces)
  const adminId = 'd5e0c178-49d0-4160-b122-d518f5d46036';
  const hasAdmin = founders.some(f => f.user_id === adminId);
  if (hasAdmin) {
    console.error('FALLO: El ADMIN (misarroces) aparece en la tabla founders.');
    process.exit(1);
  }
  console.log('✓ ADMIN (misarroces) excluido correctamente.');

  // 4. Comprobar coincidencia de los 8 usuarios auditados
  const fixedExpected = [
    { num: 0, uuid: '259dce9b-8dc1-42b7-8c26-c2ab55f189f0', user: '@arroceroalicantino' },
    { num: 1, uuid: '6adede4a-47b6-48ea-9af2-50bc6e56b6ed', user: '@marichus' },
    { num: 2, uuid: '74f9e5f3-f4b0-4b01-8597-b387a8774c32', user: '@doctorqueso' },
    { num: 3, uuid: '09ed5acf-5402-484e-9e00-8501961d30ec', user: '@aalmodobar' },
    { num: 4, uuid: '854ea7aa-bf72-40ff-9c09-987a9792a371', user: '@davidblanco1977' },
    { num: 5, uuid: '3ad29209-30e2-4367-944f-e47fa3dce4a8', user: '@paellaloverspc' },
    { num: 6, uuid: '9c3613aa-b712-4e89-a96d-da2b66f79641', user: '@crisbussohotmail.com' },
    { num: 7, uuid: '1dc0479a-dd03-41ab-b2e6-75de6f2c4634', user: '@juanitoentrefuegos' }
  ];

  for (let i = 0; i < fixedExpected.length; i++) {
    const exp = fixedExpected[i];
    const actual = founders[i];
    if (actual.user_id !== exp.uuid) {
      console.error(`FALLO: El Fundador #${exp.num} no coincide con el UUID esperado. Actual: ${actual.user_id}, Esperado: ${exp.uuid}`);
      process.exit(1);
    }
  }
  console.log('✓ Los 8 Fundadores corresponden exactamente a los usuarios auditados.');

  // 5. Comprobar que cada uno tiene user_identity con public_code único
  const { data: identities, error: idErr } = await supabase
    .from('user_identities')
    .select('user_id, public_code, is_active')
    .in('user_id', founders.map(f => f.user_id));

  if (idErr) {
    console.error('ERROR al consultar user_identities:', idErr);
    process.exit(1);
  }

  if (!identities || identities.length !== 8) {
    console.error(`FALLO: Solo se encontraron ${identities?.length || 0} identidades para los 8 fundadores.`);
    process.exit(1);
  }

  const publicCodes = new Set(identities.map(id => id.public_code));
  if (publicCodes.size !== 8) {
    console.error('FALLO: Hay códigos duplicados en user_identities.');
    process.exit(1);
  }
  console.log('✓ Los 8 Fundadores tienen user_identity con public_code único y activo.');

  // 6. Comprobar que welcome_email_sent_at sigue siendo NULL
  const anyEmailSent = founders.some(f => f.welcome_email_sent_at !== null);
  if (anyEmailSent) {
    console.error('FALLO: welcome_email_sent_at ya tiene valor antes del envío controlado.');
    process.exit(1);
  }
  console.log('✓ welcome_email_sent_at es NULL para los 8 fundadores (listo para envío controlado).');

  console.log('\n=============================================');
  console.log('¡TODAS LAS VERIFICACIONES DEL PASO 2 HAN PASADO CON ÉXITO!');
  console.log('=============================================');
}

verify().catch((err) => {
  console.error('ERROR EN VERIFICACIÓN:', err);
  process.exit(1);
});
