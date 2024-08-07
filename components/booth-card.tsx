import Link from "next/link"
import { Card, CardHeader, CardDescription, CardTitle, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { ImageOff } from "lucide-react"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"


export default function BoothCard({ booth, displayEvent }: { booth: any, displayEvent: boolean }) {
    return (
        <Link href={`/booth/${booth._id}`}>
            <Card key={booth._id} className="w-full mx-auto h-full">
                <AspectRatio ratio={21 / 27} className="relative rounded-md" style={{ backgroundColor: booth.thumbnail ? `#${booth.thumbnail.split('-c(')[1].split(')')[0]}` : '#797979' }}>
                    {booth.thumbnail ? (
                        <Image src={booth.thumbnail} alt="Image" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" fill className="rounded-md object-cover" priority={true} />
                    ) : (
                        <div className="rounded-md bg-muted flex justify-center items-center w-full h-full">
                            <ImageOff className="w-10 h-10 text-muted-foreground" />
                        </div>
                    )}
                    <div className='absolute left-4 top-4 flex gap-2'>
                        {booth.buy?.map((preorder: { date: string[], type: string }, index: number) => {
                            const now = new Date();
                            const endDate = new Date(preorder.date[preorder.date.length - 1]);
                            const isEnding = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60) <= 24;
                            if (now <= endDate) {
                                let label = '';
                                switch (preorder.type) {
                                    case 'ship':
                                        label = '통판';
                                        break;
                                    case 'preorder':
                                        label = '선입금';
                                        break;
                                    case 'survey':
                                        label = '수요조사';
                                        break;
                                }
                                return (
                                    <Badge key={index} className="rounded-md h-6 text-white" style={{ backgroundColor: booth.thumbnail ? `#${booth.thumbnail.split('-c(')[1].split(')')[0]}` : '#797979' }}>
                                        {label}{isEnding && ' 종료 임박'}
                                    </Badge>
                                );
                            }
                            return null;
                        })}
                    </div>
                    <div className="absolute bottom-0 w-full h-2/3 rounded-b-md">
                        <div className="absolute top-0 left-0 w-full h-full rounded-b-md" style={{
                            background: `linear-gradient(to top, #${booth.thumbnail?.split('-c(')[1]?.split(')')[0] || '797979'} 15%, transparent)`,
                            mask: 'linear-gradient(to top, white, white, transparent)',
                            backdropFilter: 'blur(12px)'
                        }} />
                        <div className="absolute bottom-0 rounded-b-md w-full">
                            <CardHeader>
                                {displayEvent && <CardDescription className="font-bold text-white text-opacity-70">{booth.exhibition.name}</CardDescription>}
                                <CardTitle className="text-white">{booth.name}</CardTitle>
                                <CardDescription className="text-white text-opacity-70">
                                    {booth.location?.length > 1 ?
                                        `${booth.location[0]}-${booth.location[booth.location.length - 1].match(/\d+$/)[0]}`
                                        : booth.location?.length === 1 ? booth.location[0] : "위치 미정"} ·{" "}
                                    {Array.isArray(booth?.date) && booth?.date.length === 2
                                        ? '양일'
                                        : new Date(booth?.date).toLocaleDateString('ko-KR', {
                                            weekday: 'long',
                                            timeZone: 'Asia/Seoul'
                                        })}
                                </CardDescription>
                                <CardDescription className="text-white text-opacity-70">
                                    {booth.genre?.map((genre: { name: string }) => genre?.name).join(" · ")}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="-mt-2 flex items-center justify-between h-16">
                                <div className="flex overflow-x-auto">
                                    {booth.artist.map((artist: { _id: string, name: string, thumbnail: string }, index: number) => (
                                        <div className={`relative z-${booth.artist.length - index} ${index !== booth.artist.length - 1 ? '-mr-3' : ''}`} key={artist._id}>
                                            <Avatar className="border-2" style={{ borderColor: booth.thumbnail ? `#${booth.thumbnail.split('-c(')[1].split(')')[0]}` : '#797979' }}>
                                                    {artist.thumbnail && (
                                                    <Image
                                                        src={artist?.thumbnail || ''}
                                                        alt=''
                                                        fill
                                                        sizes="(max-width: 768px) 33vw, (max-width: 1200px) 33vw, 33vw"
                                                        style={{ objectFit: "cover" }}
                                                        className="rounded-full"
                                                    />)}
                                                <AvatarFallback>{artist.name[0]}</AvatarFallback>
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
    )
}