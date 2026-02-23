"use client";

import { useState, useEffect } from "react";
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
import { client } from "@/sanity/lib/client";
import { FEATURED_PRODUCTS_QUERY } from "@/lib/sanity/queries/products";
import { ALL_BRANDS_QUERY } from "@/lib/sanity/queries/brands";
import { useCartActions } from "@/lib/store/cart-store-provider";
import { urlFor } from "@/sanity/lib/image";
import { searchProducts } from "@/app/actions/search";

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
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isLoadingInitial, setIsLoadingInitial] = useState(false);
    const [brandPage, setBrandPage] = useState(0);
    const [productPage, setProductPage] = useState(0);
    const router = useRouter();
    const { addItem, openCart } = useCartActions();

    // Fetch initial data (popular products/brands)
    useEffect(() => {
        if (isOpen) {
            const fetchData = async () => {
                setIsLoadingInitial(true);
                try {
                    const [productsData, brandsData] = await Promise.all([
                        client.fetch(FEATURED_PRODUCTS_QUERY),
                        client.fetch(ALL_BRANDS_QUERY)
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
        const timer = setTimeout(async () => {
            if (query.trim().length >= 2) {
                setIsSearching(true);
                try {
                    const results = await searchProducts(query);
                    setSearchResults(results);
                } catch (error) {
                    console.error("Search error:", error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [query]);

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
            <DialogContent className="sm:max-w-[700px] p-0 gap-0 overflow-hidden border-none shadow-2xl bg-white">
                <DialogTitle className="sr-only">Search Products</DialogTitle>

                {/* Search Input Area */}
                <div className="p-4 border-b border-zinc-100 bg-white sticky top-0 z-10">
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
                                className="h-12 pl-10 pr-10 text-sm border-zinc-200 focus-visible:ring-[#6b3e1e] rounded-full bg-zinc-50/50 shadow-sm"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                {isSearching ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-[#6b3e1e]" />
                                ) : query && (
                                    <button
                                        onClick={() => setQuery("")}
                                        className="p-1 hover:bg-zinc-200 rounded-full transition-colors text-zinc-400"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                )}
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="rounded-full hover:bg-zinc-100 h-10 w-10"
                        >
                            <X className="h-5 w-5 text-zinc-400" />
                        </Button>
                    </div>
                </div>

                <div className="max-h-[70vh] overflow-y-auto p-4 space-y-8 bg-zinc-50/30 scrollbar-hide min-h-[300px]">
                    {query.length >= 2 ? (
                        // Search Results View
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 px-1">
                                {isSearching ? "Searching..." : `Results for "${query}"`}
                            </h3>

                            {!isSearching && searchResults.length === 0 && (
                                <div className="text-center py-12 text-zinc-400">
                                    <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                    <p>No products found matching "{query}"</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {searchResults.map((product) => (
                                    <div
                                        key={product._id}
                                        onClick={() => {
                                            router.push(`/products/${product.slug}`);
                                            onClose();
                                        }}
                                        className="group flex items-center gap-3 p-3 rounded-2xl border border-zinc-100 bg-white hover:border-[#6b3e1e]/20 hover:shadow-md transition-all cursor-pointer relative"
                                    >
                                        <div className="relative w-16 h-16 rounded-xl bg-zinc-50 shrink-0 overflow-hidden">
                                            {product.images?.[0]?.asset?.url ? (
                                                <Image
                                                    src={product.images[0].asset.url}
                                                    alt={product.name}
                                                    fill
                                                    sizes="64px"
                                                    className="object-contain p-2 group-hover:scale-110 transition-transform duration-500"
                                                />
                                            ) : product.image?.asset?.url ? (
                                                <Image
                                                    src={product.image.asset.url}
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
                                            <h4 className="text-sm font-bold text-zinc-800 leading-snug line-clamp-2 group-hover:text-[#6b3e1e] transition-colors">
                                                {product.name}
                                            </h4>
                                            <p className="text-xs text-zinc-500 mt-0.5">
                                                {product.category?.title || "Pet Essentials"}
                                            </p>
                                            <p className="text-sm font-bold text-[#6b3e1e] mt-1">
                                                TSh {product.price?.toLocaleString()}
                                            </p>
                                        </div>
                                        <button
                                            onClick={(e) => handleAddToCart(e, product)}
                                            className="absolute right-3 bottom-3 w-8 h-8 rounded-full bg-[#6b3e1e] text-white flex items-center justify-center hover:bg-[#5a3419] hover:scale-105 transition-all shadow-sm opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300"
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
                                    className="w-full py-3 text-center text-sm font-medium text-[#6b3e1e] hover:bg-[#6b3e1e]/5 rounded-xl transition-colors mt-2"
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
                                <div className="flex items-center gap-2 mb-3 text-[#6b3e1e]">
                                    <TrendingUp className="h-3 w-3" />
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Popular Searches</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {POPULAR_SEARCHES.map((search) => (
                                        <button
                                            key={search}
                                            onClick={() => handleSearch(search)}
                                            className="px-4 py-2 rounded-full border border-zinc-200 bg-white text-xs font-medium text-zinc-600 hover:border-[#6b3e1e] hover:text-[#6b3e1e] hover:bg-[#6b3e1e]/5 hover:shadow-sm transition-all"
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
                                                        brandPage === 0 ? "text-zinc-300 cursor-not-allowed border-zinc-100" : "text-[#6b3e1e] hover:border-[#6b3e1e]"
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
                                                        brandPage >= Math.max(1, Math.ceil(brands.length / 6)) - 1 ? "text-zinc-300 cursor-not-allowed border-zinc-100" : "text-[#6b3e1e] hover:border-[#6b3e1e]"
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
                                                <div className="w-14 h-14 rounded-xl bg-white border border-zinc-100 flex items-center justify-center group-hover:border-[#6b3e1e]/30 group-hover:bg-[#6b3e1e]/5 transition-all overflow-hidden shadow-sm">
                                                    {brand.logo ? (
                                                        <Image src={brand.logo} alt={brand.name} width={40} height={40} className="object-contain p-1" />
                                                    ) : (
                                                        <span className="font-bold text-xs text-zinc-300 group-hover:text-[#6b3e1e]">
                                                            {brand.name.charAt(0)}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[10px] font-bold text-zinc-500 truncate w-full text-center group-hover:text-[#6b3e1e] transition-colors">
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
                                                    productPage === 0 ? "text-zinc-300 cursor-not-allowed border-zinc-100" : "text-[#6b3e1e] hover:border-[#6b3e1e]"
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
                                                    productPage >= Math.max(1, Math.ceil(products.length / 3)) - 1 ? "text-zinc-300 cursor-not-allowed border-zinc-100" : "text-[#6b3e1e] hover:border-[#6b3e1e]"
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
                                                    router.push(`/products/${product.slug}`);
                                                    onClose();
                                                }}
                                                className="group flex items-center gap-3 p-3 rounded-2xl border border-zinc-100 bg-white hover:border-[#6b3e1e]/20 hover:shadow-md transition-all cursor-pointer relative"
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
                                                    <h4 className="text-xs font-bold text-zinc-800 leading-snug line-clamp-2 group-hover:text-[#6b3e1e] transition-colors">
                                                        {product.name}
                                                    </h4>
                                                    <p className="text-[10px] text-zinc-500 mt-0.5">
                                                        {product.category?.title || "Pet Essentials"}
                                                    </p>
                                                    <p className="text-xs font-bold text-[#6b3e1e] mt-0.5">
                                                        TSh {product.price?.toLocaleString()}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={(e) => handleAddToCart(e, product)}
                                                    className="absolute right-2 bottom-2 w-6 h-6 rounded-full bg-[#6b3e1e] text-white flex items-center justify-center hover:bg-[#5a3419] hover:scale-110 transition-all shadow-sm opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300"
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
            </DialogContent>
        </Dialog>
    );
}
