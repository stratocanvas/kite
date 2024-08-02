import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Link from "next/link";
import Image from "next/image";
import { Suspense, createElement } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { nanoid } from "nanoid";
import { z } from "zod";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import "./protect.css";



const contentSchema: z.ZodType<any> = z.lazy(() =>
	z.object({
		type: z.string(),
		attrs: z.record(z.any()).optional(),
		content: z.array(contentSchema).optional(),
		text: z.string().optional(),
	}),
);

type BlockProps = {
	type: string;
	data: z.infer<typeof contentSchema>;
};

export function Block({
	type,
	attrs,
	content,
	marks,
}: { type: string; attrs?: any; content?: any[]; marks?: any[] }) {
	const renderChildren = (content: any[]) => {
		return content.map((child) => {
			const { type, attrs, content, text, marks } = child;

			switch (type) {
				case "text":
					return (
						<span
							key={nanoid()}
							className={
								marks?.some((mark: any) => mark.type === "bold")
									? "font-bold text-foreground"
									: ""
							}
						>
							{text}
						</span>
					);
				case "horizontalRule":
					return <Separator className="my-2" />;
				case "image":
					return (
						<div
							className="no-right-click relative rounded-md flex gap-2 w-full h-auto my-2 lg:my-4 overflow-hidden"
							style={{
								backgroundColor: `#${attrs?.src.split("-c(")[1].split(")")[0]}`,
							}}
						>
							<Image
								className="rounded-md"
								loading="lazy"
								src={attrs?.src}
								alt=""
								width={1200}
								height={attrs?.src.split("-h(")[1].split(")")[0] || 1200}
								sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
								style={{
									userSelect: "none",
									WebkitUserSelect: "none",
									WebkitTouchCallout: "none",
									WebkitUserDrag: "none",
									KhtmlUserSelect: "none",
									MozUserSelect: "none",
									OUserSelect: "none",
									userDrag: "none",
								}}
							/>
						</div>
					);
				default:
					if (content) {
						return (
							<Block
								key={nanoid()}
								type={type}
								attrs={attrs}
								content={content}
								marks={marks}
							/>
						);
					}
					return null;
			}
		});
	};
	switch (type) {
		case "doc":
			return <div>{renderChildren(content || [])}</div>;
		case "heading":
			return (
				<h3 className="font-bold text-xl">{renderChildren(content || [])}</h3>
			);
		case "paragraph":
			return (
				<p className="text-base text-muted-foreground">
					{renderChildren(content || [])}
				</p>
			);
		case "bulletList":
			return (
				<ul className="list-disc pl-6 text-muted-foreground">
					{content?.map((item) => (
						<Block
							key={nanoid()}
							type={item.type}
							attrs={item.attrs}
							content={item.content}
							marks={item.marks}
						/>
					))}
				</ul>
			);
		case "orderedList":
			return (
				<ol
					start={attrs?.start}
					className="list-decimal pl-6 text-muted-foreground"
				>
					{content?.map((item) => (
						<Block
							key={nanoid()}
							type={item.type}
							attrs={item.attrs}
							content={item.content}
							marks={item.marks}
						/>
					))}
				</ol>
			);
		case "listItem":
			return <li>{renderChildren(content || [])}</li>;
		case "blockquote":
			return (
				<Alert className="bg-muted my-2 text-foreground">
					<AlertTitle className="text-foreground">
						{renderChildren(content || [])}
					</AlertTitle>
				</Alert>
			);
		default:
			return null;
	}
}

export default function BoothDescription({ data }: { data: any }) {
	const jsonData = data?.description;
	const renderJsonData = (json: string) => {
		if (!json) {
			return null;
		}
		try {
			const parsedData = JSON.parse(json);
			const { type, attrs, content } = parsedData;
			return (
				<Block key={nanoid()} type={type} attrs={attrs} content={content} />
			);
		} catch (error) {
			return null;
		}
	};

	return (
		<>
			<Card
				key={data?._id}
				className="h-[100%] flex flex-col border-none shadow-none"
			>
				<Suspense fallback={<Skeleton />}>
					{jsonData && jsonData !== "null" && (
						<>
							<CardContent className="flex-grow mt-6 xl:mt-0 flex items-center overflow-x-auto">
								<Label className="text-xl font-bold">소개</Label>
							</CardContent>
							<CardContent className="flex-grow -mt-2 flex items-center overflow-hidden">
								<div className="relative w-full h-full">
									{renderJsonData(jsonData)}
								</div>
							</CardContent>
						</>
					)}
				</Suspense>
				<Suspense fallback={<Skeleton />}>
					{data?.artist.length > 0 && (
						<>
							<CardContent className="flex-grow mt-6 flex items-center overflow-x-auto">
								<Label className="text-xl font-bold">작가</Label>
							</CardContent>
							<CardContent className="flex-grow -mt-2 px-0 flex overflow-x-hidden">
								<ScrollArea className="w-full whitespace-nowrap rounded-md overflow-y-hidden">
									<div className="flex flex-row items-start justify-start space-x-4 px-6">
										{data?.artist.map((artist: any) => (
											<div className="flex flex-col items-center justify-center" key={artist._id}>
												<Link href={`https://x.com/${artist?.sns_x}`}>
													<Avatar className="h-28 w-28 relative rounded-full overflow-hidden">
														{artist?.thumbnail && (
															<Image
																src={artist?.thumbnail || ""}
																alt=""
																fill
																sizes="(max-width: 768px) 50vw, (max-width: 1200px) 50vw, 33vw"
																style={{ objectFit: "cover" }}
																className="rounded-full"
															/>
														)}
														<AvatarFallback className="text-4xl text-muted-foreground">
															{artist.name[0]}
														</AvatarFallback>
													</Avatar>
												</Link>

												<Label className="mt-2 text-center w-16 break-words whitespace-normal max-h-12 overflow-y-hidden">
													{artist.name}
												</Label>
											</div>
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
	);
}
