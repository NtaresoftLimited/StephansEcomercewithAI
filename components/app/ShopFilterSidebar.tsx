"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";

type FacetProduct = {
  price?: number;
  color?: string;
  material?: string;
  brand?: { name?: string; slug?: string } | null;
};

interface ShopFilterSidebarProps {
  categories?: any[];
  activeCategorySlug?: string;
  brands?: any[];
  facetProducts?: FacetProduct[];
}

const ROOT_CATEGORIES = [
  { title: "All products", slug: "", href: "/shop" },
  { title: "Dogs", slug: "dogs", href: "/shop/dogs" },
  { title: "Cats", slug: "cats", href: "/shop/cats" },
  { title: "Birds", slug: "birds", href: "/shop/birds" },
  { title: "Small Animals", slug: "small-animals", href: "/shop/small-animals" },
];

function titleCase(value: string) {
  return value.replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function ShopFilterSidebar({
  categories = [],
  activeCategorySlug = "",
  brands = [],
  facetProducts = [],
}: ShopFilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

  const selected = (key: string) => (searchParams.get(key) || "").split(",").filter(Boolean);
  const selectedBrands = selected("brand");
  const selectedColors = selected("color");
  const selectedMaterials = selected("material");

  const navigate = (mutate: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const toggleValue = (key: string, value: string) => {
    navigate((params) => {
      const values = new Set((params.get(key) || "").split(",").filter(Boolean));
      values.has(value) ? values.delete(value) : values.add(value);
      values.size ? params.set(key, Array.from(values).join(",")) : params.delete(key);
    });
  };

  const facetOptions = useMemo(() => {
    const brandLabels = new Map<string, string>();
    for (const brand of brands) {
      const slug = brand?.slug?.current || brand?.slug;
      if (slug) brandLabels.set(slug, brand.name || titleCase(slug));
    }

    const brandCounts = new Map<string, number>();
    const colorCounts = new Map<string, number>();
    const materialCounts = new Map<string, number>();
    for (const product of facetProducts) {
      if (product.brand?.slug) {
        brandLabels.set(product.brand.slug, product.brand.name || titleCase(product.brand.slug));
        brandCounts.set(product.brand.slug, (brandCounts.get(product.brand.slug) || 0) + 1);
      }
      if (product.color) colorCounts.set(product.color, (colorCounts.get(product.color) || 0) + 1);
      if (product.material) materialCounts.set(product.material, (materialCounts.get(product.material) || 0) + 1);
    }

    const format = (counts: Map<string, number>, labels?: Map<string, string>) =>
      Array.from(counts, ([value, count]) => ({ value, count, label: labels?.get(value) || titleCase(value) }))
        .sort((a, b) => a.label.localeCompare(b.label));

    return {
      brands: format(brandCounts, brandLabels),
      colors: format(colorCounts),
      materials: format(materialCounts),
    };
  }, [brands, facetProducts]);

  const activeFilterCount = selectedBrands.length + selectedColors.length + selectedMaterials.length
    + Number(Boolean(searchParams.get("minPrice"))) + Number(Boolean(searchParams.get("maxPrice")));

  const clearFilters = () => navigate((params) => {
    ["brand", "color", "material", "minPrice", "maxPrice"].forEach((key) => params.delete(key));
    setMinPrice("");
    setMaxPrice("");
  });

  const applyPrice = (event: React.FormEvent) => {
    event.preventDefault();
    navigate((params) => {
      minPrice ? params.set("minPrice", minPrice) : params.delete("minPrice");
      maxPrice ? params.set("maxPrice", maxPrice) : params.delete("maxPrice");
    });
  };

  const CheckboxGroup = ({
    title,
    param,
    options,
    values,
  }: {
    title: string;
    param: string;
    options: Array<{ value: string; label: string; count: number }>;
    values: string[];
  }) => options.length ? (
    <details open className="group border-t border-[#E7DED2] py-5">
      <summary className="flex cursor-pointer list-none items-center justify-between text-[12px] font-bold uppercase tracking-[0.12em] text-[#4E2A15]">
        {title}
        <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
      </summary>
      <div className="mt-4 max-h-56 space-y-2.5 overflow-y-auto pr-1">
        {options.map((option) => (
          <label key={option.value} className="flex cursor-pointer items-center gap-3 text-sm text-[#5D5148] hover:text-[#C77E35]">
            <input
              type="checkbox"
              checked={values.includes(option.value)}
              onChange={() => toggleValue(param, option.value)}
              className="h-4 w-4 rounded border-[#CFC3B5] accent-[#C77E35]"
            />
            <span className="min-w-0 flex-1 truncate">{option.label}</span>
            <span className="text-xs tabular-nums text-[#9A8E82]">{option.count}</span>
          </label>
        ))}
      </div>
    </details>
  ) : null;

  const panel = (
    <div className="bg-[#FAF7F2]">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-serif text-2xl text-[#231F1B]">Filter products</h2>
        {activeFilterCount > 0 && (
          <button type="button" onClick={clearFilters} className="text-xs font-semibold text-[#A45E25] hover:underline">
            Clear all
          </button>
        )}
      </div>

      <details open className="group border-t border-[#E7DED2] py-5">
        <summary className="flex cursor-pointer list-none items-center justify-between text-[12px] font-bold uppercase tracking-[0.12em] text-[#4E2A15]">
          Categories
          <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
        </summary>
        <nav className="mt-4 space-y-2.5" aria-label="Product categories">
          {ROOT_CATEGORIES.map((category) => {
            const active = category.slug === activeCategorySlug || (!category.slug && !activeCategorySlug);
            return (
              <Link
                key={category.title}
                href={category.href}
                className={`block text-sm transition-colors ${active ? "font-bold text-[#C77E35]" : "text-[#5D5148] hover:text-[#C77E35]"}`}
              >
                {category.title}
              </Link>
            );
          })}
        </nav>
      </details>

      <CheckboxGroup title="Brands" param="brand" options={facetOptions.brands} values={selectedBrands} />
      <CheckboxGroup title="Colour" param="color" options={facetOptions.colors} values={selectedColors} />
      <CheckboxGroup title="Material" param="material" options={facetOptions.materials} values={selectedMaterials} />

      <details open className="group border-y border-[#E7DED2] py-5">
        <summary className="flex cursor-pointer list-none items-center justify-between text-[12px] font-bold uppercase tracking-[0.12em] text-[#4E2A15]">
          Price range
          <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
        </summary>
        <form onSubmit={applyPrice} className="mt-4">
          <div className="grid grid-cols-2 gap-2">
            <input aria-label="Minimum price" inputMode="numeric" value={minPrice} onChange={(event) => setMinPrice(event.target.value.replace(/\D/g, ""))} placeholder="Min TSh" className="min-w-0 rounded-lg border border-[#DED4C8] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#C77E35]" />
            <input aria-label="Maximum price" inputMode="numeric" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value.replace(/\D/g, ""))} placeholder="Max TSh" className="min-w-0 rounded-lg border border-[#DED4C8] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#C77E35]" />
          </div>
          <button type="submit" className="mt-3 w-full rounded-lg bg-[#4E2A15] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#63371D]">
            Apply price
          </button>
        </form>
      </details>
    </div>
  );

  return (
    <aside className="w-full">
      <button type="button" onClick={() => setMobileOpen(true)} className="flex w-full items-center justify-between rounded-xl border border-[#DED4C8] bg-white px-4 py-3 text-sm font-semibold text-[#4E2A15] lg:hidden">
        <span className="flex items-center gap-2"><SlidersHorizontal className="h-4 w-4" /> Filters</span>
        {activeFilterCount > 0 && <span className="rounded-full bg-[#C77E35] px-2 py-0.5 text-xs text-white">{activeFilterCount}</span>}
      </button>

      <div className="hidden lg:block">{panel}</div>

      {mobileOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden" role="dialog" aria-modal="true" aria-label="Product filters">
          <button type="button" aria-label="Close filters" onClick={() => setMobileOpen(false)} className="absolute inset-0 bg-black/35" />
          <div className="absolute inset-y-0 left-0 flex w-[min(88vw,360px)] flex-col bg-[#FAF7F2] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E7DED2] px-5 py-4">
              <span className="font-semibold text-[#4E2A15]">Shop filters</span>
              <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close filters" className="rounded-full p-2 hover:bg-black/5"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">{panel}</div>
            <div className="border-t border-[#E7DED2] bg-white p-4">
              <button type="button" onClick={() => setMobileOpen(false)} className="w-full rounded-xl bg-[#4E2A15] py-3 text-sm font-bold text-white">Show products</button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
