import { Metadata } from "next";
import { Heart, Award, Users, MapPin } from "lucide-react";

export const metadata: Metadata = {
    title: "About Us",
    description: "Learn about Stephan's Pet Store - Tanzania's premier destination for pet lovers since our founding.",
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
            <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-zinc-900 mb-4">
                        About Stephan's Pet Store
                    </h1>
                    <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
                        Tanzania's premier destination for pet lovers, dedicated to providing the best care and products for your furry, feathered, and aquatic friends.
                    </p>
                </div>

                {/* Story Section */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-zinc-900 mb-6">Our Story</h2>
                    <div className="prose prose-zinc max-w-none">
                        <p className="text-zinc-700 leading-relaxed mb-4">
                            Founded with a passion for pets and their well-being, Stephan's Pet Store has grown to become one of Tanzania's most trusted names in pet care. Our journey began with a simple mission: to provide pet owners with access to premium quality products and professional services that their beloved companions deserve.
                        </p>
                        <p className="text-zinc-700 leading-relaxed">
                            Today, we proudly serve the Dar es Salaam community and beyond, offering everything from premium pet food and accessories to professional grooming services. Our commitment to excellence has earned us the trust of thousands of pet parents across Tanzania.
                        </p>
                    </div>
                </div>

                {/* Values Grid */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-zinc-900 mb-8 text-center">Our Values</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-zinc-100">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-[#6b3e1e]/10 rounded-lg">
                                    <Heart className="h-6 w-6 text-[#6b3e1e]" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-zinc-900 mb-2">Pet-First Approach</h3>
                                    <p className="text-zinc-600 text-sm">
                                        Every decision we make is guided by what's best for your pets. Their health, happiness, and well-being are our top priorities.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border border-zinc-100">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-[#6b3e1e]/10 rounded-lg">
                                    <Award className="h-6 w-6 text-[#6b3e1e]" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-zinc-900 mb-2">Quality Assurance</h3>
                                    <p className="text-zinc-600 text-sm">
                                        We carefully curate our product selection, partnering only with trusted brands that meet our high standards for quality and safety.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border border-zinc-100">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-[#6b3e1e]/10 rounded-lg">
                                    <Users className="h-6 w-6 text-[#6b3e1e]" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-zinc-900 mb-2">Expert Guidance</h3>
                                    <p className="text-zinc-600 text-sm">
                                        Our knowledgeable team is always ready to provide expert advice and personalized recommendations for your pet's unique needs.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border border-zinc-100">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-[#6b3e1e]/10 rounded-lg">
                                    <MapPin className="h-6 w-6 text-[#6b3e1e]" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-zinc-900 mb-2">Community Connection</h3>
                                    <p className="text-zinc-600 text-sm">
                                        We're proud to be part of the Dar es Salaam community, supporting local pet owners and contributing to animal welfare initiatives.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Services Section */}
                <div className="bg-[#6b3e1e]/5 rounded-2xl p-8 mb-16">
                    <h2 className="text-2xl font-bold text-zinc-900 mb-6">What We Offer</h2>
                    <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                            <div className="h-6 w-6 rounded-full bg-[#6b3e1e] flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-white text-xs">✓</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-zinc-900 mb-1">Premium Pet Food & Nutrition</h3>
                                <p className="text-zinc-600 text-sm">Wide selection of high-quality food for dogs, cats, birds, and fish</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="h-6 w-6 rounded-full bg-[#6b3e1e] flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-white text-xs">✓</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-zinc-900 mb-1">Professional Grooming Services</h3>
                                <p className="text-zinc-600 text-sm">Expert grooming by trained professionals who love what they do</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="h-6 w-6 rounded-full bg-[#6b3e1e] flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-white text-xs">✓</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-zinc-900 mb-1">Pet Accessories & Toys</h3>
                                <p className="text-zinc-600 text-sm">Everything your pet needs for play, comfort, and safety</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="h-6 w-6 rounded-full bg-[#6b3e1e] flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-white text-xs">✓</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-zinc-900 mb-1">Health & Wellness Products</h3>
                                <p className="text-zinc-600 text-sm">Supplements, vitamins, and healthcare items to keep pets healthy</p>
                            </div>
                        </li>
                    </ul>
                </div>

                {/* Location */}
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-zinc-900 mb-4">Visit Us</h2>
                    <p className="text-zinc-600 mb-2">11 Slipway Road</p>
                    <p className="text-zinc-600 mb-6">Dar es Salaam, Tanzania</p>
                    <a
                        href="https://www.google.com/maps/dir//11+Slipway+Rd,+Dar+es+Salaam,+Tanzania/@-0.6820625,37.350665,13z/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#6b3e1e] text-white rounded-lg hover:bg-[#5a3419] transition-colors font-medium"
                    >
                        <MapPin className="h-5 w-5" />
                        Get Directions
                    </a>
                </div>
            </div>
        </div>
    );
}
