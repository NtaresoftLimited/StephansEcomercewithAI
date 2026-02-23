import { CartStoreProvider } from "@/lib/store/cart-store-provider";
import { WishlistStoreProvider } from "@/lib/store/wishlist-store-provider";
import { ChatStoreProvider } from "@/lib/store/chat-store-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { SanityLive } from "@/sanity/lib/live";
import { Toaster } from "@/components/ui/sonner";
import Link from "next/link";
import Image from "next/image";

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
    const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

    const LayoutContent = (
        <div className="min-h-screen bg-zinc-50 flex flex-col">
            {/* Minimal Header */}
            <header className="h-20 bg-white border-b border-zinc-200 flex items-center justify-center sticky top-0 z-50">
                <Link href="/" className="hover:opacity-80 transition-opacity">
                    <Image
                        src="/logo.png"
                        alt="Stephan's Pet Store"
                        width={160}
                        height={45}
                        className="h-8 w-auto"
                        priority
                    />
                </Link>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                {children}
            </main>

            {/* Minimal Footer */}
            <footer className="py-6 border-t border-zinc-200 bg-white text-center text-sm text-zinc-400">
                <p>&copy; {new Date().getFullYear()} Stephan's Pet Store. All rights reserved.</p>
                <div className="mt-2 flex justify-center gap-4 text-xs font-medium uppercase tracking-wider">
                    <span>Secure Checkout</span>
                    <span>Privacy Policy</span>
                    <span>Terms</span>
                </div>
            </footer>

            <Toaster position="bottom-center" />
            {process.env.SANITY_API_READ_TOKEN && <SanityLive />}
        </div>
    );

    return (
        hasClerk ? (
            <ClerkProvider>
                <CartStoreProvider>
                    <WishlistStoreProvider>
                        <ChatStoreProvider>
                            {LayoutContent}
                        </ChatStoreProvider>
                    </WishlistStoreProvider>
                </CartStoreProvider>
            </ClerkProvider>
        ) : (
            <CartStoreProvider>
                <WishlistStoreProvider>
                    <ChatStoreProvider>
                        {LayoutContent}
                    </ChatStoreProvider>
                </WishlistStoreProvider>
            </CartStoreProvider>
        )
    );
}
