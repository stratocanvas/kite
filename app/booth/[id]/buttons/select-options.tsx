"use client";

import useOptionsStore from '@/store/options'; // 
import {
    ToggleGroup,
    ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { useEffect } from "react";

export default function SelectOptionsButton({ product, options }: { product: any, options: any }) {
    const { selectedOptions, selectOption } = useOptionsStore();
    const selectedOption = selectedOptions[product.product_id];
    const resetOptions = useOptionsStore((state) => state.resetOptions);

    useEffect(() => {
        // This function will be called when the component unmounts
        return () => {
            resetOptions();
        };
    }, [resetOptions]);

    return (
        <>
            <div className="flex w-full gap-2">
                <ToggleGroup variant="outline" type="single">
                    {options.map((option: any) => (
                        <div key={option.option_id}>
                            <ToggleGroupItem value={option.option_id} onClick={() => selectOption(product, option)}>
                                {option.name}
                            </ToggleGroupItem>
                        </div>
                    ))}
                </ToggleGroup>

            </div>
        </>
    );
}