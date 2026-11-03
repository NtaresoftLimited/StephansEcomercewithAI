"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import {
  COUNTRIES,
  type CountryPhoneConfig,
  getCountryByIso,
  getFlagUrl,
  normalizeInternationalPhone,
} from "@/lib/phone";

interface InternationalPhonePillProps {
  id: string;
  label: string;
  value: string;
  countryIso: string;
  onChange: (rawValue: string, countryIso: string, normalizedE164: string, formattedDisplay: string) => void;
  allowEmail?: boolean;
  placeholder?: string;
  accentColor?: "coffee" | "whatsapp";
  required?: boolean;
}

export function InternationalPhonePill({
  id,
  label,
  value,
  countryIso,
  onChange,
  allowEmail = false,
  placeholder,
  accentColor = "coffee",
  required = true,
}: InternationalPhonePillProps) {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedCountry = getCountryByIso(countryIso);

  // Determine whether the current input looks like an email address
  const isTypingEmail =
    allowEmail &&
    value.trim().length > 0 &&
    (/[a-zA-Z@]/.test(value.trim()) && !/^[+\d\s()-]+$/.test(value.trim()));

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    // If user is typing an email and allowEmail is true, pass raw string
    if (
      allowEmail &&
      raw.trim().length > 0 &&
      (/[a-zA-Z@]/.test(raw.trim()) && !/^[+\d\s()-]+$/.test(raw.trim()))
    ) {
      onChange(raw, countryIso, raw.trim(), raw.trim());
      return;
    }

    const parsed = normalizeInternationalPhone(raw, countryIso);
    // Auto-update country if user pasted or typed an international code like +254...
    const nextIso = parsed.country.iso2;
    const displayValue =
      raw.startsWith("+") || raw.startsWith("00")
        ? parsed.formattedInternational
        : parsed.nationalFormatted || raw;

    onChange(displayValue, nextIso, parsed.e164, parsed.formattedInternational);
  };

  const handleSelectCountry = (country: CountryPhoneConfig) => {
    setOpenDropdown(false);
    setSearchQuery("");
    // Re-normalize existing digits with the newly selected country
    const stripped = value.replace(/^\+\d+\s*/, "");
    const parsed = normalizeInternationalPhone(stripped, country.iso2);
    onChange(
      parsed.nationalFormatted || stripped,
      country.iso2,
      parsed.e164,
      parsed.formattedInternational
    );
  };

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.dialCode.includes(searchQuery.replace(/\D/g, "")) ||
      c.iso2.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const focusBorderClass =
    accentColor === "whatsapp"
      ? "focus-within:border-[#25D366] dark:focus-within:border-[#25D366]"
      : "focus-within:border-[#3e220f] dark:focus-within:border-amber-400";

  return (
    <div ref={containerRef} className="relative">
      <div
        className={`relative flex h-14 w-full items-center rounded-full border border-zinc-300 bg-transparent px-4 transition-colors dark:border-zinc-700 ${focusBorderClass}`}
      >
        <label
          htmlFor={id}
          className="absolute -top-2.5 left-4 z-10 bg-white px-1.5 text-xs font-medium text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400"
        >
          {label}
        </label>

        {/* Country Flag & Dial Code Selector (Hidden only when user is actively typing an email) */}
        {!isTypingEmail && (
          <button
            type="button"
            onClick={() => setOpenDropdown((prev) => !prev)}
            aria-label="Select country code"
            className="mr-2.5 inline-flex shrink-0 items-center gap-1.5 rounded-full border border-zinc-200/80 bg-zinc-50/80 px-2.5 py-1 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
          >
            <img
              src={getFlagUrl(selectedCountry.iso2)}
              alt={selectedCountry.name}
              width={20}
              height={15}
              className="h-3.5 w-5 shrink-0 rounded-[2px] object-cover shadow-2xs"
            />
            <span className="font-mono text-xs font-bold">
              +{selectedCountry.dialCode}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
          </button>
        )}

        <input
          id={id}
          type="text"
          required={required}
          value={value}
          onChange={handleInputChange}
          placeholder={
            placeholder ||
            (allowEmail
              ? `${selectedCountry.placeholder} or email`
              : selectedCountry.placeholder)
          }
          autoComplete={allowEmail ? "username" : "tel"}
          className="h-full w-full min-w-0 bg-transparent text-left text-base text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
        />
      </div>

      {/* Country Picker Dropdown */}
      {openDropdown && !isTypingEmail && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-64 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
          <div className="border-b border-zinc-100 p-2 dark:border-zinc-800">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search country or code (+255, Kenya...)"
              autoFocus
              className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-xs text-zinc-800 outline-none focus:border-[#3e220f] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>
          <div className="max-h-48 overflow-y-auto py-1">
            {filteredCountries.map((country) => {
              const isSelected = country.iso2 === selectedCountry.iso2;
              return (
                <button
                  key={`${country.iso2}-${country.dialCode}`}
                  type="button"
                  onClick={() => handleSelectCountry(country)}
                  className={`flex w-full items-center justify-between px-3.5 py-2 text-left text-xs transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                    isSelected
                      ? "bg-amber-50/70 font-bold text-[#3e220f] dark:bg-amber-950/30 dark:text-amber-400"
                      : "text-zinc-700 dark:text-zinc-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <img
                      src={getFlagUrl(country.iso2)}
                      alt={country.name}
                      width={20}
                      height={15}
                      className="h-3.5 w-5 shrink-0 rounded-[2px] object-cover shadow-2xs"
                    />
                    <span className="truncate">{country.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
                      +{country.dialCode}
                    </span>
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 text-[#c77e35]" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
