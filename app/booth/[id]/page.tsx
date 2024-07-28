import dynamic from "next/dynamic";
import BoothProfile from "./@informations/profile";
import BoothDescription from "./@informations/description";
import BoothProducts from "./@informations/products";
import BoothPreorders from "./@informations/preorders";
import { Suspense } from "react";
const CartSummary = dynamic(() => import("./@informations/cart-summary"));
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import { notFound } from "next/navigation";
import { GetBoothData } from "./fetch";
import type { Metadata, ResolvingMetadata } from "next"
import Image from "next/image";
import { connectDB } from "@/utils/mongodb/database";
import { ObjectId } from "mongodb";
async function GetBooth(boothId: string) {
    const client = await connectDB;
    const db = client.db("kiteapp");
    const data = await db.collection("booth").findOne({ _id: new ObjectId(boothId) });
    return data;
}

//export const revalidate = 0
type Props = {
    params: { id: string }
    searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
    { params, searchParams }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    // read route params
    const id = params.id

    // fetch data
    const booth = await GetBoothData(id)
    // optionally access and extend (rather than replace) parent metadata

    return {
        title: `${booth?.name} - ${booth?.exhibition.name}`,
        description: `${booth?.author.slice(0, 3).map((author: { name: string }) => author.name).join(', ')} 작가님의 ${booth?.event.name} ${booth?.date.length === 2
            ? "양일"
            : new Date(booth?.date).toLocaleDateString("ko-KR", {
                weekday: "long",
                timeZone: "Asia/Seoul"
            })} ${booth?.genre.slice(0, 3).map((genre: { name: string }) => genre.name).join(', ')} 부스 인포`,

        openGraph: {
            title: `${booth?.name}`,
            description: `${booth?.artist.slice(0, 3).map((author: { name: string }) => author.name).join(', ')} 작가님의 ${booth?.event.name} ${booth?.date.length === 2
                ? "양일"
                : new Date(booth?.date).toLocaleDateString("ko-KR", {
                    weekday: "long",
                    timeZone: "Asia/Seoul"
                })} 부스 인포`,
            images: [`https://www.kitebooth.com/api/og/booth?id=${id}`],
            url: `https://www.kitebooth.com/booth/${id}`,
            type: 'article',
            siteName: 'Kite',
            locale: 'ko_KR',
        },
    }
}




export default async function Home({ params }: { params: { id: string } }) {

    const booth = await GetBooth(params.id);
    if (!booth) {
        notFound();
    }

    return (
        <>
        <Image src={`https://www.kitebooth.com/api/og/booth?id=${booth._id}`} alt={booth.name} width={1200} height={630} className="hidden object-cover"/>
            <div className="container m-0 p-0 pb-[160px] mx-auto">
                <div className="flex flex-col gap-4 justify-center relative xl:mx-36">
                    <div className="p-0 m-0 w-full mx-auto relative">
                        <Suspense fallback={<AspectRatio ratio={3 / 4} className="bg-muted w-full"><Skeleton className="h-full" /></AspectRatio>}>
                            <BoothProfile data={booth} color={booth.thumbnail ? `#${booth.thumbnail?.split('-c(')[1]?.split(')')[0]}` : '#797979'} />
                        </Suspense>
                    </div>
                    <div className="p-0 m-0 w-full mx-auto flex flex-col gap-4">
                        <BoothDescription data={booth} />
                        <BoothProducts data={booth} />
                        <BoothPreorders params={params} />
                    </div>
                </div>
                <div>
                    <Suspense>
                        <CartSummary boothId={params.id} />
                    </Suspense>
                </div>
            </div>
        </>
    );
}
