import { SearchBar } from "../components/search/search";
import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { createClient } from "@/utils/supabase/server";
import { ChevronRight, ImageOff } from "lucide-react"
import Vibrant from "node-vibrant";
import sharp from "sharp"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button"
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export interface Artwork {
  artist: string
  art: string
}

export default async function Home() {
  await new Promise((resolve) => setTimeout(resolve, 5000)); // 2초 지연

  const supabase = createClient();

  const { data: booth } = await supabase.from("booth").select(`
  booth_id, 
  name,
  locations,
  date,
  author(author_id, name, thumbnail),
  event(event_id, name, location, start_date, end_date),
  thumbnail`);

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

  for (const booths of Object.values(groupedBooths)) {
    for (const booth of booths) {
      if (booth.thumbnail) {
        const response = await fetch(booth.thumbnail);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const convertedImage = await sharp(buffer).toFormat('png').toBuffer();
        const palette = await Vibrant.from(convertedImage).getPalette();

        booth.darkMutedColor = palette.DarkMuted?.hex;
      } else {
        booth.darkMutedColor = "#797979";
      }
    }
  }

  return (
    <div>
      <div className="flex mx-10 mt-10 justify-center">
        <SearchBar />
      </div>
        {Object.entries(groupedBooths).map(([eventName, booths]) => (
          <React.Fragment key={eventName}>
            <div className="ml-10 mt-10 py-1 w-auto">
              <Button className="w-auto pl-0 hover:bg-transparent" variant="ghost">
                <Link href={`/event/${booths[0].event.event_id}`} className="w-auto">
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
              <CarouselContent className="ml-6 mt-4 mb-10 mr-10">
                {booths?.map((booth) => (
                    <CarouselItem key={booth.booth_id} className="basis-auto pl-4">
                      <Link href={`/booth/${booth.booth_id}`}>
                        <Card className="w-[300px] lg:w-[350px] h-full mx-auto">
                          <AspectRatio ratio={21 / 27} className="relative rounded-md">
                            {booth.thumbnail ? (
                              <Image src={booth.thumbnail} alt="Image" fill className="rounded-md object-cover" priority={true} />
                            ) : (
                              <div className="rounded-md bg-muted flex justify-center items-center" style={{ width: '100%', height: '100%' }}>
                                {/* You can place a placeholder image or text here */}
                                <ImageOff className="w-12 h-12 text-muted-foreground" />
                              </div>
                            )}
                            <div className="absolute bottom-0 w-full h-2/3 rounded-md">
                              <div className="absolute top-0 left-0 w-full h-full rounded-md" style={{ background: `linear-gradient(to top, ${booth.darkMutedColor} 15%, transparent)`, mask: 'linear-gradient(to top, white, white, transparent)', backdropFilter: 'blur(12px)' }} />
                              <div className="absolute bottom-0 rounded-md w-full">
                                <CardHeader>
                                  <CardTitle className="text-white">{booth.name}</CardTitle>
                                  <CardDescription className="text-white text-opacity-70">
                                    {booth.locations?.length > 1 ?
                                      `${booth.locations[0]}-${booth.locations[booth.locations.length - 1].match(/\d+$/)[0]}`
                                      : booth.locations?.length === 1 ? booth.locations[0] : "위치 미정"} · {" "}
                                    {Array.isArray(booth?.date) && booth?.date.length === 2
                                      ? "양일"
                                      : new Date(booth?.date).toLocaleDateString("ko-KR", {
                                        weekday: "long",
                                      })}
                                  </CardDescription>
                                </CardHeader>
                                <CardContent className="flex items-center justify-between h-16">
                                  <div className="flex overflow-x-auto">
                                    {booth.author.map((author, index) => (
                                      <div className={`relative z-${booth.author.length - index} ${index !== booth.author.length - 1 ? '-mr-3' : ''}`} key={author.name}>
                                        <Avatar className="border-2" style={{ borderColor: booth.darkMutedColor }}>
                                          <AvatarImage src={author.thumbnail} />
                                          <AvatarFallback>{author.name.slice(0, 1)}</AvatarFallback>
                                        </Avatar>
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              </div>
                            </div>
                          </AspectRatio>

                        </Card>
                      </Link>
                    </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </React.Fragment>
        ))}

    </div>
  );
}