# Módulo de Control de Fundadores (Panel Admin)

> **Estado:** Pendiente de integración cuando se construya el Panel de Administración general.  
> **Acceso:** Exclusivo ADMIN (`d5e0c178-49d0-4160-b122-d518f5d46036` / rol admin).

---

## 1. Requisitos Funcionales

El módulo de Fundadores dentro del panel de Administración debe permitir auditar y gestionar el estado de envío de los emails de bienvenida oficiales a los Arroceros Fundadores (#000 a #099).

### Vista y Métricas
- Listado de Fundadores con `welcome_email_sent_at IS NULL`.
- Columnas visibles:
  - Número de Fundador (`#000`–`#099`).
  - `@username` y nombre visible.
  - Email del usuario (obtenido vía auth admin).
  - Fecha de asignación de plaza (`granted_at`).
  - Botón individual: **“Reintentar email”**.
- Cabecera / Barra de acciones:
  - Contador de emails pendientes.
  - Botón global: **“Reintentar emails pendientes”** (procesa en lote todos los pendientes).

---

## 2. Reglas de Negocio Estrictas

1. **Filtro Estricto:** Solo se debe permitir el reintento a registros donde `welcome_email_sent_at IS NULL`.
2. **Actualización Condicional:** `welcome_email_sent_at` se actualizará a `now()` **únicamente si Resend acepta correctamente el envío** (cero errores en la respuesta).
3. **Protección Anti-Duplicados:** Nunca reenviar a quien ya tenga `welcome_email_sent_at` establecido.
4. **Inmutabilidad:** No modificar el número de Fundador, ni el ID de usuario, ni el código QR bajo ningún concepto.
5. **Seguridad:** Rutas, Server Actions y llamadas RPC protegidas exclusivamente para el usuario Administrador.

---

## 3. Componentes Técnicos a Reutilizar
- Envío de email: `sendFounderEmail(email, founderNumber, { displayName, username, publicCode })` en `src/lib/email.ts`.
- Identidad de usuario: `user_identities` (`public_code`) mediante `get_or_create_user_identity`.
- Lógica base: `processFounderSpotAndEmail` en `src/lib/founder-claim.ts`.
