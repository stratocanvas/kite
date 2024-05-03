'use client'
import {
    Card,
    CardContent,
    CardTitle,
    CardDescription,
    CardFooter,
    CardHeader
} from "@/components/ui/card";
import { useMemo, useCallback, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Minus, Plus } from "lucide-react";
import useSWR from 'swr';
import { GetCart, AddOrUpdateCart, DeleteCart } from '../actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useSearchParams, usePathname, useRouter } from "next/navigation";

import IndoorMap from "./map"
import { Suspense } from "react";

interface Event {
    value: string;
    label: string;
}

export default function Cart() {
    const { data: items, mutate } = useSWR('cart', GetCart);
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState("");
    const [events, setEvents] = useState<Event[]>([]);


    //장바구니에 포함된 상품 수량 변경
    const handleQuantityChange = useCallback(async (productId: string, optionId: string, quantity: number, isIncrease: boolean) => {
        const newQuantity = isIncrease ? quantity + 1 : quantity - 1;

        mutate(items?.map(item => {
            if (item.product_id === productId && item.option_id === optionId) {
                return { ...item, quantity: newQuantity };
            }
            return item;
        }), false);

        try {
            if (newQuantity > 0) {
                await AddOrUpdateCart(productId, optionId, newQuantity);
            } else {
                await DeleteCart(productId, optionId);
            }
            mutate();
        } catch (error) {
            console.error('Failed to update cart:', error);
            mutate();
        }
    }, [mutate, items]);

    //부스 목록 그룹화
    const booths = useMemo(() => {
        return items?.reduce((acc: { [key: string]: any }, item: any) => {
            if (item.eventId === value) {
                const boothId = item.product.booth.booth_id;
                if (!acc[boothId]) {
                    acc[boothId] = {
                        boothName: item.boothName,
                        products: [],
                        boothLocation: item.boothLocation[0],
                        boothLocationAll: item.boothLocation
                    };
                } else {
                    acc[boothId].boothLocationAll = [...new Set([...acc[boothId].boothLocationAll, ...item.boothLocation])];
                }
                const productIndex = acc[boothId].products.findIndex(product => product.productId === item.product_id);
                if (productIndex > -1) {
                    const optionIndex = acc[boothId].products[productIndex].options.findIndex(option => option.optionId === item.option_id);
                    if (optionIndex > -1) {
                        acc[boothId].products[productIndex].options[optionIndex].quantity += item.quantity;
                    } else {
                        acc[boothId].products[productIndex].options.push({
                            optionId: item.option_id,
                            optionName: item.optionName,
                            price: item.price,
                            quantity: item.quantity
                        });
                    }
                } else {
                    acc[boothId].products.push({
                        productId: item.product_id,
                        productName: item.productName,
                        options: [{
                            optionId: item.option_id,
                            optionName: item.optionName,
                            price: item.price,
                            quantity: item.quantity
                        }]
                    });
                }
            }
            return acc;
        }, {}) || {};
    }, [items, value]);

    //부스 위치 전달
    const allBoothLocations = useMemo(() => {
        return Object.values(booths).reduce((acc: any[], booth: any) => {
            acc.push(...booth.boothLocationAll);
            return acc;
        }, []);
    }, [booths]);

    useEffect(() => {
        if (items) {
            const uniqueEvents = Array.from(new Set(items.map(item => ({
                value: item.eventId,
                label: item.eventName
            })).map(e => JSON.stringify(e)))).map(e => JSON.parse(e));
            setEvents(uniqueEvents);
            if (uniqueEvents.length > 0 && !value) {
                setValue(uniqueEvents[0].value);
            }
        }
    }, [items, value]);



    const router = useRouter()
    const pathname = usePathname()
    // Get a new searchParams string by merging the current
    // searchParams with a provided key/value pair
    useEffect(() => {
        if (value) {
          const params = new URLSearchParams();
          params.set('id', value);
          const newUrl = `${window.location.pathname}?${params.toString()}`;
          router.replace(newUrl, undefined, { shallow: true });
        }
      }, [value, router]);


    return (
        <>
            <Card className="border-none shadow-none">
                <CardHeader>
                    <CardTitle className="font-bold">
                        북마크
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-0">
                    <div className="flex flex-col gap-2">
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    className="w-[calc(100%-3rem)] lg:w-[250px] justify-between mx-6"
                                >
                                    {value
                                        ? events.find((event) => event.value === value)?.label
                                        : "행사 선택..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <Suspense>
                                <PopoverContent className="w-full lg:w-[250px] p-0">
                                    <Command>
                                        <CommandInput placeholder="행사 검색..." />
                                        <CommandList>
                                            <CommandEmpty>검색된 행사 없음</CommandEmpty>
                                            <CommandGroup>
                                                {events.map((event) => (
                                                    <CommandItem
                                                    key={event.value}
                                                    value={event.value}
                                                    onSelect={() => {
                                                      setValue(event.value === value ? "" : event.value);
                                                      setOpen(false);
                                                    }}
                                                  >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                value === event.value ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {event.label}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Suspense>
                        </Popover>
                        <div className="flex flex-col lg:flex-row lg:w-full">
                            <Card className="w-[calc(100%-3rem)] ml-6 mb-3 lg:w-1/2 h-[330px] lg:h-[700px]">
                                <CardContent className="w-full h-full p-0 m-0">
                                    <Suspense>
                                        <IndoorMap eventId={value} boothLocations={allBoothLocations} />
                                    </Suspense>
                                </CardContent>
                            </Card>
                            <Tabs defaultValue="cart" className="w-full lg:w-1/2">
                                <TabsList className="w-[calc(100%-3rem)] mx-6">
                                    <TabsTrigger value="wishlist">위시리스트</TabsTrigger>
                                    <TabsTrigger value="cart">장바구니</TabsTrigger>
                                </TabsList>
                                <TabsContent value="wishlist">Make changes to your account here.</TabsContent>
                                <TabsContent value="cart">
                                    <Suspense>
                                        <Carousel className="w-full"
                                            opts={{
                                                align: 'start',
                                                dragFree: true
                                            }}
                                            plugins={
                                                []
                                            }>
                                            <CarouselContent className="ml-3 mr-6">
                                                {Object.entries(booths).map(([boothId, booth]) => (
                                                    <CarouselItem key={boothId} className="basis-auto pl-3">
                                                        <Card className="w-[290px] h-[100%] flex flex-col">
                                                            <CardHeader>
                                                                <CardTitle className="break-words overflow-hidden text-ellipsis font-bold">
                                                                    {booth.boothLocation}
                                                                </CardTitle>
                                                                <CardDescription className="text-md text-foreground">
                                                                    {booth.boothName}
                                                                </CardDescription>
                                                                <Separator />
                                                            </CardHeader>
                                                            <CardContent className="flex flex-col gap-4">
                                                                {booth.products.map(product => (
                                                                    <div key={product.productId}>
                                                                        <Label className="text-md text-muted-foreground">
                                                                            {product.productName}
                                                                        </Label>
                                                                        {product.options.map(option => (
                                                                            <div key={option.optionId} className="flex justify-between mb-2">
                                                                                <div className="flex flex-col">
                                                                                    <Label className="text-lg font-bold">
                                                                                        {option.optionName}
                                                                                    </Label>
                                                                                    <Label className="text-muted-foreground text-sm">
                                                                                        {option.price.toLocaleString()}원
                                                                                    </Label>
                                                                                </div>
                                                                                <div className="flex justify-end items-center">
                                                                                    <Button variant="secondary" className="w-8 h-8 p-0" onClick={() => handleQuantityChange(product.productId, option.optionId, option.quantity, false)}>
                                                                                        <Minus className="h-4 w-4 m-0 p-0" />
                                                                                    </Button>
                                                                                    <Label className="mx-3 text-md">
                                                                                        {option.quantity}
                                                                                    </Label>
                                                                                    <Button variant="secondary" className="w-8 h-8 p-0" onClick={() => handleQuantityChange(product.productId, option.optionId, option.quantity, true)}>
                                                                                        <Plus className="h-4 w-4 m-0 p-0" />
                                                                                    </Button>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ))}
                                                            </CardContent>
                                                            <CardFooter className="flex items-center overflow-x-auto mt-auto">
                                                                <Button className="w-full">수령 완료</Button>
                                                            </CardFooter>
                                                        </Card>
                                                    </CarouselItem>
                                                ))}
                                            </CarouselContent>
                                            <CarouselPrevious className="ml-16 w-10 h-10" />
                                            <CarouselNext className="mr-16 w-10 h-10" />

                                        </Carousel>
                                    </Suspense>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </CardContent>
            </Card >
        </>
    );
}

