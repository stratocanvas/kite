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
import { ArrowDown, ArrowDownUp, ArrowUp, ArrowUpDown, Circle, Filter, HeartOff, MapPin, Minus, Plus, Tag, Trash } from "lucide-react";
import useSWR from 'swr';
import { GetCart, AddOrUpdateCart, DeleteCart, GetBookmarks } from '../api/auth/dashboard/actions';
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
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuRadioGroup,
    DropdownMenuLabel,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SetBookmarkTag, SetCartTag, SetBookmark } from "@/app/api/auth/dashboard/actions";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

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

    const { data: items, mutate } = useSWR('cart', () => GetCart(), { revalidateOnMount: true, revalidateOnFocus: true, revalidateOnReconnect: true });
    const { data: wishlist, mutate: wishlistMutate } = useSWR('wishlist', () => GetBookmarks(), { revalidateOnMount: true, revalidateOnFocus: true, revalidateOnReconnect: true });

    const router = useRouter()
    const pathname = usePathname()

    const [open, setOpen] = useState(false);
    const [value, setValue] = useState("");
    const [events, setEvents] = useState<Event[]>([]);

    const [sort, setSort] = useState("location-asc");
    const [sortTag, setSortTag] = useState("tag-asc");
    const [dayFilter, setDayFilter] = useState([]);

    const unsetWishlist = useCallback(async (boothId: string) => {
        const updatedWishlist = (wishlist || []).filter((item) => item.booth_id !== boothId);
        wishlistMutate(updatedWishlist, false); // 로컬 데이터를 업데이트
        try {
            const result = await SetBookmark(boothId, false);
            wishlistMutate(); // 서버에서 최신 데이터를 다시 가져옴
        } catch (error) {
            console.error("Error setting bookmark:", error);
            wishlistMutate(wishlist); // 오류 발생 시 원래 데이터로 되돌리기
        }
    }, [wishlist, wishlistMutate]);

    const changeBookmarkColor = useCallback(async (tag: number, boothId: string) => {
        const updatedWishlist = (wishlist || []).map((item) => item.booth_id === boothId ? { ...item, tag } : item);
        wishlistMutate(updatedWishlist, false); // 로컬 데이터를 업데이트
        try {
            const result = await SetBookmarkTag(tag, boothId);
            wishlistMutate(); // 서버에서 최신 데이터를 다시 가져옴
        } catch (error) {
            console.error("Error setting bookmark:", error);
            wishlistMutate(wishlist); // 오류 발생 시 원래 데이터로 되돌리기
        }
    }, [wishlist, wishlistMutate]);

    const changeCartColor = useCallback(async (tag: number, productId: number[]) => {
        const updatedCart = (items || []).map((item) => productId.includes(item.product_id) ? { ...item, tag } : item);
        mutate(updatedCart, false); // 로컬 데이터를 업데이트
        try {
            const result = await SetCartTag(tag, productId);
            mutate(); // 서버에서 최신 데이터를 다시 가져옴
        } catch (error) {
            console.error("Error setting cart:", error);
            mutate(items); // 오류 발생 시 원래 데이터로 되돌리기
        }
    }, [items, mutate]);


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
                        boothLocationAll: item.boothLocation,
                        tag: item.tag
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
        const cartBoothLocations = Object.values(booths)
            .filter(booth => dayFilter.length === 0 || dayFilter.every(day => booth.date.some(date => new Date(date).getDay() === day)))
            .reduce((acc: any[], booth: any) => {
                const tagColor = booth.tag === 0 ? 'rgb(255,59,48)' :
                    booth.tag === 1 ? 'rgb(255,204,0)' :
                        booth.tag === 2 ? 'rgb(52,199,89)' :
                            booth.tag === 3 ? 'rgb(0,122,255)' :
                                'rgb(175,82,222)';
                acc.push(...booth.boothLocationAll.map((location: string) => ({
                    id: location,
                    color: tagColor,
                    type: 'cart'
                })));
                return acc;
            }, []);

        const wishlistBoothLocations = wishlist?.reduce((acc: any[], item: any) => {
            if (item.booth?.event?.event_id === value &&
                (dayFilter.length === 0 || dayFilter.every(day => item.booth?.date.some(date => new Date(date).getDay() === day)))) {
                const tagColor = item.tag === 0 ? 'rgb(255,59,48)' :
                    item.tag === 1 ? 'rgb(255,204,0)' :
                        item.tag === 2 ? 'rgb(52,199,89)' :
                            item.tag === 3 ? 'rgb(0,122,255)' :
                                'rgb(175,82,222)';
                acc.push(...item.booth.locations.map((location: string) => ({
                    id: location,
                    color: tagColor,
                    type: 'wishlist'
                })));
            }
            return acc;
        }, []) || [];

        return [...cartBoothLocations, ...wishlistBoothLocations];
    }, [booths, wishlist, value, dayFilter]);

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
                                <div className="flex gap-2">
                                    <TabsList className="w-auto ml-6 flex-shrink-0">
                                        <TabsTrigger value="wishlist">위시리스트</TabsTrigger>
                                        <TabsTrigger value="cart">장바구니</TabsTrigger>
                                    </TabsList>
                                    <ScrollArea className="flex-grow whitespace-nowrap rounded-md mr-6">
                                        <div className="flex gap-2">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger >
                                                    <Button
                                                        variant="outline"
                                                        className="flex gap-2"

                                                    >
                                                        <Filter className="w-4 h-4" />
                                                        <p className="hidden md:block">필터</p>
                                                        {dayFilter.length > 0 && (
                                                            <Badge variant="secondary">
                                                                {dayFilter.length === 2 ? "양일" : dayFilter[0] === 6 ? "토" : "일"}
                                                            </Badge>
                                                        )}
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuLabel>요일</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuCheckboxItem onCheckedChange={(checked) => {
                                                        if (checked) {
                                                            setDayFilter([...dayFilter, 6]);
                                                        } else {
                                                            setDayFilter(dayFilter.filter((day) => day !== 6));
                                                        }
                                                    }} checked={dayFilter.includes(6)}>토요일</DropdownMenuCheckboxItem>
                                                    <DropdownMenuCheckboxItem onCheckedChange={(checked) => {
                                                        if (checked) {
                                                            setDayFilter([...dayFilter, 0]);
                                                        } else {
                                                            setDayFilter(dayFilter.filter((day) => day !== 0));
                                                        }
                                                    }} checked={dayFilter.includes(0)}>일요일</DropdownMenuCheckboxItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger>
                                                    <Button variant="outline" className="flex gap-2">
                                                        <ArrowUpDown className="w-4 h-4" />
                                                        <p className="hidden md:block">정렬</p>
                                                        <Badge variant="secondary" className="flex">
                                                            <MapPin className="w-4 h-4" />
                                                            {sort === 'location-asc' ?
                                                                (<ArrowUp className="w-4 h-4" />) :
                                                                (<ArrowDown className="w-4 h-4" />)}
                                                        </Badge>
                                                        <Badge variant="secondary" className="flex">
                                                            <Tag className="w-4 h-4" />
                                                            {sortTag === 'tag-asc' ?
                                                                (<ArrowUp className="w-4 h-4" />) :
                                                                (<ArrowDown className="w-4 h-4" />)}
                                                        </Badge>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
                                                        <DropdownMenuLabel className="flex justify-between w-full items-center">
                                                            <p>부스 위치</p>
                                                            <MapPin className="h-4 w-4" />
                                                        </DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuRadioItem value="location-asc">A-Z</DropdownMenuRadioItem>
                                                        <DropdownMenuRadioItem value="location-desc">Z-A</DropdownMenuRadioItem>
                                                    </DropdownMenuRadioGroup>
                                                    <DropdownMenuRadioGroup value={sortTag} onValueChange={setSortTag}>
                                                        <DropdownMenuLabel className="flex justify-between w-full items-center">
                                                            <p>태그</p>
                                                            <Tag className="h-4 w-4" />
                                                        </DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuRadioItem value="tag-asc">1-5</DropdownMenuRadioItem>
                                                        <DropdownMenuRadioItem value="tag-desc">5-1</DropdownMenuRadioItem>
                                                    </DropdownMenuRadioGroup>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        <ScrollBar orientation="horizontal" />
                                    </ScrollArea>
                                </div>
                                <TabsContent value="wishlist">
                                    {wishlist
                                        ?.filter((item) => item.booth?.event?.event_id === value)

                                        .filter((item) => dayFilter.length === 0 || dayFilter.every(day => item.booth?.date.some(date => new Date(date).getDay() === day)))
                                        .sort((a, b) => {
                                            const tagA = a.tag || 0;
                                            const tagB = b.tag || 0;
                                            const locA = a.booth?.locations[0] || '';
                                            const locB = b.booth?.locations[0] || '';

                                            if (sortTag === 'tag-asc' && sort === 'location-asc') {
                                                if (tagA !== tagB) {
                                                    return tagA - tagB;
                                                }
                                                return locA.localeCompare(locB);
                                            }
                                            if (sortTag === 'tag-asc' && sort === 'location-desc') {
                                                if (tagA !== tagB) {
                                                    return tagA - tagB;
                                                }
                                                return locB.localeCompare(locA);
                                            }
                                            if (sortTag === 'tag-desc' && sort === 'location-asc') {
                                                if (tagA !== tagB) {
                                                    return tagB - tagA;
                                                }
                                                return locA.localeCompare(locB);
                                            }
                                            if (sortTag === 'tag-desc' && sort === 'location-desc') {
                                                if (tagA !== tagB) {
                                                    return tagB - tagA;
                                                }
                                                return locB.localeCompare(locA);
                                            }
                                            return 0;
                                        })
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
                                                                        <Badge variant="secondary" className={item.booth?.date.length === 2 ? "" : new Date(item.booth?.date[0]).getDay() === 0 ? "bg-red-100 hover:bg-red-200 dark:bg-red-900 hover:dark:bg-red-800" : "bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 hover:dark:bg-blue-800"}>
                                                                            {item.booth?.date.length === 2 ? "양일" : new Date(item.booth?.date[0]).toLocaleDateString('ko-KR', { weekday: 'long' })}
                                                                        </Badge>
                                                                    )}

                                                                </div>
                                                            </CardTitle>
                                                            <div className="flex gap-2">

                                                                <DropdownMenu >
                                                                    <DropdownMenuTrigger>
                                                                        <Button size="icon" variant="outline" className="h-8 w-8">
                                                                            <div className={`w-full h-full rounded-md ${item.tag === 0 ? "bg-[#ff3b30]" : item.tag === 1 ? "bg-[#ffcc00]" : item.tag === 2 ? "bg-[#34c759]" : item.tag === 3 ? "bg-[#007bff]" : "bg-[#af52de]"}`} />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent className="w-full">
                                                                        <DropdownMenuRadioGroup value={item.tag.toString()} onValueChange={(tag) => changeBookmarkColor(Number(tag), item.booth_id)}>
                                                                            <DropdownMenuLabel>
                                                                                태그
                                                                            </DropdownMenuLabel>
                                                                            <DropdownMenuSeparator />
                                                                            <DropdownMenuRadioItem value={"0"} className="flex justify-between">
                                                                                <p>빨간색</p>
                                                                                <Badge className="h-4 bg-[#ff3b30] hover:bg-[#ff3b30]">1</Badge>
                                                                            </DropdownMenuRadioItem>
                                                                            <DropdownMenuRadioItem value={"1"} className="flex justify-between">
                                                                                <p>노란색</p>
                                                                                <Badge className="h-4 bg-[#ffcc00] hover:bg-[#ffcc00]">2</Badge>
                                                                            </DropdownMenuRadioItem>
                                                                            <DropdownMenuRadioItem value={"2"} className="flex justify-between">
                                                                                <p>초록색</p>
                                                                                <Badge className="h-4 bg-[#34c759] hover:bg-[#34c759]">3</Badge>
                                                                            </DropdownMenuRadioItem>
                                                                            <DropdownMenuRadioItem value={"3"} className="flex justify-between">
                                                                                <p>파란색</p>
                                                                                <Badge className="h-4 bg-[#007bff] hover:bg-[#007bff]">4</Badge>
                                                                            </DropdownMenuRadioItem>
                                                                            <DropdownMenuRadioItem value={"4"} className="flex justify-between">
                                                                                <p>보라색</p>
                                                                                <Badge className="h-4 bg-[#af52de] hover:bg-[#af52de]">5</Badge>
                                                                            </DropdownMenuRadioItem>
                                                                        </DropdownMenuRadioGroup>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                                <Button size="icon"
                                                                    variant="secondary"
                                                                    className="h-8 w-8"
                                                                    onClick={() => {
                                                                        unsetWishlist(item.booth_id);
                                                                    }}>
                                                                    <HeartOff className="h-5 w-5" />
                                                                </Button>
                                                                <Button variant="secondary" size="icon" className="h-8 w-8">
                                                                    <Link href={`/booth/${item.booth_id}`}>
                                                                        <SquareArrowOutUpRight className="h-5 w-5" />
                                                                    </Link>
                                                                </Button>
                                                            </div>
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
                                                {Object.entries(booths)
                                                    .filter(([boothId, booth]) => dayFilter.length === 0 || dayFilter.every(day => booth.date.some(date => new Date(date).getDay() === day)))
                                                    .sort(([boothIdA, boothA], [boothIdB, boothB]) => {
                                                        const locA = boothA.boothLocation || '';
                                                        const locB = boothB.boothLocation || '';
                                                        const tagA = boothA.tag || 0;
                                                        const tagB = boothB.tag || 0;

                                                        if (sortTag === 'tag-asc' && sort === 'location-asc') {
                                                            if (tagA !== tagB) {
                                                                return tagA - tagB;
                                                            }
                                                            return locA.localeCompare(locB);
                                                        }
                                                        if (sortTag === 'tag-asc' && sort === 'location-desc') {
                                                            if (tagA !== tagB) {
                                                                return tagA - tagB;
                                                            }
                                                            return locB.localeCompare(locA);
                                                        }
                                                        if (sortTag === 'tag-desc' && sort === 'location-asc') {
                                                            if (tagA !== tagB) {
                                                                return tagB - tagA;
                                                            }
                                                            return locA.localeCompare(locB);
                                                        }
                                                        if (sortTag === 'tag-desc' && sort === 'location-desc') {
                                                            if (tagA !== tagB) {
                                                                return tagB - tagA;
                                                            }
                                                            return locB.localeCompare(locA);
                                                        }
                                                        return 0;
                                                    })
                                                    .map(([boothId, booth]) => (
                                                        <CarouselItem key={boothId} className="basis-auto pl-3">
                                                            <Card className="w-[290px] h-[100%] flex flex-col">
                                                                <CardHeader>
                                                                    <CardTitle className="break-words overflow-hidden text-ellipsis font-bold">
                                                                        <div className="flex justify-between items-center">
                                                                            <div className="flex gap-2 items-center">
                                                                                {booth.boothLocation}
                                                                                {booth.date.some(date => [0, 6].includes(new Date(date).getDay())) && (
                                                                                    <Badge variant="secondary" className={booth.date.length === 2 ? "" : new Date(booth.date[0]).getDay() === 0 ? "bg-red-100 hover:bg-red-200 dark:bg-red-900 hover:dark:bg-red-800" : "bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 hover:dark:bg-blue-700"}>
                                                                                        {booth.date.length === 2 ? "양일" : new Date(booth.date[0]).toLocaleDateString('ko-KR', { weekday: 'long' })}
                                                                                    </Badge>
                                                                                )}
                                                                            </div>
                                                                            <div className="flex gap-2">
                                                                                <DropdownMenu>
                                                                                    <DropdownMenuTrigger>
                                                                                        <Button size="icon" variant="outline" className="h-8 w-8 rounded-full">
                                                                                            <div className={`w-full h-full rounded-md ${booth.tag === 0 ? "bg-[#ff3b30]" : booth.tag === 1 ? "bg-[#ffcc00]" : booth.tag === 2 ? "bg-[#34c759]" : booth.tag === 3 ? "bg-[#007bff]" : "bg-[#af52de]"}`} />
                                                                                        </Button>
                                                                                    </DropdownMenuTrigger>
                                                                                    <DropdownMenuContent>
                                                                                        <DropdownMenuRadioGroup value={booth.tag.toString()} onValueChange={(tag) => changeCartColor(Number(tag), booth.products.map((item) => item.productId))}>
                                                                                            <DropdownMenuLabel>
                                                                                                태그
                                                                                            </DropdownMenuLabel>
                                                                                            <DropdownMenuSeparator />
                                                                                            <DropdownMenuRadioItem value={"0"} className="flex justify-between">
                                                                                                <p>빨간색</p>
                                                                                                <Badge className="h-4 bg-[#ff3b30] hover:bg-[#ff3b30]">1</Badge>
                                                                                            </DropdownMenuRadioItem>
                                                                                            <DropdownMenuRadioItem value={"1"} className="flex justify-between">
                                                                                                <p>노란색</p>
                                                                                                <Badge className="h-4 bg-[#ffcc00] hover:bg-[#ffcc00]">2</Badge>
                                                                                            </DropdownMenuRadioItem>
                                                                                            <DropdownMenuRadioItem value={"2"} className="flex justify-between">
                                                                                                <p>초록색</p>
                                                                                                <Badge className="h-4 bg-[#34c759] hover:bg-[#34c759]">3</Badge>
                                                                                            </DropdownMenuRadioItem>
                                                                                            <DropdownMenuRadioItem value={"3"} className="flex justify-between">
                                                                                                <p>파란색</p>
                                                                                                <Badge className="h-4 bg-[#007bff] hover:bg-[#007bff]">4</Badge>
                                                                                            </DropdownMenuRadioItem>
                                                                                            <DropdownMenuRadioItem value={"4"} className="flex justify-between">
                                                                                                <p>보라색</p>
                                                                                                <Badge className="h-4 bg-[#af52de] hover:bg-[#af52de]">5</Badge>
                                                                                            </DropdownMenuRadioItem>
                                                                                        </DropdownMenuRadioGroup>
                                                                                    </DropdownMenuContent>
                                                                                </DropdownMenu>
                                                                                <Button variant="secondary" size="icon" className="h-8 w-8">
                                                                                    <Link href={`/booth/${boothId}`}>
                                                                                        <SquareArrowOutUpRight className="h-5 w-5" />
                                                                                    </Link>
                                                                                </Button>
                                                                            </div>
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
                                                                                            {option.price ? `${option.price.toLocaleString()} 원` : "가격 미정"}
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

