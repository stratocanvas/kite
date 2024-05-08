'use client'
import { Button } from "@/components/ui/button";
import useOptionsStore from '@/store/options';
import { mutate } from 'swr';
import { AddOrUpdateCart } from '../actions';
import { UserStateContext } from "@/providers"
import React from "react";
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation";
import { useContext } from "react";
export default function AddCart({ product, boothId }: { product: any, boothId: string }) {
    const { userData } = useContext(UserStateContext);
    const { toast } = useToast()
    const { selectedOptions } = useOptionsStore();
    const selectedOption = selectedOptions[product.product_id];
    const router = useRouter();

    const handleAddToCart = async () => {
        if (!userData) {
            toast({
                description: "로그인이 필요합니다.",
            })
            const path = window.location.pathname + window.location.search;
            router.push(`/auth?next=${encodeURIComponent(path)}`);
        }

        if (userData && selectedOption && boothId) {
            const optimisticItem = {
                product_id: product.product_id,
                option_id: selectedOption.option_id,
                quantity: 1,
                price: selectedOption.price,
                productName: product.name,
                optionName: selectedOption.name,
            };

            // Optimistic UI update
            await mutate(['getCart', boothId], async (currentItems: any[] | undefined) => {
                // Check if the item already exists in the cart
                const existingItemIndex = currentItems?.findIndex(item => item.option_id === selectedOption.option_id);

                let updatedItems;
                if (existingItemIndex !== -1 && currentItems) {
                    // If the item exists, update the quantity
                    const updatedItem = { ...currentItems[existingItemIndex], quantity: currentItems[existingItemIndex].quantity + 1 };
                    updatedItems = [...currentItems];
                    updatedItems[existingItemIndex] = updatedItem;
                } else {
                    // If the item does not exist, add it to the cart
                    updatedItems = currentItems ? [...currentItems, optimisticItem] : [optimisticItem];
                }

                try {
                    // Update the cart with the new item or updated quantity
                    await AddOrUpdateCart(product.product_id, selectedOption.option_id, updatedItems[existingItemIndex]?.quantity || 1);
                    return updatedItems;
                } catch (error) {
                    console.error("Failed to add to cart:", error);
                    throw error;
                }
            }, {
                optimisticData: currentItems => {
                    // Similar logic for optimistic update
                    const existingItemIndex = currentItems?.findIndex(item => item.option_id === selectedOption.option_id);
                    if (existingItemIndex !== -1 && currentItems) {
                        const updatedItem = { ...currentItems[existingItemIndex], quantity: currentItems[existingItemIndex].quantity + 1 };
                        const updatedItems = [...currentItems];
                        updatedItems[existingItemIndex] = updatedItem;
                        return updatedItems;
                    } else {
                        return currentItems ? [...currentItems, optimisticItem] : [optimisticItem];
                    }
                },
                rollbackOnError: true,
                revalidate: false
            });
        } else {
            console.error("boothId is undefined");
        }
    };

    return (
        <>
            {selectedOption ? (
                <Button type="button" className="w-full font-bold" onClick={handleAddToCart}>
                    장바구니에 담기
                </Button>
            ) : (
                <Button type="button" variant="secondary" className="w-full font-bold" onClick={handleAddToCart} disabled>
                    옵션을 선택해 주세요
                </Button>
            )}
        </>
    );
};

