export interface CountryPhoneConfig {
  iso2: string;
  name: string;
  dialCode: string; // e.g. "255"
  flagEmoji: string;
  placeholder: string;
}

export const COUNTRIES: CountryPhoneConfig[] = [
  { iso2: "tz", name: "Tanzania", dialCode: "255", flagEmoji: "🇹🇿", placeholder: "766 946 712" },
  { iso2: "ke", name: "Kenya", dialCode: "254", flagEmoji: "🇰🇪", placeholder: "712 345 678" },
  { iso2: "ug", name: "Uganda", dialCode: "256", flagEmoji: "🇺🇬", placeholder: "772 123 456" },
  { iso2: "rw", name: "Rwanda", dialCode: "250", flagEmoji: "🇷🇼", placeholder: "788 123 456" },
  { iso2: "bi", name: "Burundi", dialCode: "257", flagEmoji: "🇧🇮", placeholder: "79 123 456" },
  { iso2: "cd", name: "DR Congo", dialCode: "243", flagEmoji: "🇨🇩", placeholder: "991 234 567" },
  { iso2: "zm", name: "Zambia", dialCode: "260", flagEmoji: "🇿🇲", placeholder: "97 1234567" },
  { iso2: "mw", name: "Malawi", dialCode: "265", flagEmoji: "🇲🇼", placeholder: "991 23 45 67" },
  { iso2: "mz", name: "Mozambique", dialCode: "258", flagEmoji: "🇲🇿", placeholder: "82 123 4567" },
  { iso2: "za", name: "South Africa", dialCode: "27", flagEmoji: "🇿🇦", placeholder: "82 123 4567" },
  { iso2: "et", name: "Ethiopia", dialCode: "251", flagEmoji: "🇪🇹", placeholder: "91 123 4567" },
  { iso2: "ng", name: "Nigeria", dialCode: "234", flagEmoji: "🇳🇬", placeholder: "802 123 4567" },
  { iso2: "gh", name: "Ghana", dialCode: "233", flagEmoji: "🇬🇭", placeholder: "24 123 4567" },
  { iso2: "eg", name: "Egypt", dialCode: "20", flagEmoji: "🇪🇬", placeholder: "100 123 4567" },
  { iso2: "ae", name: "United Arab Emirates", dialCode: "971", flagEmoji: "🇦🇪", placeholder: "50 123 4567" },
  { iso2: "om", name: "Oman", dialCode: "968", flagEmoji: "🇴🇲", placeholder: "9212 3456" },
  { iso2: "qa", name: "Qatar", dialCode: "974", flagEmoji: "🇶🇦", placeholder: "3312 3456" },
  { iso2: "sa", name: "Saudi Arabia", dialCode: "966", flagEmoji: "🇸🇦", placeholder: "50 123 4567" },
  { iso2: "gb", name: "United Kingdom", dialCode: "44", flagEmoji: "🇬🇧", placeholder: "7400 123456" },
  { iso2: "us", name: "United States", dialCode: "1", flagEmoji: "🇺🇸", placeholder: "201 555 0123" },
  { iso2: "ca", name: "Canada", dialCode: "1", flagEmoji: "🇨🇦", placeholder: "416 555 0123" },
  { iso2: "in", name: "India", dialCode: "91", flagEmoji: "🇮🇳", placeholder: "98765 43210" },
  { iso2: "cn", name: "China", dialCode: "86", flagEmoji: "🇨🇳", placeholder: "131 2345 6789" },
  { iso2: "de", name: "Germany", dialCode: "49", flagEmoji: "🇩🇪", placeholder: "1512 3456789" },
  { iso2: "fr", name: "France", dialCode: "33", flagEmoji: "🇫🇷", placeholder: "6 12 34 56 78" },
  { iso2: "it", name: "Italy", dialCode: "39", flagEmoji: "🇮🇹", placeholder: "312 345 6789" },
  { iso2: "nl", name: "Netherlands", dialCode: "31", flagEmoji: "🇳🇱", placeholder: "6 12345678" },
  { iso2: "tr", name: "Turkey", dialCode: "90", flagEmoji: "🇹🇷", placeholder: "501 234 56 78" },
  { iso2: "au", name: "Australia", dialCode: "61", flagEmoji: "🇦🇺", placeholder: "412 345 678" },
];

// Sort by longest dialCode first so +255 matches before +25 or +2
const COUNTRIES_BY_DIAL_LENGTH = [...COUNTRIES].sort(
  (a, b) => b.dialCode.length - a.dialCode.length
);

export function getFlagUrl(iso2: string): string {
  return `https://flagcdn.com/w40/${iso2.toLowerCase()}.png`;
}

export function getCountryByIso(iso2: string): CountryPhoneConfig {
  return (
    COUNTRIES.find((c) => c.iso2.toLowerCase() === iso2.toLowerCase()) ||
    COUNTRIES[0]
  );
}

/**
 * Detect country from a raw phone number or E.164 string
 */
export function detectCountryFromInput(
  rawInput: string,
  fallbackIso2 = "tz"
): CountryPhoneConfig {
  const cleaned = rawInput.trim();
  if (!cleaned) return getCountryByIso(fallbackIso2);

  let digits = cleaned.replace(/\D/g, "");
  if (cleaned.startsWith("+") || digits.startsWith("00")) {
    if (digits.startsWith("00")) digits = digits.slice(2);
    for (const country of COUNTRIES_BY_DIAL_LENGTH) {
      if (digits.startsWith(country.dialCode)) {
        return country;
      }
    }
  }

  // If 12 digits starting with a known 3-digit East African code (255, 254, 256, 250, 257)
  if (digits.length >= 11) {
    for (const country of COUNTRIES_BY_DIAL_LENGTH) {
      if (digits.startsWith(country.dialCode)) {
        return country;
      }
    }
  }

  return getCountryByIso(fallbackIso2);
}

/**
 * Format local subscriber digits into readable groups (e.g. 766 946 712)
 */
export function formatNationalDigits(localDigits: string): string {
  const d = localDigits.replace(/\D/g, "");
  if (!d) return "";
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 9)}`;
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 10)} ${d.slice(10)}`.trim();
}

/**
 * Normalize any raw phone number into E.164 (+255766946712), formatted international
 * (+255 766 946 712), and matched CountryPhoneConfig.
 */
export function normalizeInternationalPhone(
  rawInput: string,
  selectedIso2 = "tz"
): {
  e164: string;
  formattedInternational: string;
  nationalFormatted: string;
  country: CountryPhoneConfig;
  isValid: boolean;
} {
  const cleaned = (rawInput || "").trim();
  const selectedCountry = getCountryByIso(selectedIso2);

  if (!cleaned) {
    return {
      e164: "",
      formattedInternational: "",
      nationalFormatted: "",
      country: selectedCountry,
      isValid: false,
    };
  }

  let digits = cleaned.replace(/\D/g, "");
  if (!digits) {
    return {
      e164: "",
      formattedInternational: "",
      nationalFormatted: "",
      country: selectedCountry,
      isValid: false,
    };
  }

  let activeCountry = selectedCountry;
  let subscriberDigits = digits;

  // 1. Explicit international prefix (+ or 00)
  if (cleaned.startsWith("+") || digits.startsWith("00")) {
    if (digits.startsWith("00")) {
      digits = digits.slice(2);
    }
    const detected = COUNTRIES_BY_DIAL_LENGTH.find((c) =>
      digits.startsWith(c.dialCode)
    );
    if (detected) {
      activeCountry = detected;
      subscriberDigits = digits.slice(detected.dialCode.length);
    }
  } else if (
    digits.startsWith(selectedCountry.dialCode) &&
    digits.length >= selectedCountry.dialCode.length + 8
  ) {
    // User typed full international number without '+' (e.g. 255766946712)
    subscriberDigits = digits.slice(selectedCountry.dialCode.length);
  } else if (digits.length >= 11) {
    // Check if user pasted another country's full number without '+'
    const detected = COUNTRIES_BY_DIAL_LENGTH.find(
      (c) => digits.startsWith(c.dialCode) && digits.length >= c.dialCode.length + 8
    );
    if (detected) {
      activeCountry = detected;
      subscriberDigits = digits.slice(detected.dialCode.length);
    }
  }

  // Strip leading trunk '0' from subscriber number (e.g. 0766946712 -> 766946712)
  if (subscriberDigits.startsWith("0")) {
    subscriberDigits = subscriberDigits.replace(/^0+/, "");
  }

  const e164 = subscriberDigits
    ? `+${activeCountry.dialCode}${subscriberDigits}`
    : `+${activeCountry.dialCode}`;
  const nationalFormatted = formatNationalDigits(subscriberDigits);
  const formattedInternational = subscriberDigits
    ? `+${activeCountry.dialCode} ${nationalFormatted}`
    : `+${activeCountry.dialCode}`;

  return {
    e164,
    formattedInternational,
    nationalFormatted,
    country: activeCountry,
    isValid: subscriberDigits.length >= 7 && subscriberDigits.length <= 12,
  };
}
