import { notFound } from "next/navigation";
import Image from "next/image";
import { client } from "@/sanity/lib/client";
import { BRAND_BY_SLUG_QUERY } from "@/lib/sanity/queries/brands";
import { odoo } from "@/lib/odoo/client";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Eye } from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

interface BrandPageProps {
    params: Promise<{ slug: string }>;
}

export default async function BrandPage(props: BrandPageProps) {
    const { slug } = await props.params;

    // Fetch brand from Sanity (has logo, banner, description)
    const brand = await client.fetch(BRAND_BY_SLUG_QUERY, { slug });
    if (!brand) notFound();

    // Fetch products from Odoo using the brand's Odoo ID
    // Fall back to empty array if Odoo is unavailable
    let odooProducts: any[] = [];
    try {
        // Find brand in Odoo by name
        const odooBrands = await odoo.searchRead(
            "product.brand",
            [["name", "ilike", brand.name]],
            ["id", "name"],
            1
        );

        if (odooBrands.length > 0) {
            odooProducts = await odoo.searchRead(
                "product.template",
                [["brand_id", "=", odooBrands[0].id], ["active", "=", true]],
                // Fetching image_512 instead of 128 to ensure crisp resolution for instagram-sized squares
                ["id", "name", "list_price", "default_code", "image_512", "qty_available"],
                200
            );
        }
    } catch (e) {
        console.error("Odoo product fetch failed, showing empty state:", e);
    }

    return (
        <div className="min-h-screen bg-background pt-20">
            {/* Hero Banner Section */}
            <div className="relative bg-stone-50 border-b border-zinc-100">
                {brand.banner ? (
                    // Using a fixed height + object-contain to zoom out and fit the banner completely
                    <div className="relative w-full h-[220px] md:h-[280px] bg-[#F8F9FA] p-4 md:p-8">
                        <Image
                            src={brand.banner}
                            alt={`${brand.name} Banner`}
                            fill
                            className="object-contain object-center opacity-90"
                            priority
                            sizes="100vw"
                        />
                        {/* Subtle fade overlay at bottom for text contrast */}
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                    </div>
                ) : (
                    <div className="relative h-[260px] bg-gradient-to-br from-amber-50 to-orange-100">
                        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle, #d4a27440 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
                    </div>
                )}

                {/* Brand identity overlay — align left */}
                <div className="absolute inset-0 flex flex-col justify-end pb-6 px-6 md:px-12 md:pb-8">
                    <div className="flex items-end gap-6 max-w-4xl">
                        {brand.logo && (
                            <div className="relative w-24 h-24 md:w-32 md:h-32 bg-white rounded-2xl shadow-xl flex-shrink-0 border border-zinc-100 flex items-center justify-center -mb-2 z-10">
                                <Image
                                    src={brand.logo}
                                    alt={`${brand.name} logo`}
                                    fill
                                    className="object-contain p-3"
                                    sizes="128px"
                                />
                            </div>
                        )}

                        <div className="pb-1">
                            {!brand.logo && (
                                <h1 className={`text-4xl md:text-5xl font-bold mb-2 ${brand.banner ? "text-white drop-shadow-md" : "text-zinc-800"}`}>
                                    {brand.name}
                                </h1>
                            )}

                            {brand.description && (
                                <p className={`max-w-xl text-sm md:text-base font-medium leading-relaxed ${brand.banner ? "text-white drop-shadow" : "text-zinc-600"}`}>
                                    {brand.description}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Feature strip */}
            <div className="bg-white border-b border-zinc-100 py-8">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-3 gap-6 text-center">
                        {[
                            { icon: Heart, label: "Loved by Pets" },
                            { icon: ShoppingCart, label: "Quality Assured" },
                            { icon: Eye, label: "Trusted Brand" },
                        ].map(({ icon: Icon, label }) => (
                            <div key={label} className="flex flex-col items-center gap-2">
                                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                                    <Icon className="w-5 h-5 text-amber-700" />
                                </div>
                                <p className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Products Grid — from Odoo */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
                    <h2 className="text-xl md:text-2xl font-bold text-zinc-900 whitespace-nowrap">
                        Shop {brand.name} Products
                    </h2>
                    <div className="hidden md:block flex-1 h-px bg-zinc-200" />
                </div>

                {odooProducts.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {odooProducts.map((product) => (
                            <Link
                                key={product.id}
                                href={`/products/${product.id}`}
                                className="group flex flex-col bg-white border border-zinc-100 hover:border-zinc-300 hover:shadow-md transition-all duration-200 rounded-xl overflow-hidden"
                            >
                                {/* Image - 4:5 Aspect Ratio (1080x1350 Instagram Portrait) */}
                                <div className="aspect-[4/5] w-full bg-zinc-50 relative overflow-hidden">
                                    {product.image_512 ? (
                                        <img
                                            src={`data:image/png;base64,${product.image_512}`}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                            <ShoppingCart className="w-8 h-8" />
                                        </div>
                                    )}
                                </div>
                                {/* Info */}
                                <div className="p-4 flex flex-col flex-1 pb-5">
                                    <h3 className="text-sm font-medium text-zinc-800 line-clamp-2 group-hover:text-amber-700 transition-colors flex-1 mb-2">
                                        {product.name}
                                    </h3>
                                    <p className="text-base font-bold text-zinc-900">
                                        {formatPrice(product.list_price)}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-zinc-50 rounded-2xl border border-zinc-100">
                        <p className="text-lg text-zinc-400 mb-4">No products found for {brand.name}.</p>
                        <Button variant="outline" asChild>
                            <a href="/products">Browse all products</a>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}