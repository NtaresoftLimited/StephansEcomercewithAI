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
            small: 70000,
            medium: 80000,
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
            "Paw Balm Treatment",
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
            "Paw Balm Treatment",
            "Finishing Touches",
        ],
        color: "from-[#4a2c14] to-[#2d1a0d]",
    },
};

export const PRICES: Record<string, Record<string, Record<string, number>>> = {
    dog: {
        standard: { mini: 45000, small: 50000, medium: 60000, large: 70000 },
        premium: { mini: 50000, small: 60000, medium: 70000, large: 80000 },
        super_premium: { mini: 60000, small: 70000, medium: 80000, large: 90000 },
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
    { value: "09:30", label: "9:30 AM" },
    { value: "10:00", label: "10:00 AM" },
    { value: "10:30", label: "10:30 AM" },
    { value: "11:00", label: "11:00 AM" },
    { value: "11:30", label: "11:30 AM" },
    { value: "12:00", label: "12:00 PM" },
    { value: "12:30", label: "12:30 PM" },
    { value: "13:00", label: "1:00 PM" },
    { value: "13:30", label: "1:30 PM" },
    { value: "14:00", label: "2:00 PM" },
    { value: "14:30", label: "2:30 PM" },
    { value: "15:00", label: "3:00 PM" },
    { value: "15:30", label: "3:30 PM" },
    { value: "16:00", label: "4:00 PM" },
    { value: "16:30", label: "4:30 PM" },
    { value: "17:00", label: "5:00 PM" },
    { value: "17:30", label: "5:30 PM" },
    { value: "18:00", label: "6:00 PM" },
    { value: "18:30", label: "6:30 PM (Emergency)" },
    { value: "19:00", label: "7:00 PM (Emergency)" },
    { value: "19:30", label: "7:30 PM (Emergency)" },
    { value: "20:00", label: "8:00 PM (Emergency)" },
];
