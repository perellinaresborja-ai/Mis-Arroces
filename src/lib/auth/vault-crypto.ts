import crypto from "crypto"

export interface VaultAccountSession {
  userId: string
  email: string
  username: string
  displayName: string
  avatarUrl: string | null
  refreshToken: string
  accessToken?: string
  lastActiveAt: number
}

export interface VaultPayload {
  version: 1
  accounts: VaultAccountSession[]
}

const ALGORITHM = "aes-256-gcm"
const IV_LENGTH = 12 // 96 bits recomendado para AES-GCM
const AUTH_TAG_LENGTH = 16 // 128 bits

/**
 * Obtiene la clave de cifrado de 256 bits a partir de MULTI_ACCOUNT_VAULT_SECRET.
 * Si la variable no está configurada, falla de forma estricta y segura: CERO fallbacks o claves por defecto.
 */
function getEncryptionKey(): Buffer {
  const secret = process.env.MULTI_ACCOUNT_VAULT_SECRET

  if (!secret || secret.trim().length < 32) {
    throw new Error(
      "Seguridad crítica: La variable de entorno MULTI_ACCOUNT_VAULT_SECRET no está configurada o no tiene la entropía requerida (mínimo 32 caracteres / 256 bits). Operación cancelada por seguridad sin usar fallbacks débiles."
    )
  }

  const cleanSecret = secret.trim()

  // Si es una cadena hexadecimal de 64 caracteres (exactamente 32 bytes / 256 bits)
  if (/^[0-9a-fA-F]{64}$/.test(cleanSecret)) {
    return Buffer.from(cleanSecret, "hex")
  }

  // En cualquier otro caso de entropía alta, derivación criptográfica de 256 bits mediante SHA-256
  return crypto.createHash("sha256").update(cleanSecret, "utf8").digest()
}

export function encryptVault(data: VaultPayload): string {
  try {
    const key = getEncryptionKey()
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH })

    const plaintext = JSON.stringify(data)
    let ciphertext = cipher.update(plaintext, "utf8", "base64")
    ciphertext += cipher.final("base64")

    const authTag = cipher.getAuthTag()

    // Formato empaquetado: iv_base64:tag_base64:ciphertext_base64
    return `${iv.toString("base64")}:${authTag.toString("base64")}:${ciphertext}`
  } catch (err: any) {
    console.error("Error cifrando bóveda multicuenta:", err.message)
    throw err
  }
}

export function decryptVault(encryptedString: string): VaultPayload | null {
  try {
    if (!encryptedString) return null
    const parts = encryptedString.split(":")
    if (parts.length !== 3) return null

    const [ivB64, tagB64, ciphertextB64] = parts
    const key = getEncryptionKey()
    const iv = Buffer.from(ivB64, "base64")
    const authTag = Buffer.from(tagB64, "base64")

    if (iv.length !== IV_LENGTH || authTag.length !== AUTH_TAG_LENGTH) {
      return null
    }

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH })
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(ciphertextB64, "base64", "utf8")
    decrypted += decipher.final("utf8")

    const parsed = JSON.parse(decrypted)
    if (parsed && parsed.version === 1 && Array.isArray(parsed.accounts)) {
      return parsed as VaultPayload
    }
    return null
  } catch (err: any) {
    if (err.message?.includes("Seguridad crítica")) {
      console.error(err.message)
      return null
    }
    // Si la clave cambió o el token fue alterado, se descarta limpiamente sin exponer error
    console.warn("Aviso: No se pudo descifrar la bóveda multicuenta (posible expiración o alteración).")
    return null
  }
}
