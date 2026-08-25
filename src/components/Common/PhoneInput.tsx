'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Icon } from '@iconify/react/dist/iconify.js'

export interface CountryCode {
  name: string
  code: string   // ISO 2-letter code
  dial: string   // e.g. "+91"
  flag: string   // emoji flag fallback
  minLen: number // min digits (excluding dial code)
  maxLen: number // max digits (excluding dial code)
}

export const COUNTRY_CODES: CountryCode[] = [
  { name: 'India', code: 'IN', dial: '+91', flag: '🇮🇳', minLen: 10, maxLen: 10 },
  { name: 'United States', code: 'US', dial: '+1', flag: '🇺🇸', minLen: 10, maxLen: 10 },
  { name: 'United Kingdom', code: 'GB', dial: '+44', flag: '🇬🇧', minLen: 10, maxLen: 10 },
  { name: 'UAE', code: 'AE', dial: '+971', flag: '🇦🇪', minLen: 9, maxLen: 9 },
  { name: 'Saudi Arabia', code: 'SA', dial: '+966', flag: '🇸🇦', minLen: 9, maxLen: 9 },
  { name: 'Australia', code: 'AU', dial: '+61', flag: '🇦🇺', minLen: 9, maxLen: 9 },
  { name: 'Canada', code: 'CA', dial: '+1', flag: '🇨🇦', minLen: 10, maxLen: 10 },
  { name: 'Germany', code: 'DE', dial: '+49', flag: '🇩🇪', minLen: 10, maxLen: 11 },
  { name: 'France', code: 'FR', dial: '+33', flag: '🇫🇷', minLen: 9, maxLen: 9 },
  { name: 'Singapore', code: 'SG', dial: '+65', flag: '🇸🇬', minLen: 8, maxLen: 8 },
  { name: 'Malaysia', code: 'MY', dial: '+60', flag: '🇲🇾', minLen: 9, maxLen: 10 },
  { name: 'Qatar', code: 'QA', dial: '+974', flag: '🇶🇦', minLen: 8, maxLen: 8 },
  { name: 'Kuwait', code: 'KW', dial: '+965', flag: '🇰🇼', minLen: 8, maxLen: 8 },
  { name: 'Bahrain', code: 'BH', dial: '+973', flag: '🇧🇭', minLen: 8, maxLen: 8 },
  { name: 'Oman', code: 'OM', dial: '+968', flag: '🇴🇲', minLen: 8, maxLen: 8 },
  { name: 'Nepal', code: 'NP', dial: '+977', flag: '🇳🇵', minLen: 10, maxLen: 10 },
  { name: 'Bangladesh', code: 'BD', dial: '+880', flag: '🇧🇩', minLen: 10, maxLen: 10 },
  { name: 'Sri Lanka', code: 'LK', dial: '+94', flag: '🇱🇰', minLen: 9, maxLen: 9 },
  { name: 'Pakistan', code: 'PK', dial: '+92', flag: '🇵🇰', minLen: 10, maxLen: 10 },
  { name: 'South Africa', code: 'ZA', dial: '+27', flag: '🇿🇦', minLen: 9, maxLen: 9 },
  { name: 'Nigeria', code: 'NG', dial: '+234', flag: '🇳🇬', minLen: 10, maxLen: 10 },
  { name: 'Kenya', code: 'KE', dial: '+254', flag: '🇰🇪', minLen: 9, maxLen: 9 },
  { name: 'Japan', code: 'JP', dial: '+81', flag: '🇯🇵', minLen: 10, maxLen: 11 },
  { name: 'China', code: 'CN', dial: '+86', flag: '🇨🇳', minLen: 11, maxLen: 11 },
  { name: 'South Korea', code: 'KR', dial: '+82', flag: '🇰🇷', minLen: 9, maxLen: 10 },
  { name: 'Indonesia', code: 'ID', dial: '+62', flag: '🇮🇩', minLen: 9, maxLen: 12 },
  { name: 'Philippines', code: 'PH', dial: '+63', flag: '🇵🇭', minLen: 10, maxLen: 10 },
  { name: 'Thailand', code: 'TH', dial: '+66', flag: '🇹🇭', minLen: 9, maxLen: 9 },
  { name: 'Vietnam', code: 'VN', dial: '+84', flag: '🇻🇳', minLen: 9, maxLen: 10 },
  { name: 'New Zealand', code: 'NZ', dial: '+64', flag: '🇳🇿', minLen: 9, maxLen: 9 },
  { name: 'Brazil', code: 'BR', dial: '+55', flag: '🇧🇷', minLen: 10, maxLen: 11 },
  { name: 'Mexico', code: 'MX', dial: '+52', flag: '🇲🇽', minLen: 10, maxLen: 10 },
  { name: 'Argentina', code: 'AR', dial: '+54', flag: '🇦🇷', minLen: 10, maxLen: 10 },
  { name: 'Italy', code: 'IT', dial: '+39', flag: '🇮🇹', minLen: 9, maxLen: 11 },
  { name: 'Spain', code: 'ES', dial: '+34', flag: '🇪🇸', minLen: 9, maxLen: 9 },
  { name: 'Netherlands', code: 'NL', dial: '+31', flag: '🇳🇱', minLen: 9, maxLen: 9 },
  { name: 'Switzerland', code: 'CH', dial: '+41', flag: '🇨🇭', minLen: 9, maxLen: 9 },
  { name: 'Sweden', code: 'SE', dial: '+46', flag: '🇸🇪', minLen: 9, maxLen: 9 },
  { name: 'Norway', code: 'NO', dial: '+47', flag: '🇳🇴', minLen: 8, maxLen: 8 },
  { name: 'Denmark', code: 'DK', dial: '+45', flag: '🇩🇰', minLen: 8, maxLen: 8 },
  { name: 'Ireland', code: 'IE', dial: '+353', flag: '🇮🇪', minLen: 9, maxLen: 9 },
  { name: 'Portugal', code: 'PT', dial: '+351', flag: '🇵🇹', minLen: 9, maxLen: 9 },
  { name: 'Russia', code: 'RU', dial: '+7', flag: '🇷🇺', minLen: 10, maxLen: 10 },
  { name: 'Turkey', code: 'TR', dial: '+90', flag: '🇹🇷', minLen: 10, maxLen: 10 },
  { name: 'Egypt', code: 'EG', dial: '+20', flag: '🇪🇬', minLen: 10, maxLen: 10 },
  { name: 'Israel', code: 'IL', dial: '+972', flag: '🇮🇱', minLen: 9, maxLen: 9 },
  { name: 'Ghana', code: 'GH', dial: '+233', flag: '🇬🇭', minLen: 9, maxLen: 9 },
  { name: 'Tanzania', code: 'TZ', dial: '+255', flag: '🇹🇿', minLen: 9, maxLen: 9 },
  { name: 'Uganda', code: 'UG', dial: '+256', flag: '🇺🇬', minLen: 9, maxLen: 9 },
  { name: 'Ethiopia', code: 'ET', dial: '+251', flag: '🇪🇹', minLen: 9, maxLen: 9 },
  { name: 'Cameroon', code: 'CM', dial: '+237', flag: '🇨🇲', minLen: 9, maxLen: 9 },
  { name: 'Afghanistan', code: 'AF', dial: '+93', flag: '🇦🇫', minLen: 9, maxLen: 9 },
  { name: 'Myanmar', code: 'MM', dial: '+95', flag: '🇲🇲', minLen: 8, maxLen: 9 },
  { name: 'Cambodia', code: 'KH', dial: '+855', flag: '🇰🇭', minLen: 8, maxLen: 9 },
  { name: 'Hong Kong', code: 'HK', dial: '+852', flag: '🇭🇰', minLen: 8, maxLen: 8 },
]

interface PhoneInputProps {
  value: string           // full value: "+91XXXXXXXXXX"
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  className?: string
  inputClassName?: string
  label?: string
  id?: string
}

export default function PhoneInput({
  value,
  onChange,
  placeholder,
  required = false,
  className = '',
  inputClassName = '',
  label,
  id,
}: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(COUNTRY_CODES[0]) // default India
  const [localNumber, setLocalNumber] = useState('')
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // On mount: if value already has a dial code, parse it
  useEffect(() => {
    if (value) {
      const found = COUNTRY_CODES.find(c => value.startsWith(c.dial))
      if (found) {
        setSelectedCountry(found)
        setLocalNumber(value.slice(found.dial.length))
      } else {
        setLocalNumber(value)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleCountrySelect = (country: CountryCode) => {
    setSelectedCountry(country)
    setOpen(false)
    setSearch('')
    const combined = country.dial + localNumber
    onChange(combined)
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits (and optionally spaces/dashes for formatting)
    const raw = e.target.value.replace(/[^\d\s\-]/g, '')
    setLocalNumber(raw)
    const combined = selectedCountry.dial + raw
    onChange(combined)
  }

  const filteredCountries = search
    ? COUNTRY_CODES.filter(
        c =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.dial.includes(search) ||
          c.code.toLowerCase().includes(search.toLowerCase())
      )
    : COUNTRY_CODES

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const baseInput = `bg-white dark:bg-dark border border-slate-200 dark:border-dark_border rounded-xl text-midnight_text dark:text-white focus:outline-none focus:border-primary font-medium`

  return (
    <div className={`w-full ${className}`} suppressHydrationWarning>
      {label && (
        <label htmlFor={id} className="block font-bold text-midnight_text dark:text-white mb-1.5 text-xs sm:text-sm" suppressHydrationWarning>
          {label}
        </label>
      )}
      <div className="flex items-stretch gap-0 w-full relative" suppressHydrationWarning>
        {/* Country code selector */}
        <div className="relative flex-shrink-0" ref={dropdownRef} suppressHydrationWarning>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            suppressHydrationWarning
            className={`h-full flex items-center gap-1.5 px-2.5 sm:px-3 py-2.5 text-xs sm:text-sm font-bold border border-r-0 rounded-l-xl rounded-r-none ${baseInput} hover:bg-slate-50 dark:hover:bg-darklight transition-colors cursor-pointer select-none`}
            title={`${selectedCountry.name} (${selectedCountry.dial})`}
            aria-label="Select Country"
          >
            {mounted ? (
              <Icon
                icon={`circle-flags:${selectedCountry.code.toLowerCase()}`}
                className="w-5 h-5 rounded-full shrink-0 shadow-2xs"
              />
            ) : (
              <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0 inline-block" />
            )}
            <span className="text-slate-800 dark:text-white font-bold" suppressHydrationWarning>{selectedCountry.dial}</span>
            <Icon icon="mdi:chevron-down" className={`text-slate-400 text-xs transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
          </button>

          {open && (
            <div className="absolute top-full left-0 z-50 mt-1.5 w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-dark border border-slate-100 dark:border-dark_border rounded-2xl shadow-lg overflow-hidden">
              <div className="p-2 border-b border-slate-100 dark:border-dark_border bg-slate-50/50 dark:bg-darklight/40">
                <div className="relative flex items-center">
                  <Icon icon="mdi:magnify" className="absolute left-2.5 text-slate-400 text-sm pointer-events-none" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search country or code..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs sm:text-sm bg-white dark:bg-dark border border-slate-200/60 dark:border-dark_border rounded-xl text-midnight_text dark:text-white focus:outline-none focus:border-primary font-medium shadow-none"
                  />
                </div>
              </div>

              <ul
                className="max-h-60 overflow-y-auto no-scrollbar py-1"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {filteredCountries.map(country => {
                  const isSelected = selectedCountry.code === country.code && selectedCountry.dial === country.dial
                  return (
                    <li key={country.code + country.dial}>
                      <button
                        type="button"
                        onClick={() => handleCountrySelect(country)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs sm:text-sm text-left hover:bg-slate-50 dark:hover:bg-darklight transition-colors cursor-pointer !border-0 !border-none !shadow-none ${
                          isSelected
                            ? 'bg-primary/5 font-bold text-primary'
                            : 'text-slate-700 dark:text-white'
                        }`}
                      >
                        <Icon
                          icon={`circle-flags:${country.code.toLowerCase()}`}
                          className="w-5 h-5 rounded-full shrink-0 shadow-2xs"
                        />
                        <span className="flex-1 truncate font-medium">{country.name}</span>
                        <span className={`text-xs font-semibold ${isSelected ? 'text-primary' : 'text-slate-400'}`}>
                          {country.dial}
                        </span>
                      </button>
                    </li>
                  )
                })}
                {filteredCountries.length === 0 && (
                  <li className="px-4 py-4 text-xs text-slate-400 text-center font-medium">
                    No countries found
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Phone number input */}
        <input
          id={id}
          type="tel"
          required={required}
          value={localNumber}
          onChange={handleNumberChange}
          placeholder={placeholder || `e.g. ${selectedCountry.minLen === selectedCountry.maxLen ? '9'.repeat(selectedCountry.maxLen) : '9'.repeat(selectedCountry.minLen)}`}
          maxLength={selectedCountry.maxLen + 5}
          className={`flex-1 min-w-0 px-3.5 py-2.5 text-xs sm:text-sm rounded-r-xl rounded-l-none border border-slate-200 dark:border-dark_border bg-white dark:bg-dark text-midnight_text dark:text-white focus:outline-none focus:border-primary font-medium ${inputClassName}`}
        />
      </div>
    </div>
  )
}
