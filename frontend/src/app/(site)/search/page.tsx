import { SearchPageClient } from "@/components/SearchPageClient";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Search Funds",
    description: "Search for ETFs and mutual funds to view their holdings.",
};

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const initialQuery = typeof params.q === 'string' ? params.q : '';

    return <SearchPageClient initialQuery={initialQuery} />;
}
