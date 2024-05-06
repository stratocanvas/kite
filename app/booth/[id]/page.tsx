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

export const revalidate = 0
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
    
    return (
        <>
            <div className="container m-0 p-0 pb-[160px] mx-auto">
                <div className="flex flex-col gap-4 justify-center relative xl:mx-24">
                    <div className="p-0 m-0 w-full mx-auto relative">
                        <Suspense fallback={<AspectRatio ratio={3 / 4} className="bg-muted w-full"><Skeleton className="h-full" /></AspectRatio>}>
                            <BoothProfile data={booth} color={`#${booth.thumbnail.split('-c(')[1].split(')')[0]}`} />
                        </Suspense>
                    </div>
                    <div className="p-0 m-0 w-full mx-auto flex flex-col gap-4">
                        <Suspense>
                            <BoothDescription data={booth} />
                        </Suspense>
                        <Suspense fallback={<div>Loading...</div>}>
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
