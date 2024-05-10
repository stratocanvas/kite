'use client'
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Plus, Minus, X, Trash } from "lucide-react";
import useSWR, { mutate } from 'swr';
import { AddCart, DeleteCart, GetCart, AddOrUpdateCart } from '../../../api/buttons/actions';
import CountUp from 'react-countup'

// Props 타입 정의
interface CartSummaryProps {
    boothId: string;
}

// 아이템 타입 정의
interface Item {
    product_id: string;
    option_id: string;
    quantity: number;
    price: number;
    productName: string;
    optionName?: string; // 옵션이 있을 수도 있고 없을 수도 있음
}

// 그룹화된 아이템 타입 정의
interface GroupedItems {
    [key: string]: {
        productName: string;
        options: Item[];
    };
}

export default function CartSummary({ boothId }: CartSummaryProps) {
    const { data: items, mutate } = useSWR<Item[]>(boothId ? ['getCart', boothId] : null, () => GetCart(boothId));

    const handleQuantityChange = async (item: Item, isIncrease: boolean) => {
        const newQuantity = isIncrease ? item.quantity + 1 : item.quantity - 1;
        const updatedItem = { ...item, quantity: newQuantity };


        mutate(async (currentItems) => {
            const optimisticItems = currentItems?.map(ci => ci.product_id === item.product_id && ci.option_id === item.option_id ? updatedItem : ci).filter(ci => ci.quantity > 0) || [];

            try {
                newQuantity > 0 ? await AddOrUpdateCart(item.product_id, item.option_id, newQuantity) : await DeleteCart(item.product_id, item.option_id);
                return optimisticItems;
            } catch (error) {
                console.error("Failed to update cart:", error);
                throw error;
            }
        }, {
            optimisticData: (currentItems) => currentItems?.map(ci => ci.product_id === item.product_id && ci.option_id === item.option_id ? updatedItem : ci).filter(ci => ci.quantity > 0) || [],
            rollbackOnError: true,
            revalidate: false
        });
    };

    const groupedItems = useMemo<GroupedItems>(() => items?.reduce((acc: GroupedItems, item: Item) => {
        if (!acc[item.product_id]) acc[item.product_id] = { productName: item.productName, options: [] };
        acc[item.product_id].options.push(item);
        return acc;
    }, {}) || {}, [items]);

    const totalPrice = useMemo(() => items?.reduce((acc, item) => acc + (item.price * item.quantity), 0) || 0, [items]);
    const totalItems = useMemo(() => items?.reduce((acc, item) => acc + item.quantity, 0) || 0, [items]);
    const [isOpen, setIsOpen] = useState(false);
    const prevTotalPrice = useRef(0);

    useEffect(() => {
        prevTotalPrice.current = totalPrice;
    }, [totalPrice]);

    return (
        <>
            {totalItems > 0 && (
                <>
                    {isOpen ? (
                        <Card className='z-50 backdrop-blur bg-white/80 dark:bg-neutral-800/80 border-none shadow-[0_20px_50px_rgba(0,0,0,0.2)] w-full h-full md:h-auto md:w-[310px] fixed bottom-0 md:bottom-10 left-1/2 -translate-x-1/2'>
                            <CardHeader>
                                <div className="flex justify-between">
                                    <CardDescription>이 부스에서 담은 굿즈</CardDescription>
                                    <Button onClick={() => setIsOpen(false)} size="icon" variant="ghost" className="h-6 w-6 rounded-full backdrop-blur bg-black/30 dark:bg-white/30 hover:bg-black/20 dark:hover:bg-white/20">
                                        <X className="text-white h-4 w-4" />
                                    </Button>
                                </div>
                                <CardTitle className="text-3xl">
                                    <CountUp suffix="원" start={prevTotalPrice.current} end={totalPrice} duration={1} />
                                </CardTitle>
                                <CardDescription className="pb-2">{totalItems}개 항목</CardDescription>
                                <Separator />
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4">
                                {Object.entries(groupedItems).map(([productId, group]) => (
                                    <div key={productId}>
                                        {/* Optionally render a product title or separator here */}
                                        <div className='mb-1'>
                                            <Label className="text-md text-muted-foreground">
                                                {group.productName}
                                            </Label>
                                        </div>
                                        {group.options.map((item) => (
                                            <div key={item.option_id} className="flex justify-between mb-2">
                                                <div className="flex flex-col ">
                                                    <Label className="text-lg font-bold">
                                                        {item.optionName} {/* 옵션 이름 표시 */}
                                                    </Label>
                                                    <Label className="text-muted-foreground text-sm">
                                                        {item.price.toLocaleString()}원
                                                    </Label>
                                                </div>
                                                <div className="flex justify-end items-center">
                                                    <Button
                                                        variant="secondary"
                                                        className="w-8 h-8 p-0"
                                                        onClick={() => {
                                                            handleQuantityChange(item, false);
                                                            if (totalItems === 1) {
                                                                setIsOpen(false);
                                                            }
                                                        }}
                                                    >
                                                        {item.quantity === 1 ? (
                                                            <Trash className="h-4 w-4 m-0 p-0" />
                                                        ) : (
                                                            <Minus className="h-4 w-4 m-0 p-0" />
                                                        )}
                                                    </Button>
                                                    <Label className="mx-3 text-md">
                                                        {item.quantity}
                                                    </Label>
                                                    <Button variant="secondary" className="w-8 h-8 p-0" onClick={() => handleQuantityChange(item, true)}>
                                                        <Plus className="h-4 w-4 m-0 p-0" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className='backdrop-blur bg-white/80 dark:bg-neutral-800/80 border-none shadow-[0_20px_50px_rgba(0,0,0,0.2)] h-auto w-[310px] fixed bottom-10 left-1/2 -translate-x-1/2'>
                            <CardHeader>
                                <div className="flex justify-between">
                                    <CardDescription>이 부스에서 담은 굿즈 {totalItems}개</CardDescription>
                                </div>
                                <div className='flex justify-between gap-2'>
                                    <CardTitle className="text-3xl">
                                        <CountUp suffix="원" start={prevTotalPrice.current} end={totalPrice} duration={1} />
                                    </CardTitle>
                                    <Button onClick={() => setIsOpen(true)} variant="secondary">
                                        자세히
                                    </Button>
                                </div>
                            </CardHeader>
                        </Card>
                    )}
                </>
            )}
        </>
    );
}

