'use client'
import {
    Card,
    CardContent,
    CardTitle,
    CardDescription,
    CardFooter,
    CardHeader
} from "@/components/ui/card";
import { useMemo, useCallback, useState, useEffect, useRef, Suspense, memo, useLayoutEffect } from "react";
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
import { Minus, Plus, Trash } from "lucide-react";
import useSWR from 'swr';
import { GetCart, AddOrUpdateCart, DeleteCart, GetBookmarks } from './actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserStateContext } from "@/providers"
import * as React from "react"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
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
import { usePathname, useRouter, redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import IndoorMap from "./map"
import CountUp from 'react-countup'
import { Toaster } from "@/components/ui/toaster"
import { SquareArrowOutUpRight } from "lucide-react"
import Link from "next/link"

interface Event {
    value: string;
    label: string;
}

const MemoizedIndoorMap = memo(IndoorMap, (prevProps, nextProps) => {
    return prevProps.eventId === nextProps.eventId &&
        prevProps.boothLocations.length === nextProps.boothLocations.length &&
        prevProps.boothLocations.every((loc, index) => loc === nextProps.boothLocations[index]);
});
export default function Cart() {
    const { data: items, mutate } = useSWR('cart', GetCart, { revalidateOnMount: true, revalidateOnFocus: true, revalidateOnReconnect: true });
    const { data: wishlist } = useSWR('wishlist', () => GetBookmarks(), { revalidateOnMount: true, revalidateOnFocus: true, revalidateOnReconnect: true });

    const router = useRouter()
    const pathname = usePathname()

    const [open, setOpen] = useState(false);
    const [value, setValue] = useState("");
    const [events, setEvents] = useState<Event[]>([]);

    const { userData } = React.useContext(UserStateContext);

    useLayoutEffect(() => {
        if (userData === null) {
            const path = window.location.pathname + window.location.search;
            router.push(`/auth?next=${encodeURIComponent(path)}`);
        }
    }, [userData, router]);

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
                        date: item.date,
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
        const cartBoothLocations = Object.values(booths).reduce((acc: any[], booth: any) => {
            acc.push(...booth.boothLocationAll.map((location: string) => ({
                id: location,
                color: 'red',
                type: 'cart'
            })));
            return acc;
        }, []);

        const wishlistBoothLocations = wishlist?.reduce((acc: any[], item: any) => {
            if (item.booth?.event?.event_id === value) {
                acc.push(...item.booth.locations.map((location: string) => ({
                    id: location,
                    color: 'blue',
                    type: 'wishlist'
                })));
            }
            return acc;
        }, []) || [];

        return [...cartBoothLocations, ...wishlistBoothLocations];
    }, [booths, wishlist, value]);

    useEffect(() => {
        if (items && wishlist) {
            const uniqueEvents = Array.from(new Set([
                ...items.map(item => ({
                    value: item.eventId,
                    label: item.eventName
                })),
                ...wishlist.map(item => ({
                    value: item.booth?.event?.event_id ?? '',
                    label: item.booth?.event?.name ?? ''
                }))
            ].map(e => JSON.stringify(e)))).map(e => JSON.parse(e)).filter(e => e.value);
            setEvents(uniqueEvents);
            if (uniqueEvents.length > 0 && !value) {
                setValue(uniqueEvents[0].value);
            }
        }
    }, [items, wishlist, value]);

    // Get a new searchParams string by merging the current
    // searchParams with a provided key/value pair
    useEffect(() => {
        if (value) {
            const params = new URLSearchParams();
            params.set('event', value);
            const newUrl = `${window.location.pathname}?${params.toString()}`;
            router.replace(newUrl, undefined, { shallow: true });
        }
    }, [value, router]);

    //카운트(전체 부스)
    const prevTotalPrice = useRef(0);
    const totalPrice = useMemo(() => items?.reduce((acc, item) => item.eventId === value ? acc + (item.price * item.quantity) : acc, 0) || 0, [items, value]);
    useEffect(() => {
        const newPrevTotal = totalPrice;
        setTimeout(() => {
            prevTotalPrice.current = newPrevTotal;
        }, 100);
    }, [totalPrice]);

    const prevBoothPrices = useRef<{ [boothId: string]: number }>({});

    // 개별 부스에 대한 현재 가격 계산
    const boothPrices = useMemo(() => {
        return Object.entries(booths).reduce((acc, [boothId, booth]) => {
            acc[boothId] = booth.products.reduce((acc, product) =>
                acc + product.options.reduce((acc, option) => acc + (option.price * option.quantity), 0)
                , 0);
            return acc;
        }, {} as { [boothId: string]: number });
    }, [booths]);

    useEffect(() => {
        // 개별 부스에 대한 이전 가격 상태 업데이트
        for (const [boothId, price] of Object.entries(boothPrices)) {
            setTimeout(() => {
                prevBoothPrices.current[boothId] = price;
            }, 100);
        }
    }, [boothPrices]);

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
                                        <MemoizedIndoorMap boothLocations={allBoothLocations} />
                                    </Suspense>
                                </CardContent>
                            </Card>
                            <Tabs defaultValue="wishlist" className="w-full lg:w-1/2">
                                <TabsList className="w-[calc(100%-3rem)] mx-6">
                                    <TabsTrigger value="wishlist">위시리스트</TabsTrigger>
                                    <TabsTrigger value="cart">장바구니</TabsTrigger>
                                </TabsList>
                                <TabsContent value="wishlist">
                                    <TabsContent value="wishlist">
                                        {wishlist
                                            ?.filter((item) => item.booth?.event?.event_id === value)
                                            .map((item) => (
                                                <div key={item.booth_id}>
                                                    <Card className="mx-6 my-2">
                                                        <CardHeader>
                                                            <div className="flex justify-between items-center">
                                                                <CardTitle className="break-words overflow-hidden text-ellipsis font-bold">
                                                                    <div className="flex gap-2 items-center">
                                                                        {item.booth?.locations.length > 1 ? (
                                                                            <>
                                                                                {item.booth?.locations[0].replace(/\d+/g, '')}
                                                                                {item.booth?.locations[0].replace(/\D+/g, '')}

                                                                            </>
                                                                        ) : (
                                                                            item.booth?.locations[0]
                                                                        )}
                                                                        {item.booth?.date.some(date => [0, 6].includes(new Date(date).getDay())) && (
                                                                            <Badge variant="secondary">
                                                                                {item.booth?.date.length === 2 ? "양일" : new Date(item.booth?.date[0]).toLocaleDateString('ko-KR', { weekday: 'long' })}
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                </CardTitle>
                                                                <Button variant="secondary" size="icon" className="ml-2">
                                                                    <Link href={`/booth/${item.booth_id}`}>
                                                                        <SquareArrowOutUpRight />
                                                                    </Link>
                                                                </Button>
                                                            </div>
                                                            <CardDescription className="text-md text-foreground">
                                                                {item.booth?.name}
                                                            </CardDescription>
                                                        </CardHeader>
                                                        <CardContent>

                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            ))}
                                    </TabsContent>
                                </TabsContent>
                                <TabsContent value="cart">
                                    <Card className="w-[calc(100%-3rem)] mx-6">
                                        <CardContent className="flex flex-col gap-2">
                                            <Label className="mt-6 text-muted-foreground">장바구니 합계</Label>
                                            <Label className="text-3xl font-bold mt-1">
                                                <CountUp suffix="원" start={prevTotalPrice.current} end={totalPrice} duration={1} />
                                            </Label>
                                        </CardContent>
                                    </Card>
                                    <Suspense>
                                        <Carousel className="w-full mt-2"
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
                                                                    <div className="flex justify-between items-center">
                                                                        <div className="flex gap-2 items-center">
                                                                            {booth.boothLocation}
                                                                            {booth.date.some(date => [0, 6].includes(new Date(date).getDay())) && (
                                                                                <Badge variant="secondary">
                                                                                    {booth.date.length === 2 ? "양일" : new Date(booth.date[0]).toLocaleDateString('ko-KR', { weekday: 'long' })}
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                        <Button variant="secondary" size="icon" className="ml-2">
                                                                            <Link href={`/booth/${boothId}`}>
                                                                                <SquareArrowOutUpRight />
                                                                            </Link>
                                                                        </Button>
                                                                    </div>
                                                                </CardTitle>

                                                                <CardDescription className="text-lg text-foreground">
                                                                    <div>{booth.boothName}</div>
                                                                </CardDescription>
                                                                <div className="flex gap-1">
                                                                    <CardDescription className="text-md text-foreground">
                                                                        <CountUp
                                                                            start={prevBoothPrices.current[boothId] || 0}
                                                                            end={boothPrices[boothId]}
                                                                            duration={1}
                                                                            separator=","
                                                                            suffix="원"
                                                                        />

                                                                    </CardDescription>
                                                                    <Label className="text-muted-foreground text-md">
                                                                        {" - "}
                                                                        {booth.products.reduce((acc, product) =>
                                                                            acc + product.options.reduce((acc, option) => acc + option.quantity, 0)
                                                                            , 0)}개 항목
                                                                    </Label>
                                                                </div>
                                                                <Separator />
                                                            </CardHeader>
                                                            <CardContent className="flex flex-col gap-4">
                                                                {booth.products.sort((a, b) => a.productName.localeCompare(b.productName)).map(product => (
                                                                    <div key={product.productId}>
                                                                        <Label className="text-md text-muted-foreground">
                                                                            {product.productName}
                                                                        </Label>
                                                                        {product.options.sort((a, b) => a.optionName.localeCompare(b.optionName)).map(option => (
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
                                                                                        {option.quantity > 1 ? <Minus className="h-4 w-4 m-0 p-0" /> : <Trash className="h-4 w-4 m-0 p-0" />}
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
                                                            {/*
                                                            <CardFooter className="flex items-center overflow-x-auto mt-auto">
                                                                <Button className="w-full">수령 완료</Button>
                                                            </CardFooter>
                                                                        */}
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

