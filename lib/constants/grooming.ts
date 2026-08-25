export const DOG_PACKAGES = {
    standard: {
        name: "Essential Package",
        prices: {
            small: 60000,
            medium: 70000,
            large: 80000,
        },
        services: [
            "Warm Deep Clean bath",
            "Blow Dry",
            "Ear cleaning",
            "Full Coat Brush Out & Sanitary trim (Private area & Belly)",
        ],
        color: "from-[#c77e35] to-[#c77e35]",
    },
    super_premium: {
        name: "Signature Package",
        prices: {
            small: 80000,
            medium: 90000,
            large: 100000,
        },
        services: [
            "Warm Deep Clean bath",
            "Blow Dry",
            "Ear care",
            "Nail Care",
            "Dental Care",
            "De-shedding",
            "Full Hair Cut or Styling",
            "Flea & Tick Treatment",
            "Paw Balm Treatment & Finishing Touches",
        ],
        color: "from-[#c77e35] to-[#2d1a0d]",
        popular: true,
    },
};

export const CAT_PACKAGES = {
    standard: {
        name: "Essential Package",
        prices: {
            kitten: 60000,
            adult: 70000,
            senior: 80000,
        },
        services: [
            "Warm Deep Clean bath",
            "Blow Dry",
            "Ear cleaning",
            "Full Coat Brush Out & Sanitary trim (Private area & Belly)",
        ],
        color: "from-[#c77e35] to-[#c77e35]",
    },
    super_premium: {
        name: "Signature Package",
        prices: {
            kitten: 80000,
            adult: 90000,
            senior: 100000,
        },
        services: [
            "Warm Deep Clean bath",
            "Blow Dry",
            "Ear care",
            "Nail Care",
            "Dental Care",
            "De-shedding",
            "Full Hair Cut or Styling",
            "Flea & Tick Treatment",
            "Paw Balm Treatment & Finishing Touches",
        ],
        color: "from-[#c77e35] to-[#2d1a0d]",
        popular: true,
    },
};

export const SMALL_ANIMAL_PACKAGES = {
    super_premium: {
        name: "Signature Package",
        prices: {
            hamster: 100000,
            junior_rabbit: 100000,
            adult_rabbit: 150000,
            guinea_pig: 100000,
        },
        services: [
            "Warm Deep Clean Bath",
            "Blow dry",
            "Ear care",
            "Nail Care",
            "Dental Care",
            "De-shedding",
            "Full Hair Cut or Styling",
            "Flea & Tick Treatment",
            "Paw Balm Treatment",
            "Finishing Touches",
        ],
        color: "from-[#c77e35] to-[#2d1a0d]",
        popular: true,
    },
};

export const PRICES: Record<string, Record<string, Record<string, number>>> = {
    dog: {
        standard: { small: 60000, medium: 70000, large: 80000 },
        super_premium: { small: 80000, medium: 90000, large: 100000 },
    },
    cat: {
        standard: { kitten: 60000, adult: 70000, senior: 80000 },
        super_premium: { kitten: 80000, adult: 90000, senior: 100000 },
    },
    small_animal: {
        super_premium: { hamster: 100000, junior_rabbit: 100000, adult_rabbit: 150000, guinea_pig: 100000 },
    },
};

export const BREED_SIZES = {
    dog: [
        { value: "small", label: "Small Breeds" },
        { value: "medium", label: "Medium Breeds" },
        { value: "large", label: "Large Breeds" },
    ],
    cat: [
        { value: "kitten", label: "Kitten - (2 - 12 Months)" },
        { value: "adult", label: "Adult Cat - (1+ Year)" },
        { value: "senior", label: "Senior Cat - (5+ Years)" },
    ],
    small_animal: [
        { value: "hamster", label: "Hamster" },
        { value: "junior_rabbit", label: "Junior Rabbit (0 - 6 months)" },
        { value: "adult_rabbit", label: "Adult Rabbit (6months +)" },
        { value: "guinea_pig", label: "Guinea Pig" },
    ],
};

export const SIZE_LABELS: Record<string, string> = {
    small: "Small",
    medium: "Medium",
    large: "Large",
    kitten: "Kitten - (2 - 12 Months)",
    adult: "Adult Cat - (1+ Year)",
    senior: "Senior Cat - (5+ Years)",
    hamster: "Hamster",
    junior_rabbit: "Junior Rabbit (0 - 6 months)",
    adult_rabbit: "Adult Rabbit (6months +)",
    guinea_pig: "Guinea Pig",
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
];
