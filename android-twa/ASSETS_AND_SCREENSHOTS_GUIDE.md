# Guía de Assets Gráficos y Capturas para Google Play

Google Play exige varios elementos gráficos obligatorios para poder enviar la app a revisión:

---

## 1. Icono de la Aplicación en Google Play (Preparado)

- **Ubicación:** `public/icons/google-play-icon-512x512.png`
- **Dimensiones:** 512 x 512 píxeles
- **Formato:** PNG de 32 bits (RGB + Alfa)
- **Peso:** < 1 MB
- **Diseño:** Basado en el PNG máster `logopaellaicono.png`, con la paella y asas optimizadas al máximo tamaño y transparencia preservada.

---

## 2. Gráfico de Funciones / Cabecera (Generado)

- **Ubicación:** `public/icons/google-play-feature-graphic-1024x500.png`
- **Dimensiones:** 1024 x 500 píxeles
- **Formato:** PNG
- **Diseño:** Fondo crema oficial de misarroces (`#F7F2E8`), logotipo de la paella centrado y tipografía oficial con nombre y eslogan ("misarroces - La red social de los arroces").

---

## 3. Capturas de Pantalla de Teléfono Móvil (Mínimo 4)

Google Play requiere **al menos 4 capturas de pantalla de móvil**, con relación de aspecto 9:16 o 16:9 (por ejemplo, 1080 x 1920 o 1080 x 2400 píxeles).

### Las 4 pantallas recomendadas para mostrar lo mejor de misarroces:

1. **Captura 1: El Feed de la Comunidad Arrocera**
   - URL: `https://www.misarroces.es/`
   - Qué mostrar: Barra de historias arriba + publicaciones reales de arroces con fotos apetecibles, reacciones y comentarios.
   - Mensaje sugerido arriba: *"Descubre los mejores arroces de la comunidad"*.

2. **Captura 2: Detalle de Receta Paso a Paso**
   - URL: `https://www.misarroces.es/recipes/<id-receta>`
   - Qué mostrar: Foto principal del arroz, selector de comensales, lista de ingredientes e instrucciones de elaboración.
   - Mensaje sugerido: *"Recetas tradicionales y de autor con tiempos exactos"*.

3. **Captura 3: Modo Cocinado y Registro de Elaboración**
   - URL: `https://www.misarroces.es/sessions/<id-sesion>` o `calculadora-capa`
   - Qué mostrar: Tiempos de fuego, variedad de arroz utilizada, valoración de socarrat y notas del cocinado.
   - Mensaje sugerido: *"Perfecciona tu punto de arroz y socarrat"*.

4. **Captura 4: Tu Recetario Personal y Colecciones**
   - URL: `https://www.misarroces.es/cookbook`
   - Qué mostrar: Pestañas de "Mis Arroces", "Mis recetas", "Guardados" y cuadrícula de arroces cocinados.
   - Mensaje sugerido: *"Tu cuaderno de cocina arrocera siempre a mano"*.

> **Tip para capturarlas:**
> Abre Chrome en tu ordenador, pulsa `F12` (DevTools), activa el modo dispositivo (icono de móvil), selecciona **"iPhone 14 Pro Max"** o **"Pixel 7"**, ajusta el zoom al 100% y en el menú de tres puntos de DevTools pulsa **"Capture full size screenshot"** o **"Capture screenshot"**. Las imágenes resultantes tendrán la resolución nativa perfecta (1080x2400) lista para subir.
