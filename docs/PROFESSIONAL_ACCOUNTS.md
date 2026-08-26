# Professional Accounts Architecture

## Estado Actual (Implementado)

La base de datos está preparada para soportar cuentas profesionales y personales a nivel arquitectónico, **sin haber implementado UI ni lógica de negocio visible**.

*   **`account_type`**: Enum `('PERSONAL', 'PROFESSIONAL')`. Todos los usuarios actuales son y nacen como `PERSONAL`.
*   **`professional_type`**: Enum `('CHEF', 'RESTAURANT', 'CREATOR', 'BRAND', 'OTHER')`. Permite categorizar a los profesionales, solo disponible si `account_type = PROFESSIONAL`.
*   **Compatibilidad Total**: Una cuenta profesional es simplemente una capa encima de un perfil normal. Comparten la misma tabla `profiles`, la misma autenticación en `auth.users`, y el mismo `id`.
*   **Ownership Unificado**: No hay separación de propiedad de contenido. Las recetas, follows y notificaciones siguen operando con el mismo `user_id`.
*   **Descubrimiento (Discover)**: Se ha mantenido la compatibilidad. Si a nivel de DB se asigna a alguien `CHEF` o `RESTAURANT` en `professional_type`, aparecerá el badge correspondiente en la búsqueda.

## Futuro (No implementado)

### 1. Sistema de Restaurantes
*   Se crearán tablas anexas (ej. `restaurants_metadata` con foreign key `profile_id`) para añadir: nombre comercial, teléfono, web, carta de arroces, horarios y gestión de reservas.
*   **NO** ensuciar la tabla `profiles` con campos específicos de un negocio (ej. `vat_number`, `reservation_link`).

### 2. Monetización
*   Suscripciones (ej. Stripe, Planes Free/Pro) se gestionarán en otra tabla o mediante columnas de facturación (`account_tier` o `subscription_status`).
*   Tener `account_type = PROFESSIONAL` **NO** implica ser de pago ni estar verificado.

### 3. Verificación
*   Las insignias de verificado (`verified = true`) serán un flag independiente. Un restaurante puede no estar verificado y una cuenta personal sí.

### 4. UI y Rutas
*   El perfil público de los usuarios (`/@username`) será idéntico en URL. El frontend consumirá `account_type` y `professional_type` para renderizar componentes condicionales (ej. un botón de "Reservar" o el "Menú" si es restaurante).
*   Se habilitará un flujo en Ajustes: "Cambiar a cuenta profesional".

### 5. Insights Profesionales
*   El sistema de eventos actual (`analytics_events`) soportará nuevos `event_type` como `RESERVATION_CLICK`, `WEBSITE_CLICK`, `MENU_VIEW`, aprovechando las restricciones (CHECK) extensibles y el mismo esquema de `owner_id`.
