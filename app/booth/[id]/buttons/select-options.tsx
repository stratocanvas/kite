"use client";

import useOptionsStore from '@/store/options'; // 
import {
    ToggleGroup,
    ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { useEffect } from "react";

export default function SelectOptionsButton({ product, options }: { product: any, options: any }) {
    const { selectedOptions, selectOption } = useOptionsStore();
    const selectedOption = selectedOptions[product._id];
    const resetOptions = useOptionsStore((state) => state.resetOptions);

    useEffect(() => {
        // This function will be called when the component unmounts
        return () => {
            resetOptions();
        };
    }, [resetOptions]);

    return (
        <>
            <div className="flex flex-wrap gap-2 justify-start">
                <ToggleGroup variant="outline" type="single" className="flex flex-wrap gap-2 justify-start">
                    {options
                        .sort((a: any, b: any) => a._id - b._id)
                        .map((option: any) => (
                            <div key={option._id}>
                                <ToggleGroupItem
                                    value={option._id}
                                    onClick={() => selectOption(product, option)}
                                    className="text-left truncate"
                                >
                                    {option.name}
                                </ToggleGroupItem>
                            </div>
                        ))
                    }
                </ToggleGroup>
            </div>
        </>
    );
}