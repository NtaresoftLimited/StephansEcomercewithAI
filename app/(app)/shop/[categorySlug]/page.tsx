import ShopPage from "../page";
import { Metadata } from "next";

// Define the generateMetadata wrapper to merge params into searchParams
export async function generateMetadata(props: any): Promise<Metadata> {
  const { generateMetadata: originalGenerateMetadata } = await import("../page");
  const resolvedParams = await props.params;
  const resolvedSearchParams = await props.searchParams;
  
  const newSearchParams = Promise.resolve({
    ...resolvedSearchParams,
    category: resolvedParams.categorySlug,
  });

  return originalGenerateMetadata({ searchParams: newSearchParams });
}

interface CategoryPageProps {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<{
    q?: string;
    brand?: string;
    color?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
    sort?: string;
  }>;
}

export default async function CategoryPage(props: CategoryPageProps) {
  const resolvedParams = await props.params;
  const resolvedSearchParams = await props.searchParams;

  const newSearchParams = Promise.resolve({
    ...resolvedSearchParams,
    category: resolvedParams.categorySlug,
  });

  return <ShopPage searchParams={newSearchParams} />;
}

