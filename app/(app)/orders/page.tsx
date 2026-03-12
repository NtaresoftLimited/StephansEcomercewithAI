import Link from "next/link";
import { auth } from "@/auth";
import { Package, ArrowRight, FileText, Activity, ShieldCheck, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { sanityFetch } from "@/sanity/lib/live";
import { ORDERS_BY_USER_QUERY } from "@/lib/sanity/queries/orders";
import { getOrderStatus } from "@/lib/constants/orderStatus";
import { formatPrice, formatDate, formatOrderNumber } from "@/lib/utils";
import { StackedProductImages } from "@/components/app/StackedProductImages";

export const metadata = {
  title: "Order Dossier | Stephan's Pet Store",
  description: "View your order history and tracking intelligence",
};

export default async function OrdersPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const { data: orders } = await sanityFetch({
    query: ORDERS_BY_USER_QUERY,
    params: { userId: userId ?? "" },
  });

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          icon={Package}
          title="No Active Dossiers"
          description="Initiate an acquisition to generate a tracking file."
          action={{ label: "Initialize Order", href: "/" }}
          size="lg"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-950/50 min-h-screen">
      <div className="mb-12 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">
            System Access Granted // Level 1
          </p>
        </div>
        <h1 className="text-4xl font-mono font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter">
          Technical Passports
        </h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400 font-mono text-sm max-w-lg">
          [SECURE] Tracking and modification history for authorized acquisitions.
        </p>
      </div>

      <div className="space-y-6">
        {orders.map((order: { _id: string; orderNumber?: string | null; total?: number | null; status?: string | null; createdAt?: string | null; itemCount?: number | null; itemNames?: (string | null)[] | null; itemImages?: (string | null)[] | null }) => {
          const status = getOrderStatus(order.status);
          const StatusIcon = status.icon;
          const images = (order.itemImages ?? []).filter(
            (url): url is string => url !== null,
          );

          return (
            <Link
              key={order._id}
              href={`/orders/${order._id}`}
              className="group relative block overflow-hidden rounded-lg border border-dashed border-zinc-300 bg-white transition-all hover:border-solid hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-900/5 dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:border-amber-500/30"
            >
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-100 transition-opacity">
                <FileText className="w-24 h-24 text-zinc-900 dark:text-white rotate-12" />
              </div>

              {/* Header Bar */}
              <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/50 px-6 py-3 dark:border-zinc-800 dark:bg-zinc-900/50">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-zinc-400" />
                    <span className="font-mono text-xs text-zinc-500 uppercase tracking-wider">
                      ID: {formatOrderNumber(order.orderNumber)}
                    </span>
                  </div>
                  <span className="hidden sm:inline-block h-4 w-px bg-zinc-200 dark:bg-zinc-700" />
                  <span className="hidden sm:inline-block font-mono text-xs text-zinc-400 uppercase">
                    {formatDate(order.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${status.color.replace('bg-', 'bg-').split(' ')[0]}`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${status.color.replace('bg-', 'bg-').split(' ')[0]}`}></span>
                  </span>
                  <span className={`font-mono text-xs font-bold uppercase ${status.label === 'Completed' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {status.label}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-8 p-6 relative z-10">
                {/* Left: Product Images Grid (Dossier Evidence) */}
                <div className="shrink-0 relative">
                  <div className="absolute -inset-2 border border-zinc-200 dark:border-zinc-800 rotate-3 rounded-lg z-0 transition-transform group-hover:rotate-6" />
                  <div className="relative z-10 bg-white dark:bg-zinc-900 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <StackedProductImages
                      images={images}
                      totalCount={order.itemCount ?? 0}
                      size="lg"
                    />
                  </div>
                </div>

                {/* Right: Data Grid */}
                <div className="flex flex-1 flex-col justify-between">
                  {/* Status Visualizer */}
                  <div className="mb-6">
                    <div className="flex justify-between items-end mb-2">
                      <span className="font-mono text-xs text-zinc-400 uppercase">Status Protocol</span>
                      <span className="font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-1000 ease-out group-hover:w-full ${status.label === 'Delivered' ? 'w-full bg-emerald-500' : 'w-2/3 bg-amber-500 animate-pulse'}`} />
                    </div>
                  </div>

                  {/* Items List */}
                  <div>
                    <span className="font-mono text-[10px] text-zinc-400 uppercase block mb-2">Manifest Content</span>
                    <div className="flex flex-wrap gap-2">
                      {order.itemNames?.slice(0, 3).map((name, i) => (
                        <span key={i} className="inline-flex items-center px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 max-w-[200px] truncate">
                          {name}
                        </span>
                      ))}
                      {(order.itemCount ?? 0) > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-500">
                          +{(order.itemCount ?? 0) - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Arrow */}
                <div className="self-center hidden sm:block">
                  <div className="h-10 w-10 rounded-full border border-zinc-200 dark:border-zinc-700 flex items-center justify-center group-hover:border-amber-500 group-hover:text-amber-500 transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
