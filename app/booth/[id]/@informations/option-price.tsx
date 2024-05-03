'use client'
import { Label } from "@/components/ui/label";
import useOptionsStore from '@/store/options'; 
export default function OptionPrice({ productId }: { productId: string }) {
    const { selectedOptions } = useOptionsStore();
    const selectedOption = selectedOptions[productId];

    return (
        <Label className="text-md mt-1">
            {selectedOption ? `${selectedOption.price.toLocaleString()} 원` : "선택된 옵션이 없습니다."}
        </Label>
    );
};