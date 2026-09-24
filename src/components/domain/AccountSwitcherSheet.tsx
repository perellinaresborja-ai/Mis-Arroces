'use client'

import React, { useState } from "react"
import { useMultiAccount } from "@/components/providers/MultiAccountProvider"
import { AccountPublicProfile } from "@/app/actions/account-switcher"
import { Check, Plus, User, X, LogOut, Loader2, Users } from "lucide-react"
import Image from "next/image"

export function AccountSwitcherSheet() {
  const {
    accounts,
    activeAccountId,
    isSwitching,
    switchingTargetUsername,
    isSwitcherOpen,
    closeSwitcher,
    switchAccount,
    startAddAccount,
    removeAccount,
  } = useMultiAccount()

  const [managingAccounts, setManagingAccounts] = useState(false)
  const [accountToRemove, setAccountToRemove] = useState<AccountPublicProfile | null>(null)

  if (!isSwitcherOpen && !isSwitching) return null

  return (
    <>
      {/* OVERLAY DE CAMBIO ACTIVO */}
      {isSwitching && (
        <div className="fixed inset-0 z-[110] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md">
          <div className="bg-card border border-border p-6 rounded-3xl shadow-xl flex flex-col items-center space-y-3 max-w-xs text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" aria-hidden="true" focusable="false" />
            <div className="space-y-1">
              <p className="font-bold text-base text-foreground">
                Cambiando de cuenta
              </p>
              {switchingTargetUsername && (
                <p className="text-xs text-muted-foreground">
                  Entrando como <strong>@{switchingTargetUsername}</strong>...
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL / BOTTOM SHEET SELECTOR DE CUENTAS */}
      {isSwitcherOpen && !isSwitching && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
          <div 
            className="w-full sm:max-w-md bg-card border border-border rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera */}
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-border/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Users className="w-4 h-4" aria-hidden="true" focusable="false" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-foreground tracking-tight">
                    Cuentas
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {accounts.length} {accounts.length === 1 ? "cuenta iniciada" : "cuentas iniciadas"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {accounts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setManagingAccounts(!managingAccounts)}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition"
                  >
                    {managingAccounts ? "Listo" : "Gestionar"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={closeSwitcher}
                  className="w-8 h-8 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition"
                  aria-label="Cerrar selector de cuentas"
                >
                  <X className="w-4 h-4" aria-hidden="true" focusable="false" />
                </button>
              </div>
            </div>

            {/* Lista de cuentas */}
            <div className="p-3 sm:p-4 space-y-1.5 max-h-[60vh] overflow-y-auto">
              {accounts.map((acc) => {
                const isActive = acc.userId === activeAccountId

                return (
                  <div
                    key={acc.userId}
                    className={`group w-full flex items-center justify-between p-3 rounded-2xl transition border ${
                      isActive
                        ? "bg-primary/5 border-primary/20 shadow-xs"
                        : "bg-background/40 hover:bg-muted/40 border-transparent hover:border-border/60"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => !managingAccounts && switchAccount(acc.userId)}
                      disabled={managingAccounts}
                      className="flex-1 flex items-center gap-3.5 text-left min-w-0"
                    >
                      {/* Avatar */}
                      <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border border-border/80 bg-muted flex items-center justify-center">
                        {acc.avatarUrl ? (
                          <Image
                            src={acc.avatarUrl}
                            alt={acc.displayName || acc.username}
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-muted-foreground" aria-hidden="true" focusable="false" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm text-foreground truncate">
                            {acc.displayName || acc.username}
                          </p>
                          {isActive && (
                            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 shrink-0">
                              Activa
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          @{acc.username}
                        </p>
                      </div>
                    </button>

                    {/* Checkmark o botón de eliminar */}
                    <div className="pl-2 shrink-0">
                      {managingAccounts ? (
                        <button
                          type="button"
                          onClick={() => setAccountToRemove(acc)}
                          className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition"
                          title="Cerrar sesión de esta cuenta en este dispositivo"
                          aria-label={`Cerrar sesión de @${acc.username}`}
                        >
                          <LogOut className="w-4 h-4" aria-hidden="true" focusable="false" />
                        </button>
                      ) : isActive ? (
                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" aria-hidden="true" focusable="false" />
                        </div>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Botón Añadir Cuenta */}
            <div className="p-3 sm:p-4 pt-1 border-t border-border/60 bg-muted/10">
              <button
                type="button"
                onClick={startAddAccount}
                className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl font-bold text-sm bg-card hover:bg-muted/80 text-foreground border border-border shadow-xs hover:border-primary/40 transition cursor-pointer"
              >
                <Plus className="w-4 h-4 text-primary" aria-hidden="true" focusable="false" />
                <span>Añadir cuenta de misarroces</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMACIÓN DE CERRAR SESIÓN DE UNA CUENTA */}
      {accountToRemove && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-card border border-border p-6 rounded-3xl max-w-sm w-full space-y-4 shadow-2xl">
            <h4 className="font-bold text-base text-foreground">
              ¿Cerrar sesión de @{accountToRemove.username}?
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              La cuenta se desconectará de este dispositivo. Para volver a usarla tendrás que introducir de nuevo tu email y contraseña.
            </p>
            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setAccountToRemove(null)}
                className="flex-1 py-2.5 rounded-xl font-semibold text-xs bg-muted hover:bg-muted/80 text-foreground transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  const target = accountToRemove
                  setAccountToRemove(null)
                  await removeAccount(target.userId)
                }}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-red-600 hover:bg-red-700 text-white transition"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
