import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/components/ui/card";

import { Label } from "@/components/ui/label";
import OptionPrice from "../@informations/option-price";
import SelectOptionsButton from "../buttons/select-options";
import * as React from "react"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel"
import AddCart from "../buttons/add-cart";
import OptionImage from "../@informations/option-image";

export default async function BoothProducts({ data }: { data: any }) {
    const product = data?.product
    return (
        <>
            {product && product.length > 0 && (
                <>
                <Card key={product?._id} className="h-[100%] flex flex-col border-none shadow-none" id="goods">
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
                                    <CarouselItem key={product._id} className="basis-auto pl-3">
                                        <Card

                                            className="w-[290px] h-[100%] flex flex-col"
                                        >

                                            <OptionImage productId={product._id} options={product.option} />
                                            <CardHeader>
                                                <CardDescription>
                                                    {product.artist.length > 2
                                                        ? `${product.artist[0].name}, ${product.artist[1].name
                                                        } 외 ${product.artist.length - 2}명`
                                                        : product.artist.map((artist: any, index: number) =>
                                                            index !== product.artist.length - 1
                                                                ? `${artist.name}, `
                                                                : artist.name,
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
                                                    options={product.option}
                                                />
                                            </CardContent>
                                            <CardFooter className="flex items-center overflow-x-auto mt-auto">
                                                <AddCart product={product} boothId={data._id} />
                                            </CardFooter>
                                        </Card>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                        </Carousel>
                    </CardContent>
                </Card >
                </>
            )}
        </>
    );
}
