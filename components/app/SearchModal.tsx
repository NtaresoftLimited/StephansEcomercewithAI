"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, TrendingUp, Mic, ChevronRight, ShoppingBag } from "lucide-react";
import Image from "next/image";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { client } from "@/sanity/lib/client";
import { FEATURED_PRODUCTS_QUERY } from "@/lib/sanity/queries/products";
import { ALL_BRANDS_QUERY } from "@/lib/sanity/queries/brands";
import { useCartActions } from "@/lib/store/cart-store-provider";
import { urlFor } from "@/sanity/lib/image";

const POPULAR_SEARCHES = [
    "Dry Food",
    "Puppy Treats",
    "Flea & Tick",
    "Nexgard",
    "Cat Litter",
    "Royal Canin",
    "Dog Toys",
];

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const [query, setQuery] = useState("");
    const [products, setProducts] = useState<any[]>([]);
    const [brands, setBrands] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [brandPage, setBrandPage] = useState(0);
    const [productPage, setProductPage] = useState(0);
    const router = useRouter();
    const { addItem, openCart } = useCartActions();

    useEffect(() => {
        if (isOpen) {
            const fetchData = async () => {
                setIsLoading(true);
                try {
                    const [productsData, brandsData] = await Promise.all([
                        client.fetch(FEATURED_PRODUCTS_QUERY),
                        client.fetch(ALL_BRANDS_QUERY)
                    ]);
                    setProducts(productsData.slice(0, 12));
                    setBrands(brandsData);
                    setProductPage(0);
                    setBrandPage(0);
                } catch (error) {
                    console.error("Error fetching search modal data:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchData();
        }
    }, [isOpen]);

    const handleSearch = (searchTerm: string) => {
        if (searchTerm.trim()) {
            router.push(`/products?q=${encodeURIComponent(searchTerm.trim())}`);
            onClose();
            setQuery("");
        }
    };

    const handleAddToCart = (e: React.MouseEvent, product: any) => {
        e.stopPropagation();
        addItem({
            productId: product._id,
            name: product.name,
            price: product.price,
            image: product.images?.[0]?.asset?.url,
        });
        openCart();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] p-0 gap-0 overflow-hidden border-none shadow-2xl">
                <DialogTitle className="sr-only">Search Products</DialogTitle>

                {/* Search Input Area */}
                <div className="p-4 border-b border-zinc-100 bg-white">
                    <div className="relative flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b3e1e]" />
                            <Input
                                autoFocus
                                placeholder="Search for products, brands and more..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSearch(query);
                                }}
                                className="h-11 pl-10 pr-10 text-xs border-zinc-200 focus-visible:ring-[#6b3e1e] rounded-full bg-zinc-50/50"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                {query && (
                                    <button
                                        onClick={() => setQuery("")}
                                        className="p-1 hover:bg-zinc-200 rounded-full transition-colors text-zinc-400"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                )}
                                <Mic className="h-4 w-4 text-[#6b3e1e]" />
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="rounded-full hover:bg-zinc-100 h-8 w-8"
                        >
                            <X className="h-4 w-4 text-zinc-400" />
                        </Button>
                    </div>
                </div>

                <div className="max-h-[80vh] overflow-y-auto p-4 space-y-8 bg-white scrollbar-hide">
                    {/* Popular Searches */}
                    <div>
                        <div className="flex items-center gap-2 mb-3 text-[#6b3e1e]">
                            <TrendingUp className="h-3 w-3" />
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Popular Searches</h3>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {POPULAR_SEARCHES.map((search) => (
                                <button
                                    key={search}
                                    onClick={() => handleSearch(search)}
                                    className="px-3 py-1.5 rounded-full border border-zinc-100 text-[11px] font-medium text-zinc-600 hover:border-[#6b3e1e] hover:text-[#6b3e1e] hover:bg-[#6b3e1e]/10 transition-all"
                                >
                                    {search}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Popular Brands */}
                    <div>
                        <div className="flex items-center justify-between mb-3 text-zinc-400">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest">Popular Brands</h3>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        router.push("/products");
                                        onClose();
                                    }}
                                    className="text-[10px] font-semibold text-[#6b3e1e] hover:underline"
                                >
                                    View All
                                </button>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => setBrandPage((p) => Math.max(p - 1, 0))}
                                        disabled={brandPage === 0}
                                        className={cn(
                                            "w-5 h-5 rounded-full border border-zinc-200 flex items-center justify-center transition-all",
                                            brandPage === 0 ? "text-zinc-300 cursor-not-allowed" : "text-[#6b3e1e] hover:border-[#6b3e1e]"
                                        )}
                                    >
                                        <ChevronRight className="h-3 w-3 rotate-180" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            const pages = Math.max(1, Math.ceil(brands.length / 6));
                                            setBrandPage((p) => Math.min(p + 1, pages - 1));
                                        }}
                                        disabled={brandPage >= Math.max(1, Math.ceil(brands.length / 6)) - 1}
                                        className={cn(
                                            "w-5 h-5 rounded-full border border-zinc-200 flex items-center justify-center transition-all",
                                            brandPage >= Math.max(1, Math.ceil(brands.length / 6)) - 1 ? "text-zinc-300 cursor-not-allowed" : "text-[#6b3e1e] hover:border-[#6b3e1e]"
                                        )}
                                    >
                                        <ChevronRight className="h-3 w-3" />
                                    </button>
                                </div>
                                <span className="text-[10px] font-medium">
                                    {brandPage + 1}/{Math.max(1, Math.ceil(brands.length / 6))}
                                </span>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                            {brands.slice(brandPage * 6, brandPage * 6 + 6).map((brand) => (
                                <button
                                    key={brand._id}
                                    onClick={() => handleSearch(brand.name)}
                                    className="group flex flex-col items-center gap-1.5 p-1 rounded-xl transition-all"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center group-hover:border-[#6b3e1e]/30 group-hover:bg-[#6b3e1e]/5 transition-all overflow-hidden">
                                        {brand.logo ? (
                                            <Image src={brand.logo} alt={brand.name} width={36} height={36} className="object-contain p-1" />
                                        ) : (
                                            <span className="font-bold text-[10px] text-zinc-300 group-hover:text-[#6b3e1e]">
                                                {brand.name.charAt(0)}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[9px] font-semibold text-zinc-600 truncate w-full group-hover:text-[#6b3e1e] transition-colors">
                                        {brand.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Popular Products */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Popular Products</h3>
                            <div className="flex items-center gap-2">
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => setProductPage((p) => Math.max(p - 1, 0))}
                                        disabled={productPage === 0}
                                        className={cn(
                                            "w-5 h-5 rounded-full border border-zinc-200 flex items-center justify-center transition-all",
                                            productPage === 0 ? "text-zinc-300 cursor-not-allowed" : "text-[#6b3e1e] hover:border-[#6b3e1e]"
                                        )}
                                    >
                                        <ChevronRight className="h-3 w-3 rotate-180" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            const pages = Math.max(1, Math.ceil(products.length / 3));
                                            setProductPage((p) => Math.min(p + 1, pages - 1));
                                        }}
                                        disabled={productPage >= Math.max(1, Math.ceil(products.length / 3)) - 1}
                                        className={cn(
                                            "w-5 h-5 rounded-full border border-zinc-200 flex items-center justify-center transition-all",
                                            productPage >= Math.max(1, Math.ceil(products.length / 3)) - 1 ? "text-zinc-300 cursor-not-allowed" : "text-[#6b3e1e] hover:border-[#6b3e1e]"
                                        )}
                                    >
                                        <ChevronRight className="h-3 w-3" />
                                    </button>
                                </div>
                                <span className="text-[10px] font-medium text-zinc-400">
                                    {productPage + 1}/{Math.max(1, Math.ceil(products.length / 3))}
                                </span>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="h-20 bg-zinc-50 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                {products.slice(productPage * 3, productPage * 3 + 3).map((product) => (
                                    <div
                                        key={product._id}
                                        onClick={() => {
                                            router.push(`/products/${product.slug}`);
                                            onClose();
                                        }}
                                        className="group flex items-center gap-2 p-2 rounded-xl border border-zinc-100 bg-white hover:border-[#6b3e1e]/20 hover:shadow-sm transition-all cursor-pointer relative"
                                    >
                                        <div className="relative w-12 h-12 rounded bg-zinc-50 shrink-0">
                                            {product.images?.[0]?.asset?.url ? (
                                                <Image
                                                    src={product.images[0].asset.url}
                                                    alt={product.name}
                                                    fill
                                                    sizes="48px"
                                                    className="object-contain p-1 group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : product.images?.[0] ? (
                                                <Image
                                                    src={urlFor(product.images[0]).url()}
                                                    alt={product.name}
                                                    fill
                                                    sizes="48px"
                                                    className="object-contain p-1 group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-zinc-100">
                                                    <ShoppingBag className="w-4 h-4 text-zinc-300" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 pr-6">
                                            <h4 className="text-[10px] font-bold text-zinc-800 leading-tight line-clamp-2 mb-0.5 group-hover:text-[#6b3e1e] transition-colors">
                                                {product.name}
                                            </h4>
                                            <p className="text-[9px] text-zinc-400 mb-0.5">
                                                {product.category?.title || "Pet Essentials"}
                                            </p>
                                            <p className="text-[10px] font-bold text-[#6b3e1e]">
                                                TSh {product.price.toLocaleString()}
                                            </p>
                                        </div>
                                        <button
                                            onClick={(e) => handleAddToCart(e, product)}
                                            className="absolute right-1 bottom-1 w-7 h-7 rounded-full bg-[#6b3e1e] text-white flex items-center justify-center hover:bg-[#5a3419] transition-all shadow-sm"
                                        >
                                            <ShoppingBag className="h-3 w-3" strokeWidth={3} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
