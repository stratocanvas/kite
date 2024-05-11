'use client'
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import useOptionsStore from '@/store/options';
import { Watermark } from '@hirohe/react-watermark';

export default function OptionImage({ productId, options }: { productId: string, options: any[] }) {
    const { selectedOptions } = useOptionsStore();
    const selectedOption = selectedOptions[productId];

    return (
        <Watermark text={'Sample'} lineHeight="3rem" opacity={0.2} textSize={24} textColor="#fff">
            <AspectRatio className="rounded-t-md" ratio={1 / 1}
                style={{ backgroundColor: selectedOption?.thumbnail ? `#${selectedOption.thumbnail.split('-c(')[1].split(')')[0]}` : 'transparent' }}
                onContextMenu={(e: MouseEvent<HTMLImageElement>) => {
                    e.preventDefault();
                }}>
                {selectedOption ? (
                    selectedOption.thumbnail ? (
                            <Image
                                style={{
                                    userSelect: 'none',
                                    WebkitUserSelect: 'none',
                                    WebkitTouchCallout: 'none',
                                    WebkitUserDrag: 'none',
                                    KhtmlUserSelect: 'none',
                                    MozUserSelect: 'none',
                                    OUserSelect: 'none',
                                    userDrag: 'none'
                                }}
                                src={selectedOption.thumbnail}
                                alt="Image"
                                fill
                                className="rounded-t-md object-cover no-right-click"
                                loading="lazy"
                            />

                    ) : (
                        <div className="rounded-t-md bg-muted flex justify-center items-center w-full h-full">
                            <ImageOff className="text-muted-foreground" />
                        </div>
                    )
                ) : options[0]?.thumbnail ? (
                    <>
                            <Image
                                src={options[0].thumbnail}
                                alt="Image"
                                fill
                                style={{
                                    userSelect: 'none',
                                    WebkitUserSelect: 'none',
                                    WebkitTouchCallout: 'none',
                                    WebkitUserDrag: 'none',
                                    KhtmlUserSelect: 'none',
                                    MozUserSelect: 'none',
                                    OUserSelect: 'none',
                                    userDrag: 'none'
                                }}
                                className="rounded-t-md object-cover no-right-click"
                                loading="lazy"
                            />
                    </>
                ) : (
                    <div className="rounded-t-md bg-muted flex justify-center items-center w-full h-full">
                        <ImageOff className="text-muted-foreground" />
                    </div>
                )}
            </AspectRatio>
        </Watermark>
    );
};

