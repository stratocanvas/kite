'use client'
import IndoorMap from "@/app/dashboard/map";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";

export default function EventMap({ searchParams }: { searchParams: { event: string } }) {
    const router = useRouter();
    return (
        <>
            <div className="flex flex-col gap-2">
                <div className="w-auto">
                    <Button
                        variant="ghost"
                        className="w-auto ml-4"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        행사
                    </Button>
                </div>
                <div className="h-full mx-4">
                    <Suspense>
                        <IndoorMap boothLocations={[]} />
                    </Suspense>
                </div>
            </div>
        </>
    )
}
