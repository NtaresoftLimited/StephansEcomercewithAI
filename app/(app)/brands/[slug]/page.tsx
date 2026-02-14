import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { odoo } from "@/lib/odoo/client";
import { AutoRotatingProductGrid } from "@/components/app/AutoRotatingProductGrid";

interface BrandPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function BrandPage(props: BrandPageProps) {
    const params = await props.params;
    const { slug } = params;

    // Fetch brand details
    const brand = await odoo.getBrandBySlug(slug);

    if (!brand) {
        notFound();
    }

    // Fetch products for this brand
    const products = await odoo.getProductsByBrand(brand.id);

    // Transform Odoo products to match the interface expected by AutoRotatingProductGrid
    // (Assuming AutoRotatingProductGrid expects Sanity-like structure, we might need to adapt or create a new grid)
    // Let's check AutoRotatingProductGrid props first.
    // We'll map Odoo products to a compatible structure.

    const formattedProducts = products.map(p => ({
        _id: `odoo-${p.id}`,
        name: p.name,
        slug: `product-${p.id}`, // Placeholder slug for Odoo products
        price: p.list_price,
        imageUrl: p.image_1920
            ? `data:image/png;base64,${p.image_1920}`
            : "/placeholder.png",
        description: p.description_sale,
        hasRibbon: false // Optional
    }));


    return (
        <div className="min-h-screen bg-background pt-20">
            {/* Brand Hero */}
            <div className="bg-white border-b">
                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
                    <div className="mb-8 flex justify-center">
                        {brand.logo ? (
                            <div className="relative w-48 h-48">
                                <img
                                    src={`data:image/png;base64,${brand.logo}`}
                                    alt={brand.name}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        ) : (
                            <h1 className="text-4xl font-bold text-gray-900">{brand.name}</h1>
                        )}
                    </div>

                    {brand.description && (
                        <p className="max-w-2xl mx-auto text-lg text-gray-500">
                            {brand.description}
                        </p>
                    )}
                </div>
            </div>

            {/* Brand Products */}
            <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-16">
                <h2 className="text-2xl font-semibold mb-8">Products by {brand.name}</h2>

                {formattedProducts.length > 0 ? (
                    <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                        {formattedProducts.map((product) => (
                            <div key={product._id} className="group relative">
                                <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-200 group-hover:opacity-75 lg:h-80">
                                    <img
                                        src={product.imageUrl}
                                        alt={product.name}
                                        className="h-full w-full object-cover object-center lg:h-full lg:w-full"
                                    />
                                </div>
                                <div className="mt-4 flex justify-between">
                                    <div>
                                        <h3 className="text-sm text-gray-700">
                                            <span aria-hidden="true" className="absolute inset-0" />
                                            {product.name}
                                        </h3>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {/* Format currency if needed */}
                                        TZS {product.price.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500">No products found for this brand.</p>
                )}
            </div>
        </div>
    );
}
