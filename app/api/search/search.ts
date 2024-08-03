import { useQuery } from "@tanstack/react-query";
import { type NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/utils/mongodb/database";

export interface AutoCompleteResult {
	_id: string;
	name: string;
	type: string;
	genre?: { name: string };
	thumbnail?: string;
	sns?: { x: string };
	date?: Date[];
	// Add other fields as necessary
}

export const AutoComplete = (query: string) => {
	return useQuery<AutoCompleteResult[]>({
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
