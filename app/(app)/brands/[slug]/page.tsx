import { notFound } from "next/navigation";
import Image from "next/image";
import { client } from "@/sanity/lib/client";
import { BRAND_BY_SLUG_QUERY } from "@/lib/sanity/queries/brands";
import { odoo } from "@/lib/odoo/client";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/app/ProductCard";
import Link from "next/link";

interface BrandPageProps {
    params: Promise<{ slug: string }>;
}

export default async function BrandPage(props: BrandPageProps) {
    const { slug } = await props.params;

    // 1. Fetch brand from Sanity
    let brand: any = null;
    try {
        brand = await client.fetch(BRAND_BY_SLUG_QUERY, { slug });
    } catch (e) {
        console.error("Sanity fetch failed:", e);
    }

    // 2. Fallback for specific brands if not found in Sanity
    if (!brand) {
        const slugLower = slug.toLowerCase();
        if (slugLower === 'bioline') {
            brand = {
                name: "Bioline",
                description: "Natural and eco-friendly pet care products.",
                logo: "/brands/Bioline.webp", // Local file
                banner: null
            };
        } else if (slugLower === 'whiskas') {
            brand = {
                name: "Whiskas",
                description: "Delicious nutrition for cats.",
                logo: null,
                banner: null
            };
        } else if (slugLower === 'beeno') {
            brand = {
                name: "Beeno",
                description: "Tasty treats for dogs.",
                logo: null,
                banner: null
            };
        }
    }

    if (!brand) notFound();

    // 3. Fetch products from Odoo
    let odooProducts: any[] = [];
    try {
        let odooBrandId: number | null = null;

        if (brand.odooId) {
            odooBrandId = brand.odooId;
        } else {
            // Find brand in Odoo by name
            const odooBrands = await odoo.searchRead(
                "product.brand",
                [["name", "ilike", brand.name]],
                ["id", "name", "logo"],
                1
            );
            if (odooBrands.length > 0) {
                odooBrandId = odooBrands[0].id;
                // Attach Odoo logo if Sanity/Mock logo is missing
                if (!brand.logo) {
                    (brand as any).__odooLogo = odooBrands[0]?.logo || null;
                }
            }
        }

        if (odooBrandId) {
            odooProducts = await odoo.searchRead(
                "product.template",
                [["brand_id", "=", odooBrandId], ["active", "=", true]],
                ["id", "name", "list_price", "default_code", "image_512", "qty_available"],
                200
            );
        }

        // 3.5 Fallback: Search by name if no products found by brand ID
        if (odooProducts.length === 0) {
            console.log(`No products found for brand ID ${odooBrandId}, falling back to name search for: ${brand.name}`);
            odooProducts = await odoo.searchRead(
                "product.template",
                [
                    ["name", "ilike", brand.name],
                    ["active", "=", true],
                    ["sale_ok", "=", true]
                ],
                ["id", "name", "list_price", "default_code", "image_512", "qty_available"],
                200
            );
        }
    } catch (e) {
        console.error("Odoo fetch failed:", e);
    }

    // 4. Mock products if Odoo fails or returns empty for fallback brands
    if (odooProducts.length === 0 && (slug.toLowerCase() === 'bioline' || slug.toLowerCase() === 'whiskas' || slug.toLowerCase() === 'beeno')) {
        odooProducts = [
            { id: 101, name: `${brand.name} Premium Care`, list_price: 25000, image_512: null, qty_available: 10 },
            { id: 102, name: `${brand.name} Essential Kit`, list_price: 45000, image_512: null, qty_available: 5 },
            { id: 103, name: `${brand.name} Gentle Wash`, list_price: 15000, image_512: null, qty_available: 20 },
            { id: 104, name: `${brand.name} Daily Use`, list_price: 12000, image_512: null, qty_available: 0 },
        ];
    }

    // 5. Map Odoo products to ProductCard interface
    const mappedProducts = odooProducts.map(p => ({
        _id: `odoo-${p.id}`,
        name: p.name,
        slug: `${p.id}`, // Using ID as slug for now since Odoo products might not have SEO slugs
        price: p.list_price,
        stock: p.qty_available,
        images: p.image_512 ? [{
            _key: 'main',
            asset: { url: `data:image/png;base64,${p.image_512}` }
        }] : [],
        category: null
    }));

    return (
        <div className="min-h-screen bg-background pt-20">
            {/* Hero Banner Section */}
            <div className="relative bg-stone-50 border-b border-zinc-100">
                {brand.banner ? (
                    <div className="relative w-full h-[220px] md:h-[280px] bg-[#F8F9FA] p-4 md:p-8">
                        <Image
                            src={brand.banner}
                            alt={`${brand.name} Banner`}
                            fill
                            className="object-contain object-center opacity-90"
                            priority
                            sizes="100vw"
                        />
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                    </div>
                ) : (
                    <div className="relative h-[260px] bg-gradient-to-br from-amber-50 to-orange-100">
                        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle, #d4a27440 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
                    </div>
                )}

                {/* Brand identity overlay */}
                <div className="absolute inset-0 flex flex-col justify-end pb-6 md:pb-8">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex items-end gap-6">
                            {/* Logo Rendering */}
                            {((brand as any).__odooLogo || brand.logo) && (
                                <div className="relative w-24 h-24 md:w-32 md:h-32 bg-white rounded-2xl shadow-xl flex-shrink-0 border border-zinc-100 flex items-center justify-center -mb-2 z-10 overflow-hidden">
                                    {(() => {
                                        const odooLogo = (brand as any).__odooLogo as string | null;
                                        let logoSrc = brand.logo;

                                        // If using Odoo logo (base64)
                                        if (odooLogo && !logoSrc) {
                                            logoSrc = `data:image/png;base64,${odooLogo}`;
                                        }

                                        // If local file or URL, use directly
                                        return (
                                            <Image
                                                src={logoSrc}
                                                alt={`${brand.name} logo`}
                                                fill
                                                className="object-contain p-3"
                                                sizes="(max-width: 768px) 96px, 128px"
                                                priority
                                            />
                                        );
                                    })()}
                                </div>
                            )}

                            <div className="pb-1">
                                {!brand.logo && !(brand as any).__odooLogo && (
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
            </div>

            {/* Products Grid */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
                    <h2 className="text-xl md:text-2xl font-bold text-zinc-900 whitespace-nowrap">
                        Shop {brand.name} Products
                    </h2>
                    <div className="hidden md:block flex-1 h-px bg-zinc-200" />
                </div>

                {mappedProducts.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {mappedProducts.map((product) => (
                            <ProductCard key={product._id} product={product} />
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