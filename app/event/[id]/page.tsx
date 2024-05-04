import { createClient } from "@/utils/supabase/server";
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Button } from "@/components/ui/button"
import { Home, Map, Ticket, Heart } from "lucide-react"
import sharp from "sharp";
import Vibrant from "node-vibrant";
export const runtime = 'edge';
export default async function EventInfo({ params }) {
  const supabase = createClient();

  const { data: booth } = await supabase.from("booth").select(`
  booth_id, 
  name,
  locations,
  author(name, thumbnail, sns_x),
  event_id,
  date,
  thumbnail`)
    .eq('event_id', params.id);


  const boothWithColors = await Promise.all(
    booth.map(async (booth) => {
      if (booth.thumbnail) {
        const response = await fetch(booth.thumbnail);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const convertedImage = await sharp(buffer).toFormat('png').toBuffer();
        const palette = await Vibrant.from(convertedImage).getPalette();

        return { ...booth, darkMutedColor: palette.DarkMuted?.hex };
      }
      return { ...booth, darkMutedColor: "#797979" };
    })
  );

  const { data: event } = await supabase.from("event").select(`
  event_id, 
  name,
  location,
  start_date,
  end_date,
  homepage,
  ticketpage,
  map_data`)
    .eq('event_id', params.id)
    .limit(1)
    .single();

  return (
    <>
      <Card className="mx-8">
        <CardHeader>
          <CardTitle>{event?.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{event?.location}</p>
          <p>{event?.start_date} - {event?.end_date}</p>
        </CardContent>
        <CardFooter className="flex flex-col lg:flex-row gap-2">
          {event?.homepage ? (
            <Button asChild className="w-full lg:w-auto">
              <Link href={event?.homepage}>
                <Home className="w-4 h-4 mr-2" />
                홈페이지
              </Link>
            </Button>
          ) : (
            <Button disabled className="w-full lg:w-auto">
              <Home className="w-4 h-4 mr-2" />
              홈페이지
            </Button>
          )}
          {event?.ticketpage ? (
            <Button asChild variant="secondary" className="w-full lg:w-auto">
              <Link href={event?.ticketpage}>
                <Ticket className="w-4 h-4 mr-2" />
                입장권 구매
              </Link>
            </Button>
          ) : (
            <Button disabled variant="secondary" className="w-full lg:w-auto">
              <Ticket className="w-4 h-4 mr-2" />
              입장권 구매
            </Button>
          )}
          {event?.map_data ? (
            <Button asChild variant="secondary" className="w-full lg:w-auto">
              <Link href={`/event/map?id=${event?.event_id}`}>
                <Map className="w-4 h-4 mr-2" />
                지도
              </Link>
            </Button>
          ) : (
            <Button disabled variant="secondary" className="w-full lg:w-auto">
              <Map className="w-4 h-4 mr-2" />
              지도
            </Button>
          )}
        </CardFooter>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-5 gap-6 p-8">
        {boothWithColors?.map((booth) => (
          <div key={booth.booth_id}>
            <Link href={`/booth/${booth.booth_id}`}>
              <Card key={booth.booth_id} className="w-full mx-auto h-full">
                <AspectRatio ratio={21 / 27} className="relative rounded-b-md">
                  {booth.thumbnail ? (
                    <Image src={booth.thumbnail} alt="Image" fill className="rounded-md object-cover" priority={true} />
                  ) : (
                    <div className="rounded-md bg-gray-200 flex justify-center items-center w-full h-full">
                      {/* You can place a placeholder image or text here */}
                      <span>No Image</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 w-full h-2/3 rounded-b-md">
                    <div className="absolute top-0 left-0 w-full h-full rounded-b-md" style={{ background: `linear-gradient(to top, ${booth.darkMutedColor} 15%, transparent)`, mask: 'linear-gradient(to top, white, white, transparent)', backdropFilter: 'blur(12px)' }} />
                    <div className="absolute bottom-0 rounded-b-md w-full">
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
                        <Heart className="w-6 h-6 text-white" />
                      </CardContent>
                    </div>
                  </div>
                </AspectRatio>

              </Card>
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}