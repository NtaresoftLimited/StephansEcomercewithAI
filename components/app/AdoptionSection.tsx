"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdoptionSectionProps {
    dogImages: string[];
    catImages: string[];
    birdImages: string[];
    fishImages: string[];
}

export function AdoptionSection({
    dogImages = [],
    catImages = [],
    birdImages = [],
    fishImages = []
}: AdoptionSectionProps) {
    const [hoveredPet, setHoveredPet] = useState<string | null>(null);
    const router = useRouter();
    const [dogIdx, setDogIdx] = useState(0);
    const [catIdx, setCatIdx] = useState(0);
    const [birdIdx, setBirdIdx] = useState(0);
    const [fishIdx, setFishIdx] = useState(0);

    // Image rotation effects
    useEffect(() => {
        if (!dogImages.length) return;
        const t = window.setInterval(() => {
            setDogIdx((i) => (i + 1) % dogImages.length);
        }, 8000);
        return () => window.clearInterval(t);
    }, [dogImages.length]);

    useEffect(() => {
        if (!catImages.length) return;
        const t = window.setInterval(() => {
            setCatIdx((i) => (i + 1) % catImages.length);
        }, 8000);
        return () => window.clearInterval(t);
    }, [catImages.length]);

    useEffect(() => {
        if (!birdImages.length) return;
        const t = window.setInterval(() => {
            setBirdIdx((i) => (i + 1) % birdImages.length);
        }, 8000);
        return () => window.clearInterval(t);
    }, [birdImages.length]);

    useEffect(() => {
        if (!fishImages.length) return;
        const t = window.setInterval(() => {
            setFishIdx((i) => (i + 1) % fishImages.length);
        }, 8000);
        return () => window.clearInterval(t);
    }, [fishImages.length]);

    const handlePetClick = (category: string) => {
        router.push(`/?category=${category}`);
    };

    // Placeholder images
    const defaultDog = "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop";
    const defaultCat = "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop";
    const defaultBird = "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400&h=400&fit=crop";
    const defaultFish = "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=400&h=400&fit=crop";

    const dogImage = dogImages[dogIdx] || defaultDog;
    const catImage = catImages[catIdx] || defaultCat;
    const birdImage = birdImages[birdIdx] || defaultBird;
    const fishImage = fishImages[fishIdx] || defaultFish;

    return (
        <section className="relative w-full bg-background overflow-hidden pt-4 pb-8">
            {/* Decorative sparkles */}
            <div className="absolute top-8 left-4 md:left-12 text-primary/30 opacity-50">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                </svg>
            </div>
            <div className="absolute top-20 right-8 md:right-16 text-primary/20 opacity-40">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                </svg>
            </div>
            <div className="absolute bottom-32 left-8 md:left-20 text-primary/25 opacity-30">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                </svg>
            </div>
            <div className="absolute bottom-24 right-6 md:right-16 text-primary/30 opacity-50">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                </svg>
            </div>

            {/* Main Container - Centered */}
            <div className="relative w-full max-w-[650px] mx-auto px-4">
                {/* PAW Container with fixed aspect ratio */}
                <div className="relative w-full" style={{ paddingBottom: '80%' }}>

                    {/* Paw Pad Background - Centered heart shape */}
                    <div className="absolute left-1/2 bottom-0 w-[72%] h-[52%] -translate-x-1/2">
                        <svg viewBox="0 0 717 478" className="w-full h-full drop-shadow-lg" preserveAspectRatio="xMidYMax meet">
                            <path
                                d="M717,373.9c0,65.17-50.06,104.1-133.95,104.1c-90.4,0-150.78-46.83-224.55-46.83
                c-73.14,0-133.36,46.83-224.55,46.83C50.06,478,0,439.07,0,373.9C0,229.21,210.23,0,358.5,0S717,229.22,717,373.9"
                                className="fill-secondary"
                            />
                        </svg>
                    </div>

                    {/* Top Left Paw Toe - CAT */}
                    <div
                        className="absolute cursor-pointer transition-all duration-300 hover:scale-110 z-20"
                        style={{
                            left: '20%',
                            top: '10%',
                            width: '20%',
                            paddingBottom: '26%',
                            transform: 'rotate(-12deg)',
                        }}
                        onMouseEnter={() => setHoveredPet('cat')}
                        onMouseLeave={() => setHoveredPet(null)}
                        onClick={() => handlePetClick('cats')}
                    >
                        <div className={`absolute inset-0 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] 
                           ${hoveredPet === 'cat' ? 'bg-accent' : 'bg-muted'} 
                           transition-colors duration-300 shadow-lg border-4 border-secondary`} />
                        <div className="absolute inset-[8px] rounded-[50%_50%_50%_50%/60%_60%_40%_40%] overflow-hidden border-[3px] border-card">
                            <img src={catImage} className="w-full h-full object-cover" alt="Cat" />
                        </div>
                    </div>

                    {/* Top Right Paw Toe - BIRD */}
                    <div
                        className="absolute cursor-pointer transition-all duration-300 hover:scale-110 z-20"
                        style={{
                            right: '20%',
                            top: '10%',
                            width: '20%',
                            paddingBottom: '26%',
                            transform: 'rotate(12deg)',
                        }}
                        onMouseEnter={() => setHoveredPet('bird')}
                        onMouseLeave={() => setHoveredPet(null)}
                        onClick={() => handlePetClick('birds')}
                    >
                        <div className={`absolute inset-0 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] 
                           ${hoveredPet === 'bird' ? 'bg-accent' : 'bg-muted'} 
                           transition-colors duration-300 shadow-lg border-4 border-secondary`} />
                        <div className="absolute inset-[8px] rounded-[50%_50%_50%_50%/60%_60%_40%_40%] overflow-hidden border-[3px] border-card">
                            <img src={birdImage} className="w-full h-full object-cover" alt="Bird" />
                        </div>
                    </div>

                    {/* Bottom Left Paw Toe - DOG */}
                    <div
                        className="absolute cursor-pointer transition-all duration-300 hover:scale-110 z-20"
                        style={{
                            left: '5%',
                            top: '32%',
                            width: '18%',
                            paddingBottom: '22%',
                            transform: 'rotate(-20deg)',
                        }}
                        onMouseEnter={() => setHoveredPet('dog')}
                        onMouseLeave={() => setHoveredPet(null)}
                        onClick={() => handlePetClick('dogs')}
                    >
                        <div className={`absolute inset-0 rounded-[50%] 
                           ${hoveredPet === 'dog' ? 'bg-accent' : 'bg-muted'} 
                           transition-colors duration-300 shadow-lg border-4 border-secondary`} />
                        <div className="absolute inset-[8px] rounded-[50%] overflow-hidden border-[3px] border-card">
                            <img src={dogImage} className="w-full h-full object-cover" alt="Dog" />
                        </div>
                    </div>

                    {/* Bottom Right Paw Toe - FISH */}
                    <div
                        className="absolute cursor-pointer transition-all duration-300 hover:scale-110 z-20"
                        style={{
                            right: '5%',
                            top: '32%',
                            width: '18%',
                            paddingBottom: '22%',
                            transform: 'rotate(20deg)',
                        }}
                        onMouseEnter={() => setHoveredPet('fish')}
                        onMouseLeave={() => setHoveredPet(null)}
                        onClick={() => handlePetClick('fish')}
                    >
                        <div className={`absolute inset-0 rounded-[45%_55%_55%_45%/50%] 
                           ${hoveredPet === 'fish' ? 'bg-accent' : 'bg-primary'} 
                           transition-colors duration-300 shadow-lg border-4 border-secondary`} />
                        <div className="absolute inset-[8px] rounded-[45%_55%_55%_45%/50%] overflow-hidden border-[3px] border-card">
                            <img src={fishImage} className="w-full h-full object-cover" alt="Fish" />
                        </div>
                    </div>

                    {/* Center Content - Spoil Your Pet */}
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-[12%] w-[55%] max-w-[240px] text-center z-30">

                        {/* Title */}
                        <h2 className="text-base sm:text-lg md:text-xl font-bold text-primary mb-2 font-serif italic">
                            Spoil Your Pet
                        </h2>

                        {/* Directions */}
                        <div className="mb-2">
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-primary mx-auto mb-0.5" />
                            <h3 className="text-[10px] sm:text-xs font-semibold text-foreground">Directions</h3>
                            <p className="text-[8px] sm:text-[10px] text-muted-foreground">Find us when we open!</p>
                        </div>

                        {/* Buttons */}
                        <div className="space-y-1.5">
                            <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-7 sm:h-8 text-[10px] sm:text-xs font-medium rounded-full shadow-md">
                                <a href="https://www.google.com/maps/dir//11+Slipway+Rd,+Dar+es+Salaam,+Tanzania/@-0.6820625,37.350665,13z/" target="_blank" rel="noopener noreferrer">
                                    Get Directions
                                </a>
                            </Button>
                            <Button variant="outline" className="w-full h-7 sm:h-8 text-[10px] sm:text-xs font-medium rounded-full shadow-md">
                                <MessageCircle className="mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                Spoil Your Pet On WhatsApp
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
