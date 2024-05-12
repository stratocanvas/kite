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
      title: `${booth?.name}`,
      description: `${booth?.event.name} 부스 인포`,
      openGraph: {
        title: `${booth?.name}`,
        description: `${booth?.event.name} 부스 인포`,
        images: [`/app/api/og/booth/${id}`],
        url: `https://www.kitebooth.com/booth/${id}`,
      },
    }
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
                            <BoothProfile data={booth} color={booth.thumbnail ? `#${booth.thumbnail?.split('-c(')[1]?.split(')')[0]}` : '#797979'} />
                        </Suspense>
                    </div>
                    <div className="p-0 m-0 w-full mx-auto flex flex-col gap-4">
                        <BoothDescription data={booth} />
                        <BoothProducts params={params} />
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
