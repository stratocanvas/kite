import { GetBoothList } from "@/app/api/booth/fetch";
import BoothCard from "@/components/booth-card";
import SearchBar from "@/components/search/search";

import QueryProvider from "@/components/search/queryprovider";
import React from "react";
async function getBoothData(searchParams: { q?: string } = {}) {
	// Always call GetBoothList, even if there are no search parameters
	const booths = await GetBoothList(searchParams.q);
	return booths || [];
}

export default async function BoothList({
	searchParams,
}: {
	searchParams: { [key: string]: string | string[] | undefined };
}) {
	const booths = await getBoothData(searchParams);
	const initialBoothIds = booths?.map((booth) => booth._id) || [];

	return (
		<>
			<QueryProvider>
				<React.Suspense>
					<div className="flex justify-center items-center z-20 fixed left-1/2 transform -translate-x-1/2 w-full">
						<div className="w-4/5 md:w-1/2 lg:w-2/5 xl:w-1/3">
							<SearchBar minified />
						</div>
					</div>
				</React.Suspense>
			</QueryProvider>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 p-8 mt-4">
				{booths && booths.length > 0 ? (
					booths.map((booth) => (
						<BoothCard key={booth._id} booth={booth} displayEvent />
					))
				) : (
					<p>No booths found. Try adjusting your search criteria.</p>
				)}
			</div>
		</>
	);
}
