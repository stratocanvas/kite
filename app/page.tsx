'use client'
import SearchBar from "@/components/search/search";
import * as React from "react";

import QueryProvider from "@/components/search/queryprovider"; // Adjust the import path as necessary

export default function Home() {
  return (
    <QueryProvider>
      <React.Suspense fallback={<div>Loading...</div>}>
        <div className="flex mx-10 justify-center items-start mt-[20vh]">
          <SearchBar />
        </div>
      </React.Suspense>
    </QueryProvider>
  );
}
