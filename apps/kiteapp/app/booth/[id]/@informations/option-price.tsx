'use client'
import { Label } from "@/components/ui/label";
import useOptionsStore from '@/store/options'; 
export default function OptionPrice({ productId }: { productId: string }) {
    const { selectedOptions } = useOptionsStore();
    const selectedOption = selectedOptions[productId];

    return (
        <Label className="text-md mt-1">
            {selectedOption ? (
                selectedOption.price ? (
                    selectedOption.price === 0 ? "무료" : `${selectedOption.price.toLocaleString()} 원`
                ) : "가격 미정"
            ) : "선택된 옵션이 없습니다."}
        </Label>
    );
};