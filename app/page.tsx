import SearchBar from "@/components/search/search";
import * as React from "react";
import QueryProvider from "@/components/search/queryprovider";

export default function Home() {
	return (
		<QueryProvider>
			<React.Suspense>
				<div className="flex mx-10 justify-center items-start mt-[20vh]">
					<SearchBar />
				</div>
			</React.Suspense>
		</QueryProvider>
	);
}
