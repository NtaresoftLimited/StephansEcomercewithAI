import { Metadata } from "next";
import { BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Blog",
    description: "Read the latest pet care tips, news, and stories from Stephan's Pet Store.",
};

export default function BlogPage() {
    // Placeholder blog posts
    const blogPosts = [
        {
            id: 1,
            title: "10 Essential Tips for First-Time Dog Owners",
            excerpt: "Getting your first dog is an exciting journey! Here are our top 10 tips to help you and your new furry friend start off on the right paw.",
            date: "February 10, 2026",
            category: "Dog Care",
            image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=400&fit=crop",
        },
        {
            id: 2,
            title: "Understanding Your Cat's Body Language",
            excerpt: "Learn how to read your cat's signals and communicate better with your feline companion through their subtle body language cues.",
            date: "February 8, 2026",
            category: "Cat Care",
            image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&h=400&fit=crop",
        },
        {
            id: 3,
            title: "The Benefits of Regular Pet Grooming",
            excerpt: "Discover why regular grooming is about more than just keeping your pet looking good – it's essential for their health and happiness.",
            date: "February 5, 2026",
            category: "Grooming",
            image: "https://images.unsplash.com/photo-1560807707-8cc77767d783?w=600&h=400&fit=crop",
        },
        {
            id: 4,
            title: "Choosing the Right Food for Your Pet",
            excerpt: "Not all pet food is created equal. Learn how to select the best nutrition for your pet's age, breed, and health needs.",
            date: "February 1, 2026",
            category: "Nutrition",
            image: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600&h=400&fit=crop",
        },
        {
            id: 5,
            title: "Creating a Bird-Friendly Home Environment",
            excerpt: "Tips and tricks for setting up the perfect living space for your feathered friends, from cage placement to enrichment activities.",
            date: "January 28, 2026",
            category: "Bird Care",
            image: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=600&h=400&fit=crop",
        },
        {
            id: 6,
            title: "Aquarium Maintenance 101",
            excerpt: "Keep your aquatic pets healthy and happy with our comprehensive guide to maintaining a clean and balanced aquarium.",
            date: "January 25, 2026",
            category: "Fish Care",
            image: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=600&h=400&fit=crop",
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center p-3 bg-[#6b3e1e]/10 rounded-full mb-4">
                        <BookOpen className="h-8 w-8 text-[#6b3e1e]" />
                    </div>
                    <h1 className="text-4xl font-bold text-zinc-900 mb-4">
                        Pet Care Blog
                    </h1>
                    <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
                        Expert advice, tips, and stories to help you provide the best care for your beloved pets.
                    </p>
                </div>

                {/* Blog Posts Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {blogPosts.map((post) => (
                        <article
                            key={post.id}
                            className="bg-white rounded-xl overflow-hidden shadow-sm border border-zinc-100 hover:shadow-md transition-shadow group"
                        >
                            <div className="aspect-video relative overflow-hidden">
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="inline-block px-3 py-1 bg-[#6b3e1e] text-white text-xs font-semibold rounded-full">
                                        {post.category}
                                    </span>
                                </div>
                            </div>
                            <div className="p-6">
                                <p className="text-xs text-zinc-500 mb-2">{post.date}</p>
                                <h2 className="text-xl font-bold text-zinc-900 mb-3 group-hover:text-[#6b3e1e] transition-colors">
                                    {post.title}
                                </h2>
                                <p className="text-zinc-600 text-sm mb-4 line-clamp-3">
                                    {post.excerpt}
                                </p>
                                <Link
                                    href={`/blog/${post.id}`}
                                    className="inline-flex items-center gap-2 text-[#6b3e1e] hover:text-[#5a3419] font-medium text-sm transition-colors"
                                >
                                    Read More
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>

                {/* Coming Soon Message */}
                <div className="mt-16 text-center bg-[#6b3e1e]/5 rounded-2xl p-12 border border-[#6b3e1e]/20">
                    <h2 className="text-2xl font-bold text-zinc-900 mb-4">
                        More Articles Coming Soon!
                    </h2>
                    <p className="text-zinc-600 max-w-2xl mx-auto">
                        We're constantly adding new content to help you care for your pets. Subscribe to our newsletter to get notified when we publish new articles.
                    </p>
                    <button className="mt-6 px-6 py-3 bg-[#6b3e1e] text-white rounded-lg hover:bg-[#5a3419] transition-colors font-medium">
                        Subscribe to Newsletter
                    </button>
                </div>
            </div>
        </div>
    );
}
