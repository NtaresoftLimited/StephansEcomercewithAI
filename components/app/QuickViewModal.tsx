"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Heart, ShoppingCart, Minus, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { useCartActions } from "@/lib/store/cart-store-provider";
import { useWishlistActions, useIsInWishlist } from "@/lib/store/wishlist-store-provider";
import { toast } from "sonner";

interface QuickViewProduct {
    _id: string;
    name: string | null;
    slug: string | null;
    description: string | null;
    price: number | null;
    stock?: number | null;
    images: Array<{
        asset: {
            url: string | null;
        } | null;
    }> | null;
    category: {
        title: string | null;
    } | null;
}

interface QuickViewModalProps {
    product: QuickViewProduct | null;
    isOpen: boolean;
    onClose: () => void;
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
    const [quantity, setQuantity] = useState(1);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const { addItem } = useCartActions();
    const { toggleItem } = useWishlistActions();
    const isInWishlist = useIsInWishlist(product?._id ?? "");

    if (!product) return null;

    const images = product.images ?? [];
    const mainImage = images[currentImageIndex]?.asset?.url ?? images[0]?.asset?.url;
    const stock = product.stock ?? 100;
    const isOutOfStock = stock <= 0;

    const handleAddToCart = () => {
        if (isOutOfStock) return;

        addItem({
            productId: product._id,
            name: product.name ?? "Product",
            price: product.price ?? 0,
            image: images[0]?.asset?.url ?? undefined,
        }, quantity);

        toast.success(`Added ${quantity} × ${product.name} to cart!`);
        onClose();
    };

    const handleToggleWishlist = () => {
        const added = toggleItem({
            productId: product._id,
            name: product.name ?? "Product",
            price: product.price ?? 0,
            image: images[0]?.asset?.url ?? undefined,
            slug: product.slug ?? "",
        });

        if (added) {
            toast.success("Added to wishlist!");
        } else {
            toast.info("Removed from wishlist");
        }
    };

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden">
                <DialogTitle className="sr-only">Quick View: {product.name}</DialogTitle>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-zinc-600 shadow-md transition-colors hover:bg-white hover:text-zinc-900"
                    aria-label="Close"
                >
                    <X className="h-4 w-4" />
                </button>

                <div className="grid md:grid-cols-2">
                    {/* Image Gallery */}
                    <div className="relative aspect-[4/5] bg-zinc-100">
                        {mainImage ? (
                            <Image
                                src={mainImage}
                                alt={product.name ?? "Product"}
                                fill
                                unoptimized
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center text-zinc-400">
                                No image available
                            </div>
                        )}

                        {/* Image Navigation */}
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={prevImage}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-zinc-600 shadow-md transition-colors hover:bg-white"
                                    aria-label="Previous image"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-zinc-600 shadow-md transition-colors hover:bg-white"
                                    aria-label="Next image"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </>
                        )}

                        {/* Thumbnail Strip */}
                        {images.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                {images.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`h-2 w-2 rounded-full transition-all ${currentImageIndex === index
                                            ? "bg-white w-6"
                                            : "bg-white/50 hover:bg-white/80"
                                            }`}
                                        aria-label={`View image ${index + 1}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-col p-6 md:p-8">
                        {/* Category */}
                        {product.category && (
                            <Badge variant="secondary" className="w-fit mb-3 bg-[#6b3e1e]/10 text-[#6b3e1e]">
                                {product.category.title}
                            </Badge>
                        )}

                        {/* Title */}
                        <h2 className="text-2xl font-bold text-zinc-900">
                            {product.name}
                        </h2>

                        {/* Price */}
                        <p className="mt-3 text-3xl font-bold text-[#6b3e1e]">
                            {formatPrice(product.price)}
                        </p>

                        {/* Description */}
                        {product.description && (
                            <p className="mt-4 text-sm text-zinc-600 line-clamp-4">
                                {product.description}
                            </p>
                        )}

                        {/* Stock Status */}
                        <div className="mt-4">
                            {isOutOfStock ? (
                                <span className="text-sm font-medium text-red-600">Out of Stock</span>
                            ) : stock < 10 ? (
                                <span className="text-sm font-medium text-amber-600">Only {stock} left!</span>
                            ) : (
                                <span className="text-sm font-medium text-green-600">In Stock</span>
                            )}
                        </div>

                        {/* Quantity Selector */}
                        {!isOutOfStock && (
                            <div className="mt-6 flex items-center gap-4">
                                <span className="text-sm font-medium text-zinc-700">Quantity:</span>
                                <div className="flex items-center rounded-lg border border-zinc-200">
                                    <button
                                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                        className="flex h-10 w-10 items-center justify-center text-zinc-600 hover:bg-zinc-50"
                                        aria-label="Decrease quantity"
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="w-12 text-center font-semibold tabular-nums">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                                        className="flex h-10 w-10 items-center justify-center text-zinc-600 hover:bg-zinc-50"
                                        aria-label="Increase quantity"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="mt-6 flex gap-3">
                            <Button
                                onClick={handleAddToCart}
                                disabled={isOutOfStock}
                                className="flex-1 h-12 bg-[#6b3e1e] hover:bg-[#5a3318] text-white"
                            >
                                <ShoppingCart className="mr-2 h-5 w-5" />
                                {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleToggleWishlist}
                                className={`h-12 w-12 p-0 ${isInWishlist
                                    ? "border-red-200 bg-red-50 text-red-500 hover:bg-red-100"
                                    : "border-zinc-200 text-zinc-600 hover:text-red-500"
                                    }`}
                                aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                            >
                                <Heart className={`h-5 w-5 ${isInWishlist ? "fill-current" : ""}`} />
                            </Button>
                        </div>

                        {/* View Full Details Link */}
                        <Link
                            href={`/products/${product.slug}`}
                            onClick={onClose}
                            className="mt-4 text-center text-sm font-medium text-[#6b3e1e] hover:underline"
                        >
                            View Full Details →
                        </Link>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
