"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, TrendingUp, Mic, ChevronRight, ShoppingBag, Loader2 } from "lucide-react";
import Image from "next/image";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCartActions } from "@/lib/store/cart-store-provider";
import { urlFor } from "@/sanity/lib/image";
import { getFeaturedProducts, getAllBrands } from "@/app/actions/search";

type SearchProduct = {
    id: string | number;
    name: string;
    price: number;
    url: string;
    imageUrl?: string;
    category?: string;
    brand?: string;
    defaultCode?: string;
};

const SEARCH_CACHE_TTL = 5 * 60 * 1000;
const searchCache = new Map<string, { expiresAt: number; products: SearchProduct[] }>();

function normalizeSearchProduct(product: any): SearchProduct {
    const rawId = product?.id ?? product?._id ?? product?.odooId ?? "";
    const slug = typeof product?.slug === "string" ? product.slug : product?.slug?.current;
    return {
        id: rawId,
        name: String(product?.name ?? "Product"),
        price: Number(product?.price ?? product?.list_price ?? 0),
        url: product?.url || (slug ? `/shop/${slug}` : `/shop/product/${rawId}`),
        imageUrl: product?.image_url || product?.images?.[0]?.asset?.url || product?.image?.asset?.url,
        category: product?.category || product?.categories?.[0]?.title || "Pet Essentials",
        brand: product?.brand || "",
        defaultCode: product?.default_code || "",
    };
}

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
    const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState(false);
    const [isLoadingInitial, setIsLoadingInitial] = useState(false);
    const [brandPage, setBrandPage] = useState(0);
    const [productPage, setProductPage] = useState(0);
    const router = useRouter();
    const { addItem } = useCartActions();
    const inputRef = useRef<HTMLInputElement>(null);

    // Fetch initial data (popular products/brands)
    useEffect(() => {
        if (isOpen) {
            setQuery("");
            setSearchResults([]);
            setSearchError(false);
            window.requestAnimationFrame(() => inputRef.current?.focus());
            const fetchData = async () => {
                setIsLoadingInitial(true);
                try {
                    const [productsData, brandsData] = await Promise.all([
                        getFeaturedProducts(),
                        getAllBrands()
                    ]);
                    setProducts(productsData.slice(0, 12));
                    setBrands(brandsData);
                } catch (error) {
                    console.error("Error fetching search modal data:", error);
                } finally {
                    setIsLoadingInitial(false);
                }
            };
            fetchData();
        }
    }, [isOpen]);

    // Live Search Effect
    useEffect(() => {
        const cleanQuery = query.trim();
        if (!isOpen || cleanQuery.length < 2) {
            setSearchResults([]);
            setIsSearching(false);
            setSearchError(false);
            return;
        }

        const cacheKey = cleanQuery.toLocaleLowerCase();
        const cached = searchCache.get(cacheKey);
        if (cached && cached.expiresAt > Date.now()) {
            setSearchResults(cached.products);
            setIsSearching(false);
            setSearchError(false);
            return;
        }

        const controller = new AbortController();
        const timer = window.setTimeout(async () => {
            setIsSearching(true);
            setSearchError(false);
            try {
                const response = await fetch(
                    `/stephans/api/search?q=${encodeURIComponent(cleanQuery)}&limit=10`,
                    { signal: controller.signal, headers: { Accept: "application/json" } },
                );
                if (!response.ok) throw new Error(`Search request failed (${response.status})`);
                const payload = await response.json();
                const normalized = (payload.products || payload.results || []).map(normalizeSearchProduct);
                searchCache.set(cacheKey, {
                    expiresAt: Date.now() + SEARCH_CACHE_TTL,
                    products: normalized,
                });
                setSearchResults(normalized);
            } catch (error) {
                if (!controller.signal.aborted) {
                    console.error("Search error:", error);
                    setSearchResults([]);
                    setSearchError(true);
                }
            } finally {
                if (!controller.signal.aborted) setIsSearching(false);
            }
        }, 180);

        return () => {
            window.clearTimeout(timer);
            controller.abort();
        };
    }, [isOpen, query]);

    const handleSearch = (searchTerm: string) => {
        if (searchTerm.trim()) {
            router.push(`/shop?q=${encodeURIComponent(searchTerm.trim())}`);
            onClose();
            setQuery("");
        }
    };

    const handleAddToCart = (e: React.MouseEvent, product: SearchProduct) => {
        e.stopPropagation();
        addItem({
            productId: String(product.id),
            name: product.name,
            price: product.price,
            image: product.imageUrl,
        });
        router.push('/cart');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent showCloseButton={false} className="!top-[8vh] !translate-y-0 sm:max-w-[760px] p-0 gap-0 overflow-hidden border border-zinc-200/80 shadow-2xl bg-white rounded-[22px]">
                <DialogTitle className="sr-only">Search Products</DialogTitle>
                <div className="flex items-center justify-between px-5 sm:px-6 pt-5 pb-2 bg-white">
                    <div className="text-lg font-semibold text-zinc-900">Search Products</div>
                    <button
                        onClick={onClose}
                        aria-label="Close search"
                        className="p-1 hover:bg-zinc-100 rounded-full transition-colors"
                    >
                        <X className="h-5 w-5 text-zinc-500" />
                    </button>
                </div>

                {/* Search Input Area */}
                <div className="px-4 py-3 sm:px-6 sm:pb-5 bg-white sticky top-0 z-10">
                    <div className="relative flex items-center">
                        <div className="relative flex-1">
                            <div className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#c77e35] flex items-center justify-center z-10">
                                <Search className="h-4 w-4 text-white" strokeWidth={3} />
                            </div>
                            <Input
                                ref={inputRef}
                                autoFocus
                                placeholder="Search for products, brands and more..."
                                value={query}
                                role="combobox"
                                aria-label="Search products and brands"
                                aria-expanded={query.trim().length >= 2}
                                aria-controls="global-search-results"
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSearch(query);
                                }}
                                className="h-14 pl-12 pr-12 text-base border-zinc-200 focus-visible:ring-zinc-200 rounded-full bg-white shadow-none placeholder:text-zinc-400"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                {isSearching ? (
                                    <Loader2 className="h-5 w-5 animate-spin text-[#c77e35]" />
                                ) : (
                                    <div className="flex items-center gap-1">
                                        {query && (
                                            <button
                                                onClick={() => setQuery("")}
                                                aria-label="Clear search"
                                                className="p-1 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                        <div className="w-8 h-8 rounded-full bg-[#FEE2E2] flex items-center justify-center">
                                            <Mic className="h-4 w-4 text-[#EF4444]" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div id="global-search-results" aria-live="polite" className="max-h-[calc(84vh-196px)] overflow-y-auto px-4 sm:px-6 py-5 space-y-8 bg-[#fcfbf9] scrollbar-hide min-h-[280px]">
                    {query.length >= 2 ? (
                        // Search Results View
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 px-1">
                                {isSearching ? "Searching..." : `Results for "${query}"`}
                            </h3>

                            {!isSearching && searchError && (
                                <div className="text-center py-12 text-zinc-500">
                                    <Search className="h-11 w-11 mx-auto mb-3 opacity-20" />
                                    <p className="font-semibold text-zinc-700">Search is temporarily unavailable.</p>
                                    <p className="mt-1 text-sm">Press Enter to search the full shop.</p>
                                </div>
                            )}

                            {!isSearching && !searchError && searchResults.length === 0 && (
                                <div className="text-center py-12 text-zinc-400">
                                    <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                    <p>No products found matching "{query}"</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {searchResults.map((product) => (
                                    <div
                                        key={product.id}
                                        onClick={() => {
                                            router.push(product.url);
                                            onClose();
                                        }}
                                        className="group flex items-center gap-3 p-3 rounded-2xl border border-zinc-100 bg-white hover:border-[#c77e35]/20 hover:shadow-md transition-all cursor-pointer relative"
                                    >
                                        <div className="relative w-16 h-16 rounded-xl bg-zinc-50 shrink-0 overflow-hidden">
                                            {product.imageUrl ? (
                                                <Image
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    fill
                                                    sizes="64px"
                                                    className="object-contain p-2 group-hover:scale-110 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-zinc-100">
                                                    <ShoppingBag className="w-6 h-6 text-zinc-300" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 pr-8">
                                            <h4 className="text-sm font-bold text-zinc-800 leading-snug line-clamp-2 group-hover:text-[#c77e35] transition-colors">
                                                {product.name}
                                            </h4>
                                            <p className="text-xs text-zinc-500 mt-0.5">
                                                {[product.brand, product.category].filter(Boolean).join(" · ") || "Pet Essentials"}
                                            </p>
                                            <p className="text-sm font-bold text-[#c77e35] mt-1">
                                                TSh {product.price.toLocaleString()}
                                            </p>
                                        </div>
                                        <button
                                            onClick={(e) => handleAddToCart(e, product)}
                                            className="absolute right-3 bottom-3 w-8 h-8 rounded-full bg-[#c77e35] text-white flex items-center justify-center hover:bg-[#5a3419] hover:scale-105 transition-all shadow-sm opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300"
                                        >
                                            <ShoppingBag className="h-4 w-4" strokeWidth={2} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* View All Matches Link */}
                            {searchResults.length > 0 && (
                                <button
                                    onClick={() => handleSearch(query)}
                                    className="w-full py-3 text-center text-sm font-medium text-[#c77e35] hover:bg-[#c77e35]/5 rounded-xl transition-colors mt-2"
                                >
                                    View all matching products
                                </button>
                            )}
                        </div>
                    ) : (
                        // Default View (Popular)
                        <>
                            {/* Popular Searches */}
                            <div>
                                <div className="flex items-center gap-2 mb-3 text-[#c77e35]">
                                    <TrendingUp className="h-3 w-3" />
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Popular Searches</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {POPULAR_SEARCHES.map((search) => (
                                        <button
                                            key={search}
                                            onClick={() => handleSearch(search)}
                                            className="px-4 py-2 rounded-full border border-zinc-200 bg-white text-xs font-medium text-zinc-600 hover:border-[#c77e35] hover:text-[#c77e35] hover:bg-[#c77e35]/5 hover:shadow-sm transition-all"
                                        >
                                            {search}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Popular Brands */}
                            {brands.length > 0 && (
                                <div>
                                    <div className="flex items-center justify-between mb-3 text-zinc-400">
                                        <h3 className="text-[10px] font-bold uppercase tracking-widest">Popular Brands</h3>
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => setBrandPage((p) => Math.max(p - 1, 0))}
                                                    disabled={brandPage === 0}
                                                    className={cn(
                                                        "w-6 h-6 rounded-full border border-zinc-200 flex items-center justify-center transition-all bg-white hover:bg-zinc-50",
                                                        brandPage === 0 ? "text-zinc-300 cursor-not-allowed border-zinc-100" : "text-[#c77e35] hover:border-[#c77e35]"
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
                                                        "w-6 h-6 rounded-full border border-zinc-200 flex items-center justify-center transition-all bg-white hover:bg-zinc-50",
                                                        brandPage >= Math.max(1, Math.ceil(brands.length / 6)) - 1 ? "text-zinc-300 cursor-not-allowed border-zinc-100" : "text-[#c77e35] hover:border-[#c77e35]"
                                                    )}
                                                >
                                                    <ChevronRight className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                                        {brands.slice(brandPage * 6, brandPage * 6 + 6).map((brand) => (
                                            <button
                                                key={brand._id}
                                                onClick={() => handleSearch(brand.name)}
                                                className="group flex flex-col items-center gap-2 p-2 rounded-2xl hover:bg-white transition-all hover:shadow-sm border border-transparent hover:border-zinc-100"
                                            >
                                                <div className="w-14 h-14 rounded-xl bg-white border border-zinc-100 flex items-center justify-center group-hover:border-[#c77e35]/30 group-hover:bg-[#c77e35]/5 transition-all overflow-hidden shadow-sm">
                                                    {brand.logo ? (
                                                        <Image src={brand.logo} alt={brand.name} width={40} height={40} className="object-contain p-1" />
                                                    ) : (
                                                        <span className="font-bold text-xs text-zinc-300 group-hover:text-[#c77e35]">
                                                            {brand.name.charAt(0)}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[10px] font-bold text-zinc-500 truncate w-full text-center group-hover:text-[#c77e35] transition-colors">
                                                    {brand.name}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

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
                                                    "w-6 h-6 rounded-full border border-zinc-200 flex items-center justify-center transition-all bg-white hover:bg-zinc-50",
                                                    productPage === 0 ? "text-zinc-300 cursor-not-allowed border-zinc-100" : "text-[#c77e35] hover:border-[#c77e35]"
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
                                                    "w-6 h-6 rounded-full border border-zinc-200 flex items-center justify-center transition-all bg-white hover:bg-zinc-50",
                                                    productPage >= Math.max(1, Math.ceil(products.length / 3)) - 1 ? "text-zinc-300 cursor-not-allowed border-zinc-100" : "text-[#c77e35] hover:border-[#c77e35]"
                                                )}
                                            >
                                                <ChevronRight className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {isLoadingInitial ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="h-24 bg-zinc-100 rounded-2xl animate-pulse" />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {products.slice(productPage * 3, productPage * 3 + 3).map((product) => (
                                            <div
                                                key={product._id}
                                                onClick={() => {
                                                    router.push(`/shop/${product.slug}`);
                                                    onClose();
                                                }}
                                                className="group flex items-center gap-3 p-3 rounded-2xl border border-zinc-100 bg-white hover:border-[#c77e35]/20 hover:shadow-md transition-all cursor-pointer relative"
                                            >
                                                <div className="relative w-14 h-14 rounded-xl bg-zinc-50 shrink-0 overflow-hidden">
                                                    {product.images?.[0]?.asset?.url ? (
                                                        <Image
                                                            src={product.images[0].asset.url}
                                                            alt={product.name}
                                                            fill
                                                            sizes="56px"
                                                            className="object-contain p-1 group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                    ) : product.image?.asset?.url ? (
                                                        <Image
                                                            src={product.image.asset.url}
                                                            alt={product.name}
                                                            fill
                                                            sizes="56px"
                                                            className="object-contain p-1 group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-zinc-100">
                                                            <ShoppingBag className="w-4 h-4 text-zinc-300" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0 pr-6">
                                                    <h4 className="text-xs font-bold text-zinc-800 leading-snug line-clamp-2 group-hover:text-[#c77e35] transition-colors">
                                                        {product.name}
                                                    </h4>
                                                    <p className="text-[10px] text-zinc-500 mt-0.5">
                                                        {product.categories?.[0]?.title || "Pet Essentials"}
                                                    </p>
                                                    <p className="text-xs font-bold text-[#c77e35] mt-0.5">
                                                        TSh {product.price?.toLocaleString()}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={(e) => handleAddToCart(e, product)}
                                                    aria-label={`Add ${product.name} to cart`}
                                                    className="absolute right-2 bottom-2 w-6 h-6 rounded-full bg-[#c77e35] text-white flex items-center justify-center hover:bg-[#5a3419] hover:scale-110 transition-all shadow-sm opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300"
                                                >
                                                    <ShoppingBag className="h-3 w-3" strokeWidth={2} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
                <div className="flex min-h-12 items-center justify-between gap-3 border-t border-zinc-200 bg-white px-4 text-xs text-zinc-500 sm:px-6">
                    <div className="flex items-center gap-2">
                        <kbd className="rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 font-sans text-[11px] text-zinc-500">Esc</kbd>
                        <span>to close</span>
                        <span className="hidden sm:inline text-zinc-300">·</span>
                        <span className="hidden sm:flex items-center gap-2">
                            <kbd className="rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 font-sans text-[11px] text-zinc-500">Enter</kbd>
                            to view all
                        </span>
                    </div>
                    {query.trim().length >= 2 && !isSearching && (
                        <button onClick={() => handleSearch(query)} className="font-medium text-[#6b3a1e] hover:text-[#c77e35]">
                            {searchResults.length > 0 ? `See all ${searchResults.length}+ results` : "Search full shop"}
                        </button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
