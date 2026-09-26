const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');
const ffmpeg = require('ffmpeg-static');
const sharp = require('sharp');

// 1. Load Supabase configuration
const envPath = path.resolve(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('Error: .env.local not found');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const supabaseUrlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=([^\r\n]+)/);
const serviceRoleKeyMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=([^\r\n]+)/);

if (!supabaseUrlMatch || !serviceRoleKeyMatch) {
  console.error('Error: Supabase URL or Service Role Key missing in .env.local');
  process.exit(1);
}

const supabaseUrl = supabaseUrlMatch[1].trim().replace(/['"]/g, '');
const serviceRoleKey = serviceRoleKeyMatch[1].trim().replace(/['"]/g, '');

const headers = {
  apikey: serviceRoleKey,
  Authorization: `Bearer ${serviceRoleKey}`,
};

async function main() {
  console.log('=== INICIANDO AUDITORÍA Y BACKFILL DE THUMBNAILS ===\n');

  // Query media_assets
  const res = await fetch(`${supabaseUrl}/rest/v1/media_assets?select=id,media_type,storage_path,thumbnail_path,created_at`, {
    headers,
  });

  if (!res.ok) {
    console.error('Error al consultar media_assets:', res.status, await res.text());
    process.exit(1);
  }

  const allAssets = await res.json();
  const videoAssets = allAssets.filter(
    (a) => a.media_type === 'VIDEO' || /\.(mp4|webm|mov|ogg)$/i.test(a.storage_path)
  );
  const pendingVideos = videoAssets.filter((a) => !a.thumbnail_path);

  console.log(`Total media_assets en base de datos: ${allAssets.length}`);
  console.log(`Total vídeos encontrados: ${videoAssets.length}`);
  console.log(`Vídeos sin thumbnail_path: ${pendingVideos.length}\n`);

  if (pendingVideos.length === 0) {
    console.log('No hay vídeos pendientes de miniatura. Todos tienen thumbnail_path.');
    return;
  }

  let processedCount = 0;
  let failedCount = 0;
  const results = [];

  for (const asset of pendingVideos) {
    const videoStoragePath = asset.storage_path;
    const assetId = asset.id;
    console.log(`--- Procesando vídeo [${assetId}] ---`);
    console.log(`Storage path: ${videoStoragePath}`);

    // Check if video file exists in storage
    const videoPublicUrl = `${supabaseUrl}/storage/v1/object/public/recipe_media/${videoStoragePath}`;
    const headCheck = await fetch(videoPublicUrl, { method: 'HEAD' });

    if (!headCheck.ok) {
      console.warn(`[OMITIDO/FALLIDO] El vídeo no existe en Storage (HTTP ${headCheck.status}): ${videoStoragePath}`);
      failedCount++;
      results.push({ id: assetId, path: videoStoragePath, status: 'NOT_FOUND_IN_STORAGE' });
      continue;
    }

    const tmpVideo = path.join(os.tmpdir(), `v_${Date.now()}_${path.basename(videoStoragePath)}`);
    const tmpFrame = path.join(os.tmpdir(), `f_${Date.now()}_frame.jpg`);

    try {
      // 1. Download video
      console.log('  Descargando vídeo temporal...');
      const videoRes = await fetch(videoPublicUrl);
      const videoBuffer = Buffer.from(await videoRes.arrayBuffer());
      fs.writeFileSync(tmpVideo, videoBuffer);

      // 2. Extract frame at 0.1s using ffmpeg-static
      console.log('  Extrayendo fotograma representativo (0.1s)...');
      execFileSync(ffmpeg, [
        '-ss', '00:00:00.100',
        '-i', tmpVideo,
        '-frames:v', '1',
        '-q:v', '2',
        '-y', tmpFrame,
      ], { stdio: 'pipe' });

      // 3. Optimize to WebP with Sharp (max 480px, quality 80)
      console.log('  Optimizando a WebP (máx. 480px)...');
      const webpBuffer = await sharp(tmpFrame)
        .resize(480, 480, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();

      console.log(`  Miniatura generada (${webpBuffer.length} bytes)`);

      // 4. Determine thumbnail storage path: {without_ext}.thumb.webp
      const cleanPath = videoStoragePath.replace(/\.(mp4|webm|mov|ogg)$/i, '');
      const thumbnailStoragePath = `${cleanPath}.thumb.webp`;

      // 5. Upload thumbnail to Supabase Storage
      console.log(`  Subiendo a Storage: ${thumbnailStoragePath}...`);
      const uploadRes = await fetch(
        `${supabaseUrl}/storage/v1/object/recipe_media/${thumbnailStoragePath}`,
        {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'image/webp',
            'x-upsert': 'true',
          },
          body: webpBuffer,
        }
      );

      if (!uploadRes.ok) {
        throw new Error(`Error en upload Storage: ${uploadRes.status} ${await uploadRes.text()}`);
      }

      // 6. Update media_assets row in DB
      console.log(`  Actualizando media_assets.thumbnail_path...`);
      const patchRes = await fetch(
        `${supabaseUrl}/rest/v1/media_assets?id=eq.${assetId}`,
        {
          method: 'PATCH',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
            Prefer: 'return=representation',
          },
          body: JSON.stringify({
            thumbnail_path: thumbnailStoragePath,
          }),
        }
      );

      if (!patchRes.ok) {
        throw new Error(`Error al actualizar DB: ${patchRes.status} ${await patchRes.text()}`);
      }

      // 7. Verify accessibility of the uploaded thumbnail
      const thumbPublicUrl = `${supabaseUrl}/storage/v1/object/public/recipe_media/${thumbnailStoragePath}`;
      const verifyRes = await fetch(thumbPublicUrl, { method: 'HEAD' });
      if (!verifyRes.ok) {
        throw new Error(`Verificación de miniatura falló con HTTP ${verifyRes.status}`);
      }

      console.log(`  [OK] Minuatura verificada y persistida: ${thumbnailStoragePath}\n`);
      processedCount++;
      results.push({ id: assetId, path: videoStoragePath, thumb: thumbnailStoragePath, status: 'SUCCESS' });
    } catch (err) {
      console.error(`  [ERROR] Falló procesamiento de ${videoStoragePath}:`, err.message);
      failedCount++;
      results.push({ id: assetId, path: videoStoragePath, error: err.message, status: 'ERROR' });
    } finally {
      if (fs.existsSync(tmpVideo)) {
        try { fs.unlinkSync(tmpVideo); } catch {}
      }
      if (fs.existsSync(tmpFrame)) {
        try { fs.unlinkSync(tmpFrame); } catch {}
      }
    }
  }

  console.log('=== RESUMEN DE EJECUCIÓN ===');
  console.log(`Vídeos encontrados sin thumbnail: ${pendingVideos.length}`);
  console.log(`Procesados correctamente: ${processedCount}`);
  console.log(`Fallidos / Inaccesibles: ${failedCount}`);
  console.log(JSON.stringify(results, null, 2));
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
