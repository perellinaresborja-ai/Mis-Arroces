"use client"

import React, { useState, useEffect } from "react"
import { SUPPORTED_COUNTRIES, CountryDialInfo, normalizePhoneToE164 } from "@/lib/phone"
import { ChevronDown } from "lucide-react"

interface PhoneInputProps {
  id?: string
  name?: string
  value?: string
  onChange?: (e164: string, isValid: boolean) => void
  defaultCountry?: string // "ES" by default
  required?: boolean
  disabled?: boolean
  className?: string
  placeholder?: string
}

export function PhoneInput({
  id = "phone",
  name = "phone",
  value = "",
  onChange,
  defaultCountry = "ES",
  required = false,
  disabled = false,
  className = "",
  placeholder = "612 34 56 78",
}: PhoneInputProps) {
  // Find initial country
  const initialCountry =
    SUPPORTED_COUNTRIES.find((c) => c.code === defaultCountry) || SUPPORTED_COUNTRIES[0]

  const [selectedCountry, setSelectedCountry] = useState<CountryDialInfo>(initialCountry)
  const [phoneNumber, setPhoneNumber] = useState("")

  // If initial value has a +, parse it
  useEffect(() => {
    if (value && value.startsWith("+")) {
      const matched = SUPPORTED_COUNTRIES.find((c) => value.startsWith(c.dialCode))
      if (matched) {
        setSelectedCountry(matched)
        setPhoneNumber(value.substring(matched.dialCode.length))
      } else {
        setPhoneNumber(value)
      }
    } else if (value) {
      setPhoneNumber(value)
    }
  }, [value])

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const found = SUPPORTED_COUNTRIES.find((c) => c.code === e.target.value)
    if (found) {
      setSelectedCountry(found)
      if (phoneNumber.trim()) {
        const norm = normalizePhoneToE164(phoneNumber, found.dialCode)
        onChange?.(norm.e164, norm.valid)
      } else {
        onChange?.("", true)
      }
    }
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9\s]/g, "")
    setPhoneNumber(raw)
    if (raw.trim()) {
      const norm = normalizePhoneToE164(raw, selectedCountry.dialCode)
      onChange?.(norm.e164, norm.valid)
    } else {
      onChange?.("", true)
    }
  }

  // Calculate composite E.164 for hidden form submission
  const norm = normalizePhoneToE164(phoneNumber, selectedCountry.dialCode)
  const e164Value = phoneNumber.trim() ? (norm.valid ? norm.e164 : `${selectedCountry.dialCode}${phoneNumber.replace(/\s/g, "")}`) : ""

  return (
    <div className={`relative flex items-center ${className}`}>
      {/* Hidden input for standard HTML form submissions */}
      <input type="hidden" name={name} value={e164Value} />
      <input type="hidden" name={`${name}_country`} value={selectedCountry.code} />

      {/* Country Prefix Selector */}
      <div className="relative shrink-0 flex items-center bg-muted/50 border-2 border-r-0 border-border/80 rounded-l-xl h-12 px-2 hover:bg-muted/70 transition">
        <span className="text-base mr-1">{selectedCountry.flag}</span>
        <span className="text-xs sm:text-sm font-bold text-foreground font-mono">
          {selectedCountry.dialCode}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-1 pointer-events-none" />

        <select
          value={selectedCountry.code}
          onChange={handleCountryChange}
          disabled={disabled}
          aria-label="Prefijo internacional"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        >
          {SUPPORTED_COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.name} ({c.dialCode})
            </option>
          ))}
        </select>
      </div>

      {/* Number Input */}
      <input
        id={id}
        type="tel"
        autoComplete="tel"
        inputMode="numeric"
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        value={phoneNumber}
        onChange={handleNumberChange}
        className="w-full h-12 px-3.5 bg-transparent border-2 border-border/80 focus:border-charcoal rounded-l-none rounded-r-xl outline-none transition-colors text-charcoal text-base font-medium"
      />
    </div>
  )
}
