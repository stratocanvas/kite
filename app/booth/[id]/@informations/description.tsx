import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Link from "next/link";
import Image from "next/image";
import { Suspense, createElement } from 'react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const contentSchema: z.ZodType<any> = z.lazy(() =>
    z.object({
        type: z.string(),
        attrs: z.record(z.any()).optional(),
        content: z.array(contentSchema).optional(),
        text: z.string().optional(),
    })
);

type BlockProps = {
    type: string;
    data: z.infer<typeof contentSchema>;
};

export function Block({ type, attrs, content, marks }: { type: string; attrs?: any; content?: any[]; marks?: any[] }) {
    const renderChildren = (content: any[]) => {
        return content.map((child) => {
            const { type, attrs, content, text, marks } = child;

            switch (type) {
                case 'text':
                    return <span key={nanoid()} className={marks?.some((mark: any) => mark.type === 'bold') ? 'font-bold text-foreground' : ''}>{text}</span>;
                case 'horizontalRule':
                    return <Separator className="my-2" />;
                case 'image':
                    return (
                        <div className="responsive flex gap-2 w-full h-auto my-2 lg:my-4 overflow-hidden">
                            <Image
                                className="object-cover rounded-md"
                                loading="lazy"
                                src={attrs?.src}
                                alt=""
                                width={1080}
                                height={1920}
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                        </div>

                    );
                default:
                    if (content) {
                        return <Block key={nanoid()} type={type} attrs={attrs} content={content} marks={marks} />;
                    }
                    return null;
            }
        });
    };
    switch (type) {
        case 'doc':
            return <div>{renderChildren(content || [])}</div>;
        case 'heading':
            return <h3 className="font-bold text-xl">{renderChildren(content || [])}</h3>;
        case 'paragraph':
            return <p className="text-base text-muted-foreground">{renderChildren(content || [])}</p>;
        case 'bulletList':
            return <ul className="list-disc pl-6 text-muted-foreground">{content?.map((item) => (
                <Block key={nanoid()} type={item.type} attrs={item.attrs} content={item.content} marks={item.marks} />
            ))}</ul>;
        case 'orderedList':
            return <ol start={attrs?.start} className="list-decimal pl-6 text-muted-foreground">{content?.map((item) => (
                <Block key={nanoid()} type={item.type} attrs={item.attrs} content={item.content} marks={item.marks} />
            ))}</ol>;
        case 'listItem':
            return <li>{renderChildren(content || [])}</li>;
        case 'blockquote':
            return (
                <Alert className="bg-muted my-2 text-foreground">
                    <AlertTitle className="text-foreground">{renderChildren(content || [])}</AlertTitle>
                </Alert>
            );
        default:
            return null;
    }
}

export default function BoothDescription({ data }: { data: any }) {
    const jsonbData = data?.article;
    const renderJsonbData = (jsonb: string) => {
        if (!jsonb) {
            return null;
        }
        try {
            const parsedData = JSON.parse(jsonb);
            const { type, attrs, content } = parsedData;
            return <Block key={nanoid()} type={type} attrs={attrs} content={content} />;
        } catch (error) {
            return null;
        }
    };

    return (
        <>
            <Card
                key={data?.booth_id}
                className="h-[100%] flex flex-col border-none shadow-none"
            >
                <Suspense fallback={<Skeleton />}>

                    {jsonbData && jsonbData !== "null" && (
                        <>
                            <CardContent className="flex-grow mt-6 flex items-center overflow-x-auto">
                                <Label className="text-xl font-bold">소개</Label>
                            </CardContent>
                            <CardContent className="flex-grow -mt-2 flex items-center overflow-hidden">
                                <div className="relative w-full h-full">
                                    {renderJsonbData(jsonbData)}
                                </div>
                            </CardContent>
                        </>
                    )}
                </Suspense>
                <Suspense fallback={<Skeleton />}>

                    {data?.author.length > 0 && (
                        <>
                            <CardContent className="flex-grow mt-6 flex items-center overflow-x-auto">
                                <Label className="text-xl font-bold">작가</Label>
                            </CardContent>
                            <CardContent className="flex-grow -mt-2 pl-0 pr-0 flex overflow-x-hidden">
                                <ScrollArea className="w-full whitespace-nowrap rounded-md overflow-y-hidden">
                                    <div className="flex flex-row items-start justify-start space-x-4 pl-6 pr-6">

                                        {data?.author.map((author: any) => (
                                            <Link href={`/author/${author.author_id}`} key={author.author_id}>

                                                <div
                                                    className="flex flex-col items-center justify-center"
                                                >
                                                    <Avatar className="h-28 w-28 relative rounded-full overflow-hidden">
                                                        <AvatarImage asChild>
                                                            <Image
                                                                src={author.thumbnail || ""}
                                                                alt={author?.name}
                                                                fill
                                                                style={{ objectFit: "cover" }}
                                                                className="rounded-full"
                                                            />
                                                        </AvatarImage>
                                                        <AvatarFallback className="text-4xl text-muted-foreground">
                                                            {author.name[0]}
                                                        </AvatarFallback>
                                                    </Avatar>

                                                    <Label className="mt-2 text-center w-16 break-words whitespace-normal max-h-12 overflow-y-hidden">
                                                        {author.name}
                                                    </Label>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                    <ScrollBar orientation="horizontal" />
                                </ScrollArea>
                            </CardContent>
                        </>
                    )}
                </Suspense>

            </Card>
        </>
    )
}
