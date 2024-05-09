
import SearchResult from "./fetch";
import { SearchBarSmall } from "@/components/search/search"
import MoreBooth from "../../components/load-more";
import BoothCard from "@/components/booth-card";

async function getBoothData(searchParams: { character?: string; category?: string; genre?: string; author?: string } = {}) {
  const { booth } = await SearchResult({ searchParams });
  return booth;
}

export default async function BoothList({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const booth = await getBoothData(searchParams);
  const initialBoothIds = booth.map((booth) => booth.booth_id);

  return (
    <>
      <div className="w-full flex justify-center items-center mx-auto px-8 sticky top-0 z-10 bg-background/80 py-2 backdrop-blur-md">
        <SearchBarSmall params={searchParams} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-5 gap-6 p-8 mt-4">
        {booth?.map((booth) => (
          <div key={booth.booth_id}>
            <BoothCard booth={booth} displayEvent />
          </div>
        ))}
        <MoreBooth initialBoothIds={initialBoothIds} searchParams={searchParams} />
      </div>

    </>
  );
}