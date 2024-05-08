import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import * as React from "react"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { createClient } from '@/utils/supabase/server'
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
//export const revalidate = 0
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export async function GetPreorderData(boothId: string) {
    const supabase = createClient();
    const { data: preorder, error } = await supabase
        .from("preorder")
        .select(`id, title, type, 
                 date,
                 always,
                 url`)
        .eq("booth_id", boothId);
    return preorder;
}

export default async function BoothPreorders({ params }: { params: { id: string } }) {
    const preorder = await GetPreorderData(params.id);
    return (
        <>
            {preorder && preorder.length > 0 && (
                <Card key={preorder?.id} className="h-[100%] flex flex-col border-none shadow-none" id="goods">
                    <CardContent className="flex-grow mt-6 flex items-center overflow-x-auto">
                        <Label className="text-xl font-bold">구입 방법</Label>
                    </CardContent>
                    <CardContent className="-mt-2 pl-0 pr-0 overflow-x-auto">
                        <Carousel className="w-full"
                            opts={{
                                align: 'start',
                                dragFree: true
                            }}
                            plugins={
                                []
                            }>
                            <CarouselContent className="ml-3 mr-6">
                                {preorder?.map((preorder: any) => (
                                    <CarouselItem key={preorder.id} className="basis-auto pl-3">
                                        <Card
                                            className="w-[290px] h-[100%] flex flex-col"
                                        >
                                            <CardHeader>
                                                <div className="flex gap-2 items-center">
                                                    <CardTitle>
                                                        {preorder.title}
                                                    </CardTitle>
                                                    {(() => {
                                                        const { type, isEnding } = getPreorderStatus(preorder);
                                                        return (
                                                            <Badge variant={isEnding ? 'destructive' : 'secondary'}>
                                                                {type}
                                                                {isEnding ? ' 종료 임박' : ''}
                                                            </Badge>
                                                        );
                                                    })()}
                                                </div>
                                                <CardDescription className="text-md text-foreground">
                                                    {getPreorderStatus(preorder).status}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardFooter className="flex items-center overflow-x-auto mt-auto">
                                                <Link href={preorder.url}>
                                                    <Button>
                                                        {(() => {
                                                            if (preorder.url.startsWith('https://www.witchform.com')) {
                                                                return '윗치폼';
                                                            } if (
                                                                preorder.url.startsWith('https://forms.google.com') ||
                                                                preorder.url.startsWith('https://docs.google.com') ||
                                                                preorder.url.startsWith('https://forms.gle')
                                                            ) {
                                                                return 'Google Forms';
                                                            }
                                                            return '바로가기';

                                                        })()}
                                                        <ExternalLink className="ml-2 w-4 h-4" />
                                                    </Button>

                                                </Link>
                                            </CardFooter>
                                        </Card>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                        </Carousel>
                    </CardContent>
                </Card >
            )}
        </>
    );
}
const getPreorderStatus = (preorder: any) => {
    const now = new Date();
    const startDate = new Date(preorder.date[0]);
    const endDate = new Date(preorder.date[preorder.date.length - 1]);
    const isEnding = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60) <= 24;

    return {
        type: preorder.type === 'ship' ? '통판' : preorder.type === 'preorder' ? '선입금' : '수요조사',
        status: startDate > now ? `${formatDistanceToNow(startDate, { addSuffix: true, locale: ko })} 시작` :
                endDate > now ? `${formatDistanceToNow(endDate, { addSuffix: true, locale: ko })} 종료` : '종료',
        isEnding
    };
};