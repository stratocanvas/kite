import BoothProfile from "./@informations/profile";
import BoothDescription from "./@informations/description";
import BoothProducts from "./@informations/products";
import BoothPreorders from "./@informations/preorders";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { GetBooth } from "@/app/api/booth/fetch";
import type { Metadata, ResolvingMetadata } from "next";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import CartSummary from "./@informations/cart-summary";
type Props = {
	params: { id: string };
	searchParams: { [key: string]: string | string[] | undefined };
};
export const dynamicParams = true;

export async function generateMetadata(
	{ params, searchParams }: Props,
	parent: ResolvingMetadata,
): Promise<Metadata> {
	// read route params
	const id = params.id;
	console.log(
		"Rendering Booth page for ID:",
		params.id,
		"at:",
		new Date().toISOString(),
	);

	// fetch data
	const booth = await GetBooth(id);
	// optionally access and extend (rather than replace) parent metadata

	return {
		title: `${booth?.name} - ${booth?.exhibition.name}`,
		description: `${booth?.artist
			.slice(0, 3)
			.map((artist: { name: string }) => artist.name)
			.join(", ")} 작가님의 ${booth?.exhibition.name} ${
			booth?.date.length === 2
				? "양일"
				: new Date(booth?.date).toLocaleDateString("ko-KR", {
						weekday: "long",
						timeZone: "Asia/Seoul",
				  })
		} ${booth?.genre
			.slice(0, 3)
			.map((genre: { name: string }) => genre.name)
			.join(", ")} 부스 인포`,

		openGraph: {
			title: `${booth?.name}`,
			description: `${booth?.artist
				.slice(0, 3)
				.map((artist: { name: string }) => artist.name)
				.join(", ")} 작가님의 ${booth?.exhibition.name} ${
				booth?.date.length === 2
					? "양일"
					: new Date(booth?.date).toLocaleDateString("ko-KR", {
							weekday: "long",
							timeZone: "Asia/Seoul",
					  })
			} 부스 인포`,
			images: [`https://www.kitebooth.com/api/og/booth?id=${id}`],
			url: `https://www.kitebooth.com/booth/${id}`,
			type: "article",
			siteName: "Kite",
			locale: "ko_KR",
		},
	};
}

export default async function Booth({ params }: { params: { id: string } }) {
	const booth = await GetBooth(params.id);
	if (!booth) {
		notFound();
	}

	return (
		<>
			<Image
				src={`https://www.kitebooth.com/api/og/booth?id=${booth._id}`}
				alt={booth.name}
				width={1200}
				height={630}
				className="hidden object-cover"
			/>
			<div className="container m-0 p-0 pb-[160px] xl:pb-12 mx-auto">
				<div className="flex flex-col gap-4 justify-center relative xl:flex-row">
					<div className="xl:left-section p-0 m-0 w-full mx-auto relative rounded-lg">
						<BoothProfile
							data={booth}
							color={
								booth.thumbnail
									? `#${booth.thumbnail?.split("-c(")[1]?.split(")")[0]}`
									: "#797979"
							}
						/>
					</div>
					<ScrollArea className="xl:right-section xl:h-[94vh] p-0 m-0 w-full mx-auto">
						<div className="flex flex-col gap-4">
							<BoothDescription data={booth} />
							<BoothProducts data={booth} />
							<BoothPreorders params={params} />
						</div>
					</ScrollArea>
				</div>
				<div>
					<Suspense>
						<CartSummary boothId={params.id} />
					</Suspense>
				</div>
			</div>
		</>
	);
}
