'use client'
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BoothMenu, BoothMenu2 } from "../buttons/booth-menu";
import { Suspense, useMemo, useRef, useEffect } from "react";
import { useInView } from 'react-intersection-observer';

export default function BoothProfile({ data, color }: { data: any, color: string }) {

    const { ref: buttonRef, inView: buttonInView } = useInView({
        threshold: 0,
        initialInView: true,
    });

    const parallaxImageRef = useRef(null);
    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.pageYOffset;
            const parallaxRate = 0.5;
            if (parallaxImageRef.current) {
                parallaxImageRef.current.style.transform = `translateY(${scrollPosition * parallaxRate}px)`;
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const sortedLocations = useMemo(() => data?.locations?.sort((a: string, b: string) => a.localeCompare(b)) || [], [data?.locations]);
    const locationDisplay = useMemo(() => {
        if (sortedLocations.length === 0) {
            return "위치 미정";
        }
        if (sortedLocations.length > 1) {
            return `${sortedLocations[0]}-${sortedLocations[sortedLocations.length - 1].match(/\d+$/)[0]}`;
        }
        return sortedLocations[0];
    }, [sortedLocations]);

    return (
        <>
            <Card key={data?.booth_id} className="h-auto border-none shadow-none relative" ref={buttonRef}>
                <div className="relative">
                    <Suspense>
                        <BoothMenu data={data} />
                    </Suspense>

                    <AspectRatio ratio={3 / 4} className="relative rounded">
                        <div className="absolute inset-0 overflow-hidden">
                            <div ref={parallaxImageRef} className="absolute inset-0 rounded-t-lg" style={{ backgroundColor: `#${data?.thumbnail.split('-c(')[1].split(')')[0]}` }}>
                                {data?.thumbnail ? (
                                    <Image
                                        src={data?.thumbnail}
                                        alt="Booth Image"
                                        fill
                                        className="rounded-lg object-cover"
                                        priority={true}
                                    />
                                ) : (
                                    <div className="bg-gray-200 flex justify-center items-center w-full h-full">
                                        <span>No Image</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="absolute bottom-0 w-full h-2/3 md:h-1/3 rounded-b-md">
                            <div className="absolute top-0 left-0 w-full h-full" style={{ background: `linear-gradient(to top, ${color} 15%, transparent)`, mask: 'linear-gradient(to top, white, white, transparent)', backdropFilter: 'blur(12px)' }} />
                            <div className="md:pb-10 absolute bottom-4 rounded-b-md w-full flex flex-col items-center md:items-start">
                                <CardHeader className="md:pl-12 text-center md:text-left">
                                    <CardDescription className="text-white text-sm md:text-md">
                                        {data?.event?.name}
                                    </CardDescription>
                                    <CardTitle className="text-white text-2xl md:text-3xl break-words overflow-hidden text-ellipsis">
                                        {data?.name}
                                    </CardTitle>
                                    <CardDescription className="text-white text-sm md:text-md">
                                        {locationDisplay} ·{" "}
                                        {Array.isArray(data?.date) && data?.date.length === 2
                                            ? "양일"
                                            : new Date(data?.date).toLocaleDateString("ko-KR", {
                                                weekday: "long",
                                            })}
                                    </CardDescription>
                                </CardHeader>
                                <CardFooter className="pl-12 pr-12 md:pr-4 flex flex-col gap-4 w-full md:w-96">
                                    {data?.product[0]?.count > 0 && (
                                        <Button asChild type="button" size="lg" className="text-base w-full bg-white hover:bg-gray-100 text-black font-bold">
                                            <Link href={`/booth/${data?.booth_id}#goods`}>굿즈 둘러보기</Link>
                                        </Button>
                                    )}
                                </CardFooter>
                            </div>
                        </div>
                    </AspectRatio>
                </div>
            </Card>
            <div
                className={`py-2 fixed z-40 top-0 left-1/2 transform -translate-x-1/2 bg-background/70 backdrop-blur-md w-full transition-all duration-300 ${buttonInView ? 'opacity-0 -translate-y-full' : 'opacity-100 translate-y-0'}`}
            >
                <div className="flex gap-2 items-center justify-between px-4 xl:px-96">
                    <div className="flex flex-col">
                        <div className="font-bold">{data.name}</div>
                        <div className="text-sm text-muted-foreground">
                            {locationDisplay} ·{' '}
                            {Array.isArray(data?.date) && data?.date.length === 2
                                ? '양일'
                                : new Date(data?.date).toLocaleDateString('ko-KR', {
                                    weekday: 'long',
                                })}
                        </div>
                    </div>
                    <div className="flex items-center">
                        <BoothMenu2 data={data} />
                    </div>
                </div>
            </div>
        </>
    )
}