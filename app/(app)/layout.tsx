import { CartStoreProvider } from "@/lib/store/cart-store-provider";
import { WishlistStoreProvider } from "@/lib/store/wishlist-store-provider";
import { ChatStoreProvider } from "@/lib/store/chat-store-provider";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { SanityLive } from "@/sanity/lib/live";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/app/Header";
import { Footer } from "@/components/app/Footer";
import { CartSheet } from "@/components/app/CartSheet";
import { ChatSheet } from "@/components/app/ChatSheet";
import { AppShell } from "@/components/app/AppShell";

import { MobileFooterNav } from "@/components/app/MobileFooterNav";

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartStoreProvider>
        <WishlistStoreProvider>
          <ChatStoreProvider>
            <AppShell>
              <Header />
              <main>{children}</main>
              <Footer />
              <MobileFooterNav />
            </AppShell>
            <CartSheet />
            <ChatSheet />
            <Toaster position="bottom-center" />
            {process.env.SANITY_API_READ_TOKEN && <SanityLive />}
          </ChatStoreProvider>
        </WishlistStoreProvider>
      </CartStoreProvider>
    </SessionProvider>
  );
}

export default AppLayout;

