'use client'
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import useOptionsStore from '@/store/options';
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
export default function OptionImage({ productId, options }: { productId: string, options: any[] }) {
    const { selectedOptions } = useOptionsStore();
    const selectedOption = selectedOptions[productId];
    return (
        <Suspense fallback={<Skeleton className="w-full h-full rounded-t-md" />}>
            <AspectRatio ratio={1 / 1}>
                {selectedOption ? (
                    selectedOption.thumbnail ? (
                        <Image
                            src={selectedOption.thumbnail}
                            alt="Image"
                            fill
                            className="rounded-t-md object-cover"
                            loading="lazy"
                        />
                    ) : (
                        <div className="rounded-t-md bg-muted flex justify-center items-center w-full h-full">
                            <ImageOff className="w-12 h-12 text-muted-foreground" />
                        </div>
                    )
                ) : options[0]?.thumbnail ? (
                    <Image
                        src={options[0].thumbnail}
                        alt="Image"
                        fill
                        className="rounded-t-md object-cover"
                        loading="lazy"
                    />
                ) : (
                    <div className="rounded-t-md bg-muted flex justify-center items-center w-full h-full">
                        <ImageOff className="w-12 h-12 text-muted-foreground" />
                    </div>
                )}
            </AspectRatio>
        </Suspense>
    );
};