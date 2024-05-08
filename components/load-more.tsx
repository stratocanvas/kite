'use client'
import useSWRInfinite from 'swr/infinite';
import SearchResult from '../app/booth/fetch';

import { Loader2 } from 'lucide-react';
import BoothCard from '@/components/booth-card';
import { useEffect, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';


export default function MoreBooth({ initialBoothIds, searchParams }: { initialBoothIds: string[], searchParams: any }) {
    const getKey = (pageIndex: number, previousPageData: { booth: any[] } | null) => {
        if (previousPageData && !previousPageData.booth.length) return null;
        return { searchParams, page: pageIndex + 1, limit: 5 };
    };

    const fetcher = (params) => SearchResult(params);

    const { data, size, setSize } = useSWRInfinite(getKey, fetcher, {
        initialData: [{ booth: initialBoothIds.map(id => ({ booth_id: id })) }],
    });

    const booth = data ? data.flatMap((item) => item.booth) : [];

    const filteredBooth = useMemo(() => {
        return booth.filter((booth) => !initialBoothIds.includes(booth.booth_id));
    }, [booth, initialBoothIds]);



    const { ref: buttonRef, inView: buttonInView } = useInView({
        threshold: 0,
    });

    useEffect(() => {
        if (buttonInView) {
            setSize((prev) => prev + 1);
        }
    }, [buttonInView, setSize]);

    const isLoading = data && typeof data[size - 1] === "undefined";
    const isReachingEnd = data && data[data.length - 1]?.booth?.length === 0;

    return data ? (
        <>
            {filteredBooth?.map((booth) => (
                <div key={booth.booth_id}>
                    <BoothCard booth={booth} displayEvent />
                </div>
            ))}
            {!isReachingEnd && (
                <div ref={buttonRef}>
                    {isLoading ? (
                        <div className='flex justify-center items-center h-full'>
                            <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                    ) : (
                        <></>
                    )}
                </div>
            )}
            {isReachingEnd && <div className='text-center lg:hidden'>마지막 항목입니다</div>}
        </>
    ) : null;
}