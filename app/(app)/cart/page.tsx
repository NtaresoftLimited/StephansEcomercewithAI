import { CartPageClient } from "./CartPageClient";

export const metadata = {
  title: "Your Cart | Stephan's Pet Store",
  description: "Review your selected items before checkout.",
};

export default function CartPage() {
  return <CartPageClient />;
}
