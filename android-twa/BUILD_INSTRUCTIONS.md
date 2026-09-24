# Instrucciones de Compilación y Configuración TWA (Bubblewrap)

Esta guía detalla el proceso completo para generar el archivo **Android App Bundle (.aab)** y vincularlo con el dominio `https://www.misarroces.es`.

---

## 1. Generación del Keystore de Firma

Para compilar un `.aab` de producción para Google Play, se necesita un archivo de claves (`.keystore`).

Si tienes Java/JDK instalado en tu equipo, puedes generarlo con este comando:

```bash
keytool -genkeypair -v -keystore android-twa/misarroces-release-key.keystore -alias misarroces -keyalg RSA -keysize 2048 -validity 10000
```

> **¡MUY IMPORTANTE!**
> Guarda el archivo `misarroces-release-key.keystore` y las contraseñas en un lugar seguro. Si pierdes esta clave, no podrás actualizar tu app si no usas Google Play App Signing.

---

## 2. Obtención de la Huella Digital SHA-256 (Digital Asset Links)

Google Play utiliza **Digital Asset Links** para verificar que la app de Android es la propietaria del sitio web `https://www.misarroces.es`. Cuando la verificación tiene éxito, la app se abre **sin la barra de direcciones de Chrome** (experiencia 100% nativa).

### Opción A: Clave local (para pruebas)
Puedes extraer la huella SHA-256 de tu keystore local con:
```bash
keytool -list -v -keystore android-twa/misarroces-release-key.keystore -alias misarroces
```
Busca la línea que empieza por `SHA256: 14:6D:E9:...`.

### Opción B: Clave de Google Play App Signing (Producción)
1. Entra a **Google Play Console**.
2. Selecciona tu app `misarroces`.
3. En el menú lateral izquierdo: **Configuración** → **Firma de aplicaciones**.
4. En la sección **"Certificado de la clave de firma de la aplicación"**, copia la **"Huella digital del certificado SHA-256"**.
5. Pega esa huella dentro de `src/app/.well-known/assetlinks.json/route.ts` y en `public/.well-known/assetlinks.json`.

---

## 3. Generación del Proyecto y Android App Bundle (.aab) con Bubblewrap

Una vez configurado `twa-manifest.json` (ya preparado con Target SDK 36 / Android 16 y package ID `es.misarroces.app`):

```bash
cd android-twa
npx @bubblewrap/cli build
```

El proceso compila el código nativo de Android envolviendo la PWA y produce el archivo:
```text
android-twa/app-release-bundle.aab
```
Este archivo `.aab` es el que se sube a **Google Play Console** en la sección de versiones (Pruebas cerradas o Producción).

---

## 4. Comprobador de Digital Asset Links de Google

Una vez desplegada la web con el archivo `assetlinks.json` accesible en `https://www.misarroces.es/.well-known/assetlinks.json`, puedes comprobar que todo está verde con la herramienta oficial de Google:
`https://developers.google.com/digital-asset-links/tools/generator`

- Dominio del sitio: `https://www.misarroces.es`
- Nombre del paquete: `es.misarroces.app`
- Huella SHA-256: Tu huella
