import BoothProfile from "./@informations/profile";
import BoothDescription from "./@informations/description";
import BoothProducts from "./@informations/products";
import { Suspense } from "react";
import CartSummary from "./@informations/cart-summary";
import { createClient } from '@/utils/supabase/server'
import { useMemo } from 'react';
import Vibrant from "node-vibrant"
import sharp from "sharp";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
export const runtime = 'edge';
export async function GetBoothData(boothId: string) {
    const supabase = createClient()
    const { data: booth } = await supabase
        .from("booth")
        .select(`booth_id, name, locations, thumbnail, date,
                 author(author_id, name, thumbnail, sns_x),
                 event(name), article, product(count)`)
        .eq("booth_id", boothId)
        .limit(1)
        .single();
    return booth;
}


export default async function Home({ params }: { params: { id: string } }) {
    const booth = await GetBoothData(params.id);
    if (!booth) {
        notFound();
    }
    let darkMutedColor = "#797979"; // Default color

    if (booth?.thumbnail) {
        const response = await fetch(booth.thumbnail);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const convertedImage = await sharp(buffer).toFormat('png').toBuffer();
        const palette = await Vibrant.from(convertedImage).getPalette();

        darkMutedColor = palette.DarkMuted?.hex || "#797979";
    }

    return (
        <>
            <div className="container m-0 p-0 pb-[160px] mx-auto">
                <div className="flex flex-col gap-4 justify-center relative xl:mx-24">
                    <div className="p-0 m-0 w-full mx-auto relative">
                        <Suspense fallback={<AspectRatio ratio={3 / 4} className="bg-muted w-full"><Skeleton className="h-full" /></AspectRatio>}>
                            <BoothProfile data={booth} color={darkMutedColor} />
                        </Suspense>
                    </div>
                    <div className="p-0 m-0 w-full mx-auto flex flex-col gap-4">
                        <Suspense>
                            <BoothDescription data={booth} />
                        </Suspense>
                        <Suspense fallback={<ProductsSkeleton />}>
                            <BoothProducts params={params} />
                        </Suspense>
                    </div>
                </div>
                <div>
                    <Suspense fallback={<div>Loading...</div>}>
                        <CartSummary boothId={params.id} />
                    </Suspense>
                </div>
            </div>
        </>
    );
}

function ProductsSkeleton() {
    return (
        <Card className="h-[100%] flex flex-col border-none shadow-none">
            <CardContent className="flex-grow mt-6 flex items-center overflow-x-auto">
                <Label className="text-xl font-bold">
                    <Skeleton className="w-20 h-6" />
                </Label>
            </CardContent>
            <CardContent className="-mt-1 pl-6 pr-0 overflow-x-auto">
                <div className="flex space-x-4">
                    <Card className="w-[290px] h-[100%] flex flex-col">
                        <AspectRatio ratio={1 / 1}>
                            <div className="rounded-t-md bg-muted flex justify-center items-center w-full h-full">
                                <Skeleton className="w-full h-full" />
                            </div>
                        </AspectRatio>
                        <CardHeader>
                            <CardDescription>
                                <Skeleton className="w-32 h-4" />
                            </CardDescription>
                            <CardTitle className="break-words overflow-hidden text-ellipsis">
                                <Skeleton className="w-48 h-6" />
                            </CardTitle>
                            <Skeleton className="w-24 h-4" />
                        </CardHeader>
                        <CardContent className="flex-grow -mt-2 flex items-start justify-start overflow-x-auto">
                            <Skeleton className="w-32 h-10" />
                        </CardContent>
                        <CardFooter className="flex items-center overflow-x-auto mt-auto">
                            <Skeleton className="w-24 h-10" />
                        </CardFooter>
                    </Card>
                </div>
            </CardContent>
        </Card>
    );
}