import SearchBar from "@/components/search/search";
import * as React from "react";
import QueryProvider from "@/components/search/queryprovider";
import { auth } from "@/lib/auth/auth";

export default async function Home() {
	const session = await auth();

	return (
		<QueryProvider>
			<React.Suspense>
				<div className="flex mx-auto justify-center items-center mt-[20vh] w-4/5 md:w-1/2 lg:w-2/5 xl:w-1/3">
					<SearchBar />
				</div>
				{session ? <pre>{JSON.stringify(session, null, 2)}</pre> : ""}
			</React.Suspense>
		</QueryProvider>
	);
}
