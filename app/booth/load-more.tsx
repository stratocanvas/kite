'use client'
import useSWRInfinite from 'swr/infinite';
import SearchResult from './fetch';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import Image from 'next/image';
import { ImageOff, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';


export default function MoreBooth({ initialBoothIds, searchParams }: { initialBoothIds: string[], searchParams: any }) {
    const getKey = (pageIndex: number, previousPageData: { booth: any[] } | null) => {
        if (previousPageData && !previousPageData.booth.length) return null;
        return { searchParams, page: pageIndex + 1, limit: 5 };
    };

    const fetcher = (params) => SearchResult(params);

    const { data, size, setSize } = useSWRInfinite(getKey, fetcher, {
        initialData: [{ booth: initialBoothIds.map(id => ({ booth_id: id })) }],
    });

    const booth = data ? data.flatMap((item) => item.booth) : [];

    const filteredBooth = useMemo(() => {
        return booth.filter((booth) => !initialBoothIds.includes(booth.booth_id));
    }, [booth, initialBoothIds]);



    const { ref: buttonRef, inView: buttonInView } = useInView({
        threshold: 0,
    });

    useEffect(() => {
        if (buttonInView) {
            setSize((prev) => prev + 1);
        }
    }, [buttonInView, setSize]);

    const isLoading = data && typeof data[size - 1] === "undefined";
    const isReachingEnd = data && data[data.length - 1]?.booth?.length === 0;

    return data ? (
        <>
            {filteredBooth?.map((booth) => (
                <div key={booth.booth_id}>
                    <Link href={`/booth/${booth.booth_id}`}>
                        <Card key={booth.booth_id} className="w-full mx-auto h-full">
                            <AspectRatio ratio={21 / 27} className="relative rounded-b-md"style={{ backgroundColor: `#${booth.thumbnail.split('-c(')[1].split(')')[0]}` }}>
                                {booth.thumbnail ? (
                                    <Image src={booth.thumbnail} alt="Image" fill className="rounded-md object-cover" priority={true} />
                                ) : (
                                    <div className="rounded-md bg-muted flex justify-center items-center w-full h-full">
                                        <ImageOff className="w-10 h-10 text-muted-foreground" />
                                    </div>
                                )}
                                <div className='absolute left-4 top-4 flex gap-2'>
                                    <Badge className="rounded-md h-6" style={{ backgroundColor: `#${booth.thumbnail.split('-c(')[1].split(')')[0]}` }}>
                                        선입금
                                    </Badge>
                                    <Badge className="rounded-md h-6" style={{ backgroundColor: `#${booth.thumbnail.split('-c(')[1].split(')')[0]}` }}>
                                        통판
                                    </Badge>
                                </div>
                                <div className="absolute bottom-0 w-full h-2/3 rounded-b-md">
                                    <div className="absolute top-0 left-0 w-full h-full rounded-b-md" style={{ background: `linear-gradient(to top, #${booth.thumbnail.split('-c(')[1].split(')')[0]} 15%, transparent)`, mask: 'linear-gradient(to top, white, white, transparent)', backdropFilter: 'blur(12px)' }} />
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
            {!isReachingEnd && (
                <div ref={buttonRef}>
                    {isLoading ? (
                        <div className='flex justify-center items-center h-full'>
                            <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                    ) : (
                        <></>
                    )}
                </div>
            )}
            {isReachingEnd && <div className='text-center lg:hidden'>마지막 항목입니다</div>}
        </>
    ) : null;
}