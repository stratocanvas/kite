'use client'
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import useOptionsStore from '@/store/options';
export default function OptionImage({ productId, options }: { productId: string, options: any[] }) {
    const { selectedOptions } = useOptionsStore();
    const selectedOption = selectedOptions[productId];

    return (
        <AspectRatio ratio={1 / 1} style={{ backgroundColor: `#${options[0]?.thumbnail.split('-c(')[1].split(')')[0]}` }}>
            {selectedOption ? (
                selectedOption.thumbnail ? (
                    <Image
                        src={selectedOption.thumbnail}
                        alt="Image"
                        fill
                        className="rounded-t-md object-cover"
                        priority={true}
                    />
                ) : (
                    <div className="rounded-t-md bg-gray-200 flex justify-center items-center w-full h-full">
                        <span>No Image</span>
                    </div>
                )
            ) : options[0]?.thumbnail ? (
            
                <Image
                    src={options[0].thumbnail}
                    alt="Image"
                    fill
                    className="rounded-t-md object-cover"
                    priority={true}
                />
            ) : (
                <div className="rounded-t-md bg-gray-200 flex justify-center items-center w-full h-full">
                    <span>No Image</span>
                </div>
            )}
        </AspectRatio>
    );
};