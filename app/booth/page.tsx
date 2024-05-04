
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { ImageOff } from "lucide-react";
import SearchResult from "./fetch";
import { SearchBarSmall } from "@/components/search/search"
import { Badge } from '@/components/ui/badge';
import MoreBooth from "./load-more";
async function getBoothData(searchParams: { character?: string; category?: string; genre?: string; author?: string } = {}) {

  const { booth } = await SearchResult({ searchParams });
  return booth
}


export default async function BoothList({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const boothWithColors = await getBoothData(searchParams);
  const initialBoothIds = boothWithColors.map((booth) => booth.booth_id);

  return (
    <>
      <div className="w-full flex justify-center items-center mx-auto px-8 sticky top-0 z-10 bg-background/80 py-2 backdrop-blur-md">
        <SearchBarSmall params={searchParams} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-5 gap-6 p-8">
        {boothWithColors?.map((booth) => (
          <div key={booth.booth_id}>
            <Link href={`/booth/${booth.booth_id}`}>
              <Card key={booth.booth_id} className="w-full mx-auto h-full">
                <AspectRatio ratio={21 / 27} className="relative rounded-b-md">
                  {booth.thumbnail ? (
                    <Image src={booth.thumbnail} alt="Image" fill className="rounded-md object-cover" priority={true} />
                  ) : (
                    <div className="rounded-md bg-muted flex justify-center items-center w-full h-full">
                      {/* You can place a placeholder image or text here */}
                      <ImageOff className="w-10 h-10 text-muted-foreground" />
                    </div>
                  )}
                  <div className='absolute left-4 top-4 flex gap-2'>
                    <Badge className="rounded-md h-6 text-white" style={{ backgroundColor: booth.colors.darkMuted }}>
                      선입금
                    </Badge>
                    <Badge className="rounded-md h-6 text-white" style={{ backgroundColor: booth.colors.darkMuted }}>
                      통판
                    </Badge>
                  </div>
                  <div className="absolute bottom-0 w-full h-2/3 rounded-b-md">
                    <div className="absolute top-0 left-0 w-full h-full rounded-b-md" style={{ background: `linear-gradient(to top, ${booth.colors.darkMuted} 15%, transparent)`, mask: 'linear-gradient(to top, white, white, transparent)', backdropFilter: 'blur(12px)' }} />
                    <div className="absolute bottom-0 rounded-b-md w-full">
                      <CardHeader>
                        <CardDescription className="font-bold text-white text-opacity-70">{booth.event.name}</CardDescription>
                        <CardTitle className="text-white">{booth.name}</CardTitle>
                        <CardDescription className="text-white text-opacity-70">
                          {booth.locations?.length > 1 ?
                            `${booth.locations[0]}-${booth.locations[booth.locations.length - 1].match(/\d+$/)[0]}`
                            : booth.locations?.length === 1 ? booth.locations[0] : "위치 미정"} ·{" "}
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
                              <Avatar className="border-2" style={{ borderColor: booth.colors.darkMuted }}>
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
          </div>
        ))}
        <MoreBooth initialBoothIds={initialBoothIds} searchParams={searchParams} />
      </div>

    </>
  );
}