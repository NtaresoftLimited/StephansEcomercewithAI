"use client";

import { useState } from "react";
import { Plus, X, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    useDocument,
    useEditDocument,
    type DocumentHandle,
} from "@sanity/sdk-react";


interface Variant {
    _key: string;
    _type: "productVariant";
    name: string;
    price: number;
    stock: number;
    weight?: string;
    sku?: string;
}

export function VariantEditor(handle: DocumentHandle) {
    const { data: variants } = useDocument({ ...handle, path: "variants" });
    const editVariants = useEditDocument({ ...handle, path: "variants" });

    const variantList = (variants as Variant[] | null) ?? [];

    const addVariant = () => {
        const newVariant: Variant = {
            _key: crypto.randomUUID(),
            _type: "productVariant",
            name: "New Variant",
            price: 0,
            stock: 0,
        };
        editVariants([...variantList, newVariant]);
    };

    const updateVariant = (key: string, field: keyof Variant, value: any) => {
        const updated = variantList.map((v) => {
            if (v._key === key) {
                return { ...v, [field]: value };
            }
            return v;
        });
        editVariants(updated);
    };

    const removeVariant = (key: string) => {
        const updated = variantList.filter((v) => v._key !== key);
        editVariants(updated.length > 0 ? updated : null);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    Product Variants ({variantList.length})
                </h3>
                <Button onClick={addVariant} size="sm" variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Variant
                </Button>
            </div>

            <div className="space-y-3">
                {variantList.map((variant, index) => (
                    <VariantItem
                        key={variant._key}
                        variant={variant}
                        index={index}
                        onUpdate={updateVariant}
                        onRemove={() => removeVariant(variant._key)}
                    />
                ))}
                {variantList.length === 0 && (
                    <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
                        <p className="text-sm text-zinc-500">No variants added yet</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function VariantItem({
    variant,
    index,
    onUpdate,
    onRemove
}: {
    variant: Variant;
    index: number;
    onUpdate: (key: string, field: keyof Variant, value: any) => void;
    onRemove: () => void;
}) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            className="items-center rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
        >
            <div className="flex items-center justify-between p-3">
                <div className="flex flex-1 items-center gap-3">
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <ChevronsUpDown className="h-4 w-4" />
                            <span className="sr-only">Toggle</span>
                        </Button>
                    </CollapsibleTrigger>
                    <div className="grid gap-0.5">
                        <div className="font-medium text-sm">
                            {variant.name || `Variant ${index + 1}`}
                        </div>
                        <div className="text-xs text-zinc-500">
                            {variant.weight ? `${variant.weight} • ` : ""}
                            TZS {variant.price?.toLocaleString() ?? 0} •
                            Stock: {variant.stock ?? 0}
                        </div>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-zinc-500 hover:text-red-600"
                    onClick={onRemove}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <CollapsibleContent>
                <div className="p-3 pt-0">
                    <hr className="mb-4 border-zinc-200 dark:border-zinc-800" />
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor={`name-${variant._key}`}>Name</Label>
                            <Input
                                id={`name-${variant._key}`}
                                value={variant.name}
                                onChange={(e) => onUpdate(variant._key, "name", e.target.value)}
                                placeholder="e.g. Small, 1kg"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`sku-${variant._key}`}>SKU</Label>
                            <Input
                                id={`sku-${variant._key}`}
                                value={variant.sku ?? ""}
                                onChange={(e) => onUpdate(variant._key, "sku", e.target.value)}
                                placeholder="Stock Keeping Unit"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`price-${variant._key}`}>Price (TZS)</Label>
                            <Input
                                id={`price-${variant._key}`}
                                type="number"
                                value={variant.price}
                                onChange={(e) => onUpdate(variant._key, "price", parseFloat(e.target.value) || 0)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`stock-${variant._key}`}>Stock</Label>
                            <Input
                                id={`stock-${variant._key}`}
                                type="number"
                                value={variant.stock}
                                onChange={(e) => onUpdate(variant._key, "stock", parseInt(e.target.value) || 0)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`weight-${variant._key}`}>Weight/Size</Label>
                            <Input
                                id={`weight-${variant._key}`}
                                value={variant.weight ?? ""}
                                onChange={(e) => onUpdate(variant._key, "weight", e.target.value)}
                                placeholder="e.g. 500g"
                            />
                        </div>
                    </div>
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}
