const sharp = require('sharp');
const fs = require('fs');

async function generateGooglePlayAssets() {
  console.log('Generating Google Play assets according to exact user instructions...');

  // ----------------------------------------------------
  // 1. ICONO GOOGLE PLAY 512x512
  // "usa únicamente la paella con la “m”, sin texto ni claim, manteniendo máxima calidad y proporción. Conserva transparencia del logo master original."
  // ----------------------------------------------------
  const paellaMasterBuf = fs.readFileSync('public/logopaellaicono.png');

  // Redimensionar paella con máxima nitidez (Lanczos3) para que encaje perfectamente en 512x512 respetando la zona segura de Google Play
  // logopaellaicono recortado es 1289x996 (ratio 1.294). Con ancho de 476px, alto es ~368px.
  const resizedPaella = await sharp(paellaMasterBuf)
    .resize({ width: 476, height: 476, fit: 'inside', kernel: 'lanczos3' })
    .toBuffer({ resolveWithObject: true });

  const iconTop = Math.round((512 - resizedPaella.info.height) / 2);
  const iconLeft = Math.round((512 - resizedPaella.info.width) / 2);

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 } // 100% transparente
    }
  })
  .composite([{
    input: resizedPaella.data,
    top: iconTop,
    left: iconLeft
  }])
  .png({ compressionLevel: 9 })
  .toFile('public/icons/google-play-icon-512x512.png');

  fs.copyFileSync('public/icons/google-play-icon-512x512.png', 'public/icons/icon-512x512.png');
  console.log('Icon 512x512 created successfully with transparency.');

  // ----------------------------------------------------
  // 2. FEATURE GRAPHIC 1024x500
  // "fondo crema oficial de misarroces + este logo horizontal centrado, grande, limpio y bien proporcionado. NO fondo negro. NO cambies “TU RECETARIO DE ARROZ” dentro del logo."
  // ----------------------------------------------------
  const bannerWidth = 1024;
  const bannerHeight = 500;

  const horizLogoBuf = fs.readFileSync('public/logopnghor.png');

  // El logo horizontal original es 1881x836 (ratio 2.25).
  // Para que quede grande, limpio, imponente y con márgenes equilibrados:
  // Ancho: 880px -> Alto: 880 * (836 / 1881) = 390.9px
  // Margen superior/inferior: (500 - 391) / 2 = ~54.5px
  // Margen lateral: (1024 - 880) / 2 = 72px
  const resizedHorizLogo = await sharp(horizLogoBuf)
    .resize({ width: 880, height: 410, fit: 'inside', kernel: 'lanczos3' })
    .toBuffer({ resolveWithObject: true });

  const logoTop = Math.round((bannerHeight - resizedHorizLogo.info.height) / 2);
  const logoLeft = Math.round((bannerWidth - resizedHorizLogo.info.width) / 2);

  // Fondo crema oficial de misarroces (#F7F5F0) con una sutil calidez suave en el centro para darle acabado editorial de alta gama
  const creamBackgroundSvg = `
    <svg width="${bannerWidth}" height="${bannerHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="creamCanvas" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stop-color="#FAF8F4" />
          <stop offset="60%" stop-color="#F7F5F0" />
          <stop offset="100%" stop-color="#ECE7DD" />
        </radialGradient>
      </defs>
      <rect width="${bannerWidth}" height="${bannerHeight}" fill="url(#creamCanvas)" />
    </svg>
  `;

  await sharp(Buffer.from(creamBackgroundSvg))
    .composite([{
      input: resizedHorizLogo.data,
      top: logoTop,
      left: logoLeft
    }])
    .png({ compressionLevel: 9 })
    .toFile('public/icons/google-play-feature-graphic-1024x500.png');

  console.log('Feature graphic 1024x500 created successfully.');
}

generateGooglePlayAssets().catch(console.error);
