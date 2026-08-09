import { Metadata } from "next";
import Image from "next/image";
import { Heart, ShoppingBag, Scissors } from "lucide-react";

export const metadata: Metadata = {
    title: "About Us | Stephan's Pet Store Dar es Salaam",
    description: "Learn about Stephan's Pet Store - Tanzania's premier destination for pet lovers since our founding. We provide premium pet food, grooming, and accessories in Dar es Salaam.",
    alternates: {
        canonical: "/about",
    },
    openGraph: {
        title: "About Stephan's Pet Store | Tanzania's Premier Pet Shop",
        description: "Discover our story, values, and commitment to providing the best pet care, food, and grooming services in Dar es Salaam.",
        url: "https://www.stephanspetstore.co.tz/about",
        siteName: "Stephan's Pet Store",
        images: [
            {
                url: "/og-image.jpg",
                width: 1200,
                height: 630,
                alt: "About Stephan's Pet Store",
            },
        ],
        locale: "en_TZ",
        type: "website",
    },
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#fbf8f5]">
            {/* Hero Section */}
            <section className="mx-auto max-w-4xl px-4 pt-24 pb-20 sm:px-6 lg:px-8 text-center">
                <h3 className="text-[11px] font-bold tracking-[0.2em] text-[#A66C44] uppercase mb-6">
                    ABOUT STEPHAN'S
                </h3>
                <h1 className="text-5xl md:text-7xl font-serif text-[#222222] leading-tight mb-8">
                    Happy pet,
                    <br />
                    Happy home.
                </h1>
                
                <div className="flex justify-center mb-8">
                    <div className="w-12 h-[1px] bg-[#A66C44]"></div>
                </div>
                
                <p className="text-lg md:text-xl text-[#222222] max-w-2xl mx-auto font-medium">
                    At Stephan&apos;s, we believe pets deserve good products, 
                    <br className="hidden md:block" />
                    thoughtful care, and people who genuinely understand them.
                </p>
            </section>

            {/* Meet Stephan Section */}
            <section className="bg-white">
                <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
                        <div className="order-2 md:order-1 relative aspect-[4/5] md:aspect-square w-full">
                            <Image
                                src="/about/stephan.png"
                                alt="Stephan the pug"
                                fill
                                className="object-cover rounded-2xl"
                                sizes="(max-width: 768px) 100vw, 50vw"
                                priority
                            />
                        </div>
                        <div className="order-1 md:order-2 flex flex-col items-start justify-center">
                            <h3 className="text-sm font-medium text-[#A66C44] mb-3">
                                Where it all began.
                            </h3>
                            <h2 className="text-4xl md:text-5xl font-serif text-[#222222] mb-6">
                                Meet Stephan.
                            </h2>
                            
                            <div className="w-12 h-[1px] bg-[#A66C44] mb-8"></div>
                            
                            <div className="text-[#222222] space-y-4 text-lg">
                                <p>Before the store, there was Stephan.</p>
                                <p>Our much-loved pet, whose place in our family inspired the name Stephan. In many ways, he became part of where our story began.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* What Matters Section */}
            <section className="mx-auto max-w-5xl px-4 py-24 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl md:text-4xl font-serif text-[#222222] mb-6">
                    What matters to us.
                </h2>
                
                <div className="flex justify-center mb-16">
                    <div className="w-12 h-[1px] bg-[#A66C44]"></div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-12 md:gap-8 divide-y md:divide-y-0 md:divide-x divide-[#e5e0db]">
                    {/* Value 1 */}
                    <div className="flex flex-col items-center pt-8 md:pt-0">
                        <div className="mb-6 text-[#A66C44]">
                            <ShoppingBag strokeWidth={1} className="w-12 h-12" />
                        </div>
                        <h3 className="text-lg font-bold text-[#222222] mb-3">
                            Good products.
                        </h3>
                        <p className="text-[#555555] text-sm leading-relaxed max-w-[250px]">
                            Carefully selected items we&apos;d trust for our own pets.
                        </p>
                    </div>

                    {/* Value 2 */}
                    <div className="flex flex-col items-center pt-12 md:pt-0">
                        <div className="mb-6 text-[#A66C44] flex items-center justify-center h-12 w-12">
                            <Image 
                                src="/about/grooming-scissors.png" 
                                alt="Gentle Care" 
                                width={48} 
                                height={48} 
                                className="w-12 h-12 object-contain scale-[2]" 
                            />
                        </div>
                        <h3 className="text-lg font-bold text-[#222222] mb-3">
                            Gentle care.
                        </h3>
                        <p className="text-[#555555] text-sm leading-relaxed max-w-[250px]">
                            Patience, kindness and a stress-free experience.
                        </p>
                    </div>

                    {/* Value 3 */}
                    <div className="flex flex-col items-center pt-12 md:pt-0">
                        <div className="mb-6 text-[#A66C44]">
                            <Heart strokeWidth={1} className="w-12 h-12" />
                        </div>
                        <h3 className="text-lg font-bold text-[#222222] mb-3">
                            Helpful people.
                        </h3>
                        <p className="text-[#555555] text-sm leading-relaxed max-w-[250px]">
                            Friendly advice and support whenever you need it.
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer Hook */}
            <section className="bg-[#f2efe9] border-t border-[#e5e0db]">
                <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 text-center flex flex-col items-center">
                    <Heart strokeWidth={1.5} className="w-8 h-8 text-[#A66C44] mb-4" />
                    <h2 className="text-3xl md:text-4xl font-serif text-[#222222]">
                        From our pets to yours.
                    </h2>
                </div>
            </section>
        </div>
    );
}
