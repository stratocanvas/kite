import { useQuery } from "@tanstack/react-query";

interface SearchResult {
	_id: string;
	name: string;
	// Add other fields as necessary
}

export const useSearchQuery = (collection: string, query: string) => {
	return useQuery<SearchResult[]>({
		queryKey: ["search", collection, query],
		queryFn: async () => {
			const response = await fetch(
				`/api/write/search?type=${collection}&query=${encodeURIComponent(
					query,
				)}`,
			);
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			return response.json();
		},
		enabled: true,
	});
};
