export const DOG_PACKAGES = {
    standard: {
        name: "Standard Package",
        prices: {
            mini: 45000,
            small: 50000,
            medium: 60000,
            large: 70000,
        },
        services: [
            "Warm bath",
            "Blow dry",
            "Ear cleaning",
            "Brush out",
            "Sanitary trim (if needed)",
        ],
        color: "from-[#8b5a2b] to-[#6b3e1e]",
    },
    premium: {
        name: "Premium Package",
        prices: {
            mini: 50000,
            small: 60000,
            medium: 70000,
            large: 80000,
        },
        services: [
            "Warm Deep Clean Bath",
            "Blow dry",
            "Ear cleaning",
            "Full Hair Cut or Styling",
            "Nail Trim",
            "Teeth Brushing",
        ],
        color: "from-[#6b3e1e] to-[#4a2c14]",
        popular: true,
    },
    super_premium: {
        name: "Super Premium Package",
        prices: {
            mini: 60000,
            small: 75000,
            medium: 85000,
            large: 90000,
        },
        services: [
            "Warm Deep Clean Bath",
            "Blow dry",
            "Ear cleaning",
            "Full Hair Cut or Styling",
            "Nail Trim",
            "Teeth Brushing",
            "De-shedding",
            "Flea & Tick Treatment",
            "Soothing Paw Balm",
            "Finishing Touches",
        ],
        color: "from-[#4a2c14] to-[#2d1a0d]",
    },
};

export const CAT_PACKAGES = {
    standard: {
        name: "Standard Package",
        prices: {
            kitten: 45000,
            adult: 60000,
        },
        services: [
            "Warm bath",
            "Blow dry",
            "Ear cleaning",
            "Brush out",
            "Sanitary trim (if needed)",
        ],
        color: "from-[#8b5a2b] to-[#6b3e1e]",
    },
    premium: {
        name: "Premium Package",
        prices: {
            kitten: 60000,
            adult: 75000,
        },
        services: [
            "Warm Deep Clean Bath",
            "Blow dry",
            "Ear cleaning",
            "Full Hair Cut or Styling",
            "Nail Trim",
            "Teeth Brushing",
        ],
        color: "from-[#6b3e1e] to-[#4a2c14]",
        popular: true,
    },
    super_premium: {
        name: "Super Premium Package",
        prices: {
            kitten: 75000,
            adult: 85000,
        },
        services: [
            "Warm Deep Clean Bath",
            "Blow dry",
            "Ear cleaning",
            "Full Hair Cut or Styling",
            "Nail Trim",
            "Teeth Brushing",
            "De-shedding",
            "Flea & Tick Treatment",
            "Soothing Paw Balm",
            "Finishing Touches",
        ],
        color: "from-[#4a2c14] to-[#2d1a0d]",
    },
};

export const PRICES: Record<string, Record<string, Record<string, number>>> = {
    dog: {
        standard: { mini: 45000, small: 50000, medium: 60000, large: 70000 },
        premium: { mini: 50000, small: 60000, medium: 70000, large: 80000 },
        super_premium: { mini: 60000, small: 75000, medium: 85000, large: 90000 },
    },
    cat: {
        standard: { kitten: 45000, adult: 60000 },
        premium: { kitten: 60000, adult: 75000 },
        super_premium: { kitten: 75000, adult: 85000 },
    },
};

export const BREED_SIZES = {
    dog: [
        { value: "mini", label: "Mini Breeds" },
        { value: "small", label: "Small Breeds" },
        { value: "medium", label: "Medium Breeds" },
        { value: "large", label: "Large Breeds" },
    ],
    cat: [
        { value: "kitten", label: "Kitten (2-7 months)" },
        { value: "adult", label: "Adult Cat (7+ months)" },
    ],
};

export const SIZE_LABELS: Record<string, string> = {
    mini: "Mini Breeds",
    small: "Small Breeds",
    medium: "Medium Breeds",
    large: "Large Breeds",
    kitten: "Kittens (2-7 months)",
    adult: "Adults (7+ months)",
};

export const VALID_TIMES = [
    { value: "09:00", label: "9:00 AM" },
    { value: "10:00", label: "10:00 AM" },
    { value: "11:00", label: "11:00 AM" },
    { value: "12:00", label: "12:00 PM" },
    { value: "14:00", label: "2:00 PM" },
    { value: "15:00", label: "3:00 PM" },
    { value: "16:00", label: "4:00 PM" },
];
