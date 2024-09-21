import { useQuery } from "@tanstack/react-query";

interface SearchResult {
	available: boolean;
	cause: string;
}

export const checkUID = (query: string, initial:string) => {
	return useQuery<SearchResult>({
		queryKey: ["checkUID", query],
		queryFn: async () => {
			const response = await fetch(
				`/api/checkUID?query=${encodeURIComponent(query)}&initial=${encodeURIComponent(initial)}`,
			);
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			return response.json();
		},
		enabled: !!query,
	});
};
