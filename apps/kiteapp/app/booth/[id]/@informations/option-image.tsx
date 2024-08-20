"use client";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function OptionImage({
	initial,
	src,
}: {
	initial?: string;
	src?: string;
}) {
	const imageSource = src || initial;

	return (
		<AspectRatio
			className="rounded-t-md"
			ratio={1 / 1}
			style={{
				backgroundColor: imageSource
					? `#${imageSource.split("-c(")[1]?.split(")")[0]}`
					: "transparent",
			}}
		>
			{imageSource ? (
				<>
					<Image
						src={imageSource}
						alt="Image"
						fill
						className="rounded-t-md object-cover no-right-click"
						loading="lazy"
					/>
					
				</>
			) : (
				<div className="rounded-t-md bg-muted flex justify-center items-center w-full h-full">
					<ImageOff className="text-muted-foreground" />
				</div>
			)}
		</AspectRatio>
	);
}
