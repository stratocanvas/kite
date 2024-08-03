import { useQuery } from "@tanstack/react-query";
import { type NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/utils/mongodb/database";

interface SearchResult {
	_id: string;
	name: string;
	type: string;
	genre: { name: string };
	thumbnail: string;
	// Add other fields as necessary
}

export const useSearchQuery = (query: string) => {
	return useQuery<SearchResult[]>({
		queryKey: ["search", query],
		queryFn: async () => {
			const response = await fetch(
				`/api/search?&query=${encodeURIComponent(query)}`,
			);
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			return response.json();
		},
		enabled: !!query,
	});
};