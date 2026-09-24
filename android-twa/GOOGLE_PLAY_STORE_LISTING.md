# Ficha de Google Play Store: misarroces

Documento de referencia para la ficha principal de la tienda, clasificación IARC, Seguridad de los datos (Data Safety) y requisitos de publicación en **Google Play Console**.

---

## 1. Detalles Principales de la Aplicación

- **Nombre de la aplicación (máx. 30 caracteres):**
  `misarroces`

- **Descripción breve (máx. 80 caracteres):**
  `La red social de los arroces. Recetas, paellas, cocinado y comunidad arrocera.`
  *(79 caracteres)*

- **Package ID:**
  `es.misarroces.app`

- **Target SDK / API Level:**
  `API 36 (Android 16)`

---

## 2. Descripción Completa (máx. 4000 caracteres)

```text
¡Bienvenido a misarroces, la red social y plataforma gastronómica dedicada al mundo del arroz y la paella!

Tanto si eres un maestro paellero como si estás dando tus primeros pasos ante los fogones, misarroces es tu espacio para descubrir, cocinar, perfeccionar y compartir cada elaboración.

¿QUÉ ENCONTRARÁS EN MISARROCES?

🥘 RECETAS DETALLADAS Y AUTÉNTICAS
Explora recetas de arroces secos, melosos, caldosos y al horno. Desde la auténtica paella valenciana tradicional hasta arroces de marisco, senyoret, verduras o creaciones de autor. Con ingredientes escalables por número de comensales, tiempos exactos y pasos guiados.

⏱️ MODO COCINADO Y CALCULADORA
Cocina paso a paso con herramientas pensadas para el arrocero: calcula las proporciones de caldo según la variedad de arroz (Bomba, Albufera, Senia, etc.), el tipo de fuego (gas, leña, inducción) y el diámetro de la paella para conseguir el punto perfecto y el socarrat ideal.

📸 COMPARTE TUS ELABORACIONES Y EXPERIENCIAS
Publica fotos y vídeos de tus arroces terminados, califica el nivel de socarrat conseguido, apunta notas de mejora y guarda un histórico de cada cocinado en tu propio Recetario digital.

🌟 HISTORIAS Y CONTENIDO EN VIVO
Sigue el día a día de otros cocineros, comparte historias con stickers interactivos, encuestas sobre ingredientes y música arrocera.

👥 COMUNIDAD Y CONSEJOS ENTRE ARROCEROS
Comenta, reacciona, intercambia trucos sobre fondos, caldos, salmorretas y técnicas de cocción con aficionados y profesionales de toda España y el mundo.

🔖 GUARDA Y PLANIFICA
Organiza tus recetas favoritas en colecciones: "Mis recetas", "Guardados", "Quiero cocinar" y "Mis Arroces cocinados".

CARACTERÍSTICAS DESTACADAS:
• Interfaz limpia, rápida y sin anuncios molestos.
• Diseñada con pasión por y para amantes de la gastronomía arrocera.
• Funciona de manera fluida y adaptada tanto a móviles como tablets.

Únete hoy a la comunidad de misarroces y lleva tus paellas al siguiente nivel. ¡Buen provecho!
```

---

## 3. Categorización y Contacto

- **Tipo de aplicación:** Aplicación
- **Categoría:** Comida y bebida (Food & Drink)
- **Etiquetas recomendadas:**
  - Cocina y recetas
  - Gastronomía
  - Estilo de vida
  - Redes sociales
- **Correo electrónico de contacto:** `info@misarroces.es` (o tu correo de soporte de desarrollador en Play Console)
- **Sitio web:** `https://www.misarroces.es`
- **URL de Política de Privacidad:** `https://www.misarroces.es/legal/privacy`

---

## 4. Clasificación de Contenido (Cuestionario IARC)

Respuestas basadas fielmente en la funcionalidad real de la plataforma:

- **Categoría de la aplicación:** Red social / Foro / Plataforma de contenido compartido / Estilo de vida y gastronomía.
- **Violencia:** **No** (sin violencia, sangre ni representaciones violentas).
- **Sexualidad / Desnudez:** **No** (sin contenido sexual ni desnudos).
- **Lenguaje ofensivo:** **No** (la plataforma no promueve ni contiene lenguaje soez predeterminado).
- **Sustancias controladas:** **No** (no promociona alcohol ni tabaco; únicamente ingredientes culinarios comunes en recetas como vino o cerveza de cocina, sin incitar al consumo indebido).
- **Apuestas o juegos de azar:** **No** (sin apuestas con dinero real ni simuladas).
- **¿Permite la aplicación a los usuarios interactuar o intercambiar contenido con otros usuarios a través de voz, texto o compartiendo imágenes/audio?**
  👉 **Sí** (publicación de recetas, fotos de platos, comentarios, me gusta, historias e intercambio de mensajes directos entre usuarios).
- **¿Comparte la aplicación la ubicación física actual y precisa del usuario con otros usuarios?**
  👉 **Solo si el usuario decide voluntariamente etiquetar una ubicación en su publicación o historia** (la app no rastrea ni transmite la ubicación en segundo plano en ningún momento).
- **¿Permite a los usuarios comprar bienes digitales?**
  👉 **No** (la aplicación es 100% gratuita, sin compras integradas ni suscripciones de pago).
- **¿Contiene la aplicación un navegador web con acceso ilimitado a Internet?**
  👉 **No** (la aplicación es un entorno cerrado Trusted Web Activity enfocado exclusivamente en `https://www.misarroces.es`).
- **Resultado estimado:** **PEGI 3** / **USK 0** / **ESRB Everyone** (con descriptor de "Interacción de usuarios").

---

## 5. Declaración de Seguridad de los Datos (Data Safety)

Respuestas exactas para el formulario de Seguridad de los Datos en Google Play Console:

### Preguntas generales:
1. **¿Recopila o comparte tu aplicación alguno de los tipos de datos de usuario requeridos?**
   👉 **Sí** (datos de cuenta y contenido aportado por el usuario).
2. **¿Se cifran en tránsito todos los datos de usuario recogidos por tu aplicación?**
   👉 **Sí** (todas las conexiones van cifradas mediante protocolo seguro HTTPS / TLS).
3. **¿Proporcionas a los usuarios una forma de solicitar que se eliminen sus datos?**
   👉 **Sí** (los usuarios pueden eliminar su cuenta y todos sus datos asociados directamente desde `Ajustes / Perfil` de la app o solicitándolo a `info@misarroces.es`).
   - URL para solicitar eliminación de cuenta: `https://www.misarroces.es/legal/privacy` (o formulario de ajustes).

### Tipos de datos recopilados (Uso Real en misarroces):

1. **Información personal:**
   - **Dirección de correo electrónico:** Recopilada para la creación de cuenta, autenticación (Supabase Auth) y gestión de la cuenta. No se comparte con terceros.
   - **Nombre de usuario / Nombre para mostrar:** Recopilado para el perfil público del arrocero.
   - **ID de usuario:** Identificador técnico único asignado por la base de datos para vincular las recetas y sesiones del usuario.
   - **Biografía / Enlace web (Opcional):** Si el usuario decide rellenarlo en su perfil.

2. **Fotos y vídeos:**
   - **Fotos / Vídeos:** Recopilados únicamente cuando el usuario sube fotos de sus recetas, historias, avatar de perfil o pasos de cocinado. Finalidad: Funcionalidad de la aplicación.

3. **Mensajes:**
   - **Mensajes en la aplicación:** Mensajes directos (chat) entre usuarios dentro de la plataforma. Finalidad: Funcionalidad de la aplicación / Comunicación entre usuarios.

4. **Ubicación:**
   - **Ubicación aproximada o voluntaria:** Solo cuando el usuario añade una etiqueta de ubicación a una receta o historia para indicar el origen del plato. Finalidad: Funcionalidad de la aplicación. (No se rastrea en segundo plano).

5. **Actividad en la aplicación:**
   - **Interacciones en la app:** Vistas de páginas, recetas guardadas, "me gusta", comentarios y recetas cocinadas. Finalidad: Análisis interno, personalización del feed y funcionamiento de la app.

6. **Información de rendimiento y diagnóstico:**
   - Registros de errores / métricas de rendimiento anónimas para asegurar la estabilidad del servicio. Finalidad: Análisis y corrección de incidencias.

### ¿Se comparten datos con terceros?
- **No se venden ni comparten datos personales con intermediarios de datos (data brokers) ni redes de publicidad de terceros.**
- Solo intervienen proveedores de infraestructura técnica (Supabase para base de datos/almacenamiento y Google Analytics para métricas de tráfico anónimas).

---

## 6. Requisitos de Pruebas Cerradas (Cuentas Personales Nuevas)

Para cuentas de desarrollador personales creadas después de noviembre de 2023:
- **Exigencia oficial de Google Play:** Se requiere configurar una pista de **Pruebas cerradas (Closed Testing)** con un mínimo de **12 verificadores (testers)** que hayan aceptado participar y permanezcan registrados durante al menos **14 días consecutivos**.
- Una vez transcurridos los 14 días con los 12 testers activos, se desbloquea en Google Play Console el botón para solicitar el acceso a **Producción**.
