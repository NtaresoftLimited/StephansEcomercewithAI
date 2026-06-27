import { CartStoreProvider } from "@/lib/store/cart-store-provider";
import { WishlistStoreProvider } from "@/lib/store/wishlist-store-provider";
import { ChatStoreProvider } from "@/lib/store/chat-store-provider";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/app/Header";
import { GroomingStatusNotification } from "@/components/app/grooming/GroomingStatusNotification";
import { Footer } from "@/components/app/Footer";
import { CartSheet } from "@/components/app/CartSheet";
import { ChatSheet } from "@/components/app/ChatSheet";
import { AppShell } from "@/components/app/AppShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { localBusinessJsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/structured-data";

import { MobileFooterNav } from "@/components/app/MobileFooterNav";

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartStoreProvider>
        <WishlistStoreProvider>
          <ChatStoreProvider>
            <AppShell>
              <JsonLd data={[organizationJsonLd(), localBusinessJsonLd(), websiteJsonLd()].flat()} />
              <Header />
              <main>{children}</main>
              <Footer />
              <MobileFooterNav />
            </AppShell>
            <CartSheet />
            <ChatSheet />
            <GroomingStatusNotification />
            <Toaster position="bottom-center" />
          </ChatStoreProvider>
        </WishlistStoreProvider>
      </CartStoreProvider>
    </SessionProvider>
  );
}

export default AppLayout;

