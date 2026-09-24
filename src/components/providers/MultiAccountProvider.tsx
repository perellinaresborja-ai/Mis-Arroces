'use client'

import React, { createContext, useContext, useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  AccountPublicProfile,
  syncCurrentSessionToVaultAction,
  switchAccountSessionAction,
  prepareAddAccountAction,
  removeAccountFromVaultAction,
  getVaultAccountsAction,
} from "@/app/actions/account-switcher"

interface MultiAccountContextType {
  accounts: AccountPublicProfile[]
  activeAccountId: string | null
  isSwitching: boolean
  switchingTargetUsername: string | null
  isSwitcherOpen: boolean
  openSwitcher: () => void
  closeSwitcher: () => void
  switchAccount: (userId: string) => Promise<boolean>
  quickSwitchLastAccount: () => Promise<boolean>
  startAddAccount: () => Promise<void>
  removeAccount: (userId: string) => Promise<void>
  refreshAccounts: () => Promise<void>
}

// Clave para guardar ÚNICAMENTE metadatos de presentación (sin tokens ni credenciales)
const META_STORAGE_KEY = "ma_accounts_meta_v1"

const MultiAccountContext = createContext<MultiAccountContextType>({
  accounts: [],
  activeAccountId: null,
  isSwitching: false,
  switchingTargetUsername: null,
  isSwitcherOpen: false,
  openSwitcher: () => {},
  closeSwitcher: () => {},
  switchAccount: async () => false,
  quickSwitchLastAccount: async () => false,
  startAddAccount: async () => {},
  removeAccount: async () => {},
  refreshAccounts: async () => {},
})

export function useMultiAccount() {
  return useContext(MultiAccountContext)
}

function loadMetaFromStorage(): AccountPublicProfile[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(META_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed.filter((a) => a && typeof a.userId === "string" && typeof a.username === "string")
    }
  } catch (err) {
    console.warn("Error leyendo metadatos locales de cuentas:", err)
  }
  return []
}

function saveMetaToStorage(accounts: AccountPublicProfile[]) {
  if (typeof window === "undefined") return
  try {
    // Almacena únicamente metadatos públicos (userId, email, username, displayName, avatarUrl, lastActiveAt)
    const sanitized = accounts.map((a) => ({
      userId: a.userId,
      email: a.email,
      username: a.username,
      displayName: a.displayName,
      avatarUrl: a.avatarUrl,
      lastActiveAt: a.lastActiveAt,
    }))
    localStorage.setItem(META_STORAGE_KEY, JSON.stringify(sanitized))
  } catch (err) {
    console.warn("Error guardando metadatos locales de cuentas:", err)
  }
}

export function MultiAccountProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<AccountPublicProfile[]>([])
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null)
  const [isSwitching, setIsSwitching] = useState(false)
  const [switchingTargetUsername, setSwitchingTargetUsername] = useState<string | null>(null)
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false)

  const accountsRef = useRef<AccountPublicProfile[]>([])
  accountsRef.current = accounts

  // Sincronización segura con el servidor (bóveda cifrada httpOnly)
  const refreshAccounts = async () => {
    try {
      const serverAccounts = await syncCurrentSessionToVaultAction()
      if (Array.isArray(serverAccounts)) {
        setAccounts(serverAccounts)
        saveMetaToStorage(serverAccounts)
      }
    } catch (err) {
      console.warn("Error sincronizando cuentas con el servidor:", err)
    }
  }

  // Carga inicial y escucha de cambios de sesión
  useEffect(() => {
    // 1. Cargar metadatos optimistas de presentación
    const localMeta = loadMetaFromStorage()
    if (localMeta.length > 0) {
      setAccounts(localMeta)
    }

    // 2. Detectar ID de usuario activo
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setActiveAccountId(user.id)
      } else {
        setActiveAccountId(null)
      }
    })

    // 3. Sincronizar bóveda con el servidor
    refreshAccounts()

    // 4. Suscribirse a cambios de sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")) {
        setActiveAccountId(session.user.id)
        await refreshAccounts()
      } else if (event === "SIGNED_OUT") {
        setActiveAccountId(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Conmutación atómica a otra cuenta mediante Server Action (sin manipular tokens en cliente)
  const switchAccount = async (targetUserId: string): Promise<boolean> => {
    const targetAccount = accountsRef.current.find((a) => a.userId === targetUserId)
    if (!targetAccount) return false

    if (targetUserId === activeAccountId) {
      setIsSwitcherOpen(false)
      return true
    }

    setIsSwitching(true)
    setSwitchingTargetUsername(targetAccount.username)

    try {
      // 1. Ejecutar conmutación en el servidor
      const res = await switchAccountSessionAction(targetUserId)

      if (!res.success) {
        alert(res.error || "No se ha podido cambiar de cuenta en este momento.")
        setIsSwitching(false)
        setSwitchingTargetUsername(null)
        // Actualizar lista por si la sesión caducada fue retirada
        await refreshAccounts()
        return false
      }

      // 2. Limpieza de cachés efímeras del usuario anterior en el navegador
      try {
        sessionStorage.clear()
      } catch {}

      setActiveAccountId(targetUserId)
      setIsSwitcherOpen(false)

      // 3. Recarga limpia para renderizar completamente los Server Components con las nuevas cookies de sesión
      window.location.href = "/"
      return true
    } catch (err: any) {
      console.error("Fallo general conmutando cuenta:", err)
      alert("No se ha podido cambiar de cuenta.")
      setIsSwitching(false)
      setSwitchingTargetUsername(null)
      return false
    }
  }

  // Cambio rápido a la última cuenta usada (doble toque)
  const quickSwitchLastAccount = async (): Promise<boolean> => {
    const otherAccounts = accountsRef.current.filter((a) => a.userId !== activeAccountId)

    if (otherAccounts.length === 0) {
      // Si solo hay una cuenta, emitir vibración suave y abrir el selector
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate?.([30])
        } catch {}
      }
      setIsSwitcherOpen(true)
      return false
    }

    // Ordenar por última actividad descendente
    otherAccounts.sort((a, b) => (b.lastActiveAt || 0) - (a.lastActiveAt || 0))
    const target = otherAccounts[0]

    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate?.([40])
      } catch {}
    }

    return await switchAccount(target.userId)
  }

  // Añadir una nueva cuenta
  const startAddAccount = async () => {
    try {
      // Prepara la sesión en el servidor y limpia la sesión activa de Supabase
      await prepareAddAccountAction()
      window.location.href = "/login?adding=1"
    } catch (err) {
      console.error("Error iniciando adición de cuenta:", err)
      window.location.href = "/login"
    }
  }

  // Eliminar una cuenta de este dispositivo
  const removeAccount = async (userId: string) => {
    try {
      const res = await removeAccountFromVaultAction(userId)

      // Actualizar estado local
      const updatedAccounts = accountsRef.current.filter((a) => a.userId !== userId)
      setAccounts(updatedAccounts)
      saveMetaToStorage(updatedAccounts)

      if (res.signedOutAll) {
        window.location.href = "/login"
      } else if (res.switchedToRemaining) {
        window.location.href = "/"
      }
    } catch (err) {
      console.error("Error eliminando cuenta:", err)
    }
  }

  return (
    <MultiAccountContext.Provider
      value={{
        accounts,
        activeAccountId,
        isSwitching,
        switchingTargetUsername,
        isSwitcherOpen,
        openSwitcher: () => setIsSwitcherOpen(true),
        closeSwitcher: () => setIsSwitcherOpen(false),
        switchAccount,
        quickSwitchLastAccount,
        startAddAccount,
        removeAccount,
        refreshAccounts,
      }}
    >
      {children}
    </MultiAccountContext.Provider>
  )
}
