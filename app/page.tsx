import { SearchBar } from "../components/search/search";
import * as React from "react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/server";
import { ChevronRight } from "lucide-react"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button"
import BoothCard from "@/components/booth-card";

export interface Artwork {
  artist: string
  art: string
}

export default async function Home() {
  const supabase = createClient();

  const { data: booth } = await supabase.from("booth").select(`
  booth_id, 
  name,
  locations,
  date,
  author(author_id, name, thumbnail),
  event(event_id, name, location, start_date, end_date),
  preorder(type,date),
  genre(name),
  thumbnail`)
  .limit(10)
  .order("created_at", { ascending: false })
    const groupedBooths = booth?.reduce((acc, cur) => {
    const eventName = cur.event?.name;
    if (eventName) {
      if (!acc[eventName]) {
        acc[eventName] = [];
      }
      acc[eventName].push(cur);
    }
    return acc;
  }, {} as Record<string, typeof booth>);

  return (
    <div>
      <div className="flex mx-10 mt-10 justify-center">
        <SearchBar />
      </div>
      {Object.entries(groupedBooths).map(([eventName, booths]) => (
        <React.Fragment key={eventName}>
          <div className="ml-10 xl:ml-28 mt-10 xl:mt-14 py-1 w-auto">
            <Button className="w-auto pl-0 hover:bg-transparent" variant="ghost">
              <Link href={`/event?event=${booths[0].event.event_id}`} className="w-auto">
                <div className="flex gap-1 items-center w-auto">
                  <h1 className="scroll-m-20 text-2xl font-extrabold tracking-tight lg:text-3xl">
                    {eventName}
                  </h1>
                  <ChevronRight className="text-muted-foreground h-8 w-8" />
                </div>
              </Link>
            </Button>
          </div>
          <Carousel className="w-full"
            opts={{
              align: 'start',
              dragFree: true
            }}
            plugins={
              []
            }>
            <CarouselContent className="ml-6 xl:ml-24 mt-4 mb-10 mr-10">
              {booths?.map((booth) => (
                <CarouselItem key={booth.booth_id} className="basis-auto pl-4 w-[300px] lg:w-[350px]">
                  <BoothCard booth={booth} displayEvent={false} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </React.Fragment>
      ))}
    </div>
  );
}
