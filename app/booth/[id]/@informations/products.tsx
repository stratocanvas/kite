
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
import { Label } from "@/components/ui/label";
import OptionPrice from "./option-price";
import SelectOptionsButton from "../buttons/select-options";
import * as React from "react"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import AddCart from "../buttons/add-cart";
import { createClient } from '@/utils/supabase/server'
import OptionImage from "./option-image";

export const revalidate = 0


export async function GetProductData(boothId: string) {


    const supabase = createClient();
    const { data: product } = await supabase
        .from("product")
        .select(`product_id, name, adult, 
                 category(name),
                 author(name),
                 p_option(option_id, name, price, thumbnail, character(name, thumbnail))`)
        .eq("booth_id", boothId);
    return product;
}


export default async function BoothProducts({ params }: { params: { id: string } }) {
    const product = await GetProductData(params.id);
    return (
        <>
            {product.length > 0 && (
                <Card key={product?.product_id} className="h-[100%] flex flex-col border-none shadow-none" id="goods">
                    <CardContent className="flex-grow mt-6 flex items-center overflow-x-auto">
                        <Label className="text-xl font-bold">굿즈</Label>
                    </CardContent>
                    <CardContent className="-mt-2 pl-0 pr-0 overflow-x-auto">
                        <Carousel className="w-full"
                            opts={{
                                align: 'start',
                                dragFree: true
                            }}
                            plugins={
                                []
                            }>
                            <CarouselContent className="ml-3 mr-6">
                                {product?.map((product: any) => (
                                    <CarouselItem key={product.product_id} className="basis-auto pl-3">
                                        <Card

                                            className="w-[290px] h-[100%] flex flex-col"
                                        >

                                            <OptionImage productId={product.product_id} options={product.p_option} />
                                            <CardHeader>
                                                <CardDescription>
                                                    {product.author.length > 2
                                                        ? `${product.author[0].name}, ${product.author[1].name
                                                        } 외 ${product.author.length - 2}명`
                                                        : product.author.map((author: any, index: number) =>
                                                            index !== product.author.length - 1
                                                                ? `${author.name}, `
                                                                : author.name,
                                                        )}
                                                </CardDescription>
                                                <CardTitle className="break-words overflow-hidden text-ellipsis">
                                                    {product.name}
                                                </CardTitle>
                                                <OptionPrice productId={product.product_id} />
                                            </CardHeader>
                                            <CardContent className="flex-grow -mt-2 flex items-start justify-start overflow-x-auto">
                                                <SelectOptionsButton
                                                    product={product}
                                                    options={product.p_option}
                                                />
                                            </CardContent>
                                            <CardFooter className="flex items-center overflow-x-auto mt-auto">
                                                <AddCart product={product} boothId={params.id} />
                                            </CardFooter>
                                        </Card>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="ml-16 w-10 h-10" />
                            <CarouselNext className="mr-16 w-10 h-10" />
                        </Carousel>
                    </CardContent>
                </Card >
            )}
        </>
    );
}
