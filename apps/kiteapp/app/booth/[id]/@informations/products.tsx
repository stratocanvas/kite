"use client";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
} from "@/components/ui/card";
import {
	motion,
	AnimatePresence,
} from "framer-motion";
import { Label } from "@/components/ui/label";
import * as React from "react";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
} from "@/components/ui/carousel";
import OptionImage from "./option-image";
import {
	List,
	Minus,
	Plus,
	ShoppingBag,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import FlipNumbers from "react-flip-numbers";
import { Badge } from "@/components/ui/badge";
import AnimatedButton from "@/components/animated-button";

interface Product {
	_id: string;
	name: string;
	artist?: {
		_id: string;
		name: string;
	}[];
	category: {
		_id: string;
		name: string;
	}[];
	option: Option[];
}

interface Option {
	_id: string;
	name: string;
	image?: string;
	price?: number;
	type?: string;
	character?: {
		_id: string;
		name: string;
	}[];
}

interface Booth {
	product: Product[];
}

interface QuantityControlProps {
	itemId: string;
	quantity: number;
	updateQuantity: (id: string, change: number) => void;
}

export default function BoothProducts({ data }: { data: Booth }) {
	const product = data?.product;

	return (
		<>
			{product && product.length > 0 && (
				<Card
					className="w-[100vw] xl:w-[37vw] h-[100%] flex flex-col border-none shadow-none"
					id="goods"
				>
					<CardContent className="flex-grow mt-6 flex items-center overflow-x-auto">
						<Label className="text-xl font-bold">굿즈</Label>
					</CardContent>
					<CardContent className="-mt-2 pl-0 pr-0 overflow-x-auto">
						<Carousel
							className="w-full"
							opts={{
								align: "start",
								dragFree: true,
							}}
						>
							<CarouselContent className="ml-3 mr-6">
								{product?.map((item) => (
									<ProductItem key={item._id} product={item} />
								))}
							</CarouselContent>
						</Carousel>
					</CardContent>
				</Card>
			)}
		</>
	);
}

const ProductItem = ({ product }: { product: Product }) => {
	const [imageUrl, setImageUrl] = React.useState("");
	const [optionOpen, setOptionOpen] = React.useState(false);
	return (
		<CarouselItem key={product._id} className="basis-auto pl-3">
			<Card className="w-[290px] h-[100%] flex flex-col">
				<OptionImage initial={product.option[0].image} src={imageUrl} />
				<div className="h-48">
					<AnimatePresence mode="wait">
						{optionOpen ? (
							<OptionContent
								key="option"
								data={product}
								onImageChange={setImageUrl}
							/>
						) : (
							<ProductSummary key="summary" data={product} />
						)}
					</AnimatePresence>
				</div>
				<CardFooter className="flex items-center overflow-x-auto mt-auto">
					{product.option.length > 1 ? (
						<AnimatedButton
							variant={optionOpen ? "secondary" : "default"}
							className="w-full"
							onClick={() => setOptionOpen(!optionOpen)}
						>
							{optionOpen ? (
								<>닫기</>
							) : (
								<>
									<List className="h-4 w-4 mr-2" />
									옵션 선택
								</>
							)}
						</AnimatedButton>
					) : (
						<AnimatedButton variant="default" className="w-full">
							<ShoppingBag className="h-4 w-4 mr-2" />
							장바구니에 담기
						</AnimatedButton>
					)}
				</CardFooter>
			</Card>
		</CarouselItem>
	);
};

/**
 * 굿즈의 신상품/복각 여부를 표시합니다.
 * @param data: 굿즈 정보
 * @returns
 */
const NewRerunBadge = ({ data }: { data: Option | Option[] }) => {
	const options = Array.isArray(data) ? data : [data];
	const types = options.map((opt) => opt.type);

	const renderBadge = (type: string, label: string, color: string) =>
		types.includes(type) && (
			<Badge
				key={type}
				className={`text-white bg-${color}-500 hover:bg-${color}-500/90 mr-1`}
			>
				{label}
			</Badge>
		);

	const renderText = (type: string, label: string, color: string) =>
		types.includes(type) && (
			<span
				key={type}
				className={`text-${color}-600 dark:text-${color}-400 mr-1`}
			>
				{label}
			</span>
		);

	const badges = [
		renderBadge("new", "신간", "blue"),
		renderBadge("rerun", "복각", "orange"),
	];

	const texts = [
		renderText("new", "신간", "blue"),
		renderText("rerun", "복각", "orange"),
	];

	return Array.isArray(data) ? (
		<div className="flex items-center">{badges}</div>
	) : (
		<span>{texts}</span>
	);
};

const ProductSummary = ({ data }: { data: Product }) => {
	return (
		<>
			<motion.div
				key="header"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				transition={{ duration: 0.2 }}
			>
				<CardHeader>
					<NewRerunBadge data={data.option} />
					<CardDescription>
						{data.artist && data.artist.length > 2
							? `${data.artist[0]?.name}, ${data.artist[1]?.name} 외 ${
									data.artist.length - 2
							  }명`
							: data.artist?.map((artist) => artist?.name).join(", ")}
					</CardDescription>
					<CardTitle className="break-words overflow-hidden text-ellipsis">
						{data.name}
					</CardTitle>
					<p>
						{data.option.length > 1
							? `${data.option.length}개 옵션`
							: `${data.option[0].price?.toLocaleString()}원`}
					</p>
				</CardHeader>
			</motion.div>
		</>
	);
};

const OptionContent = ({
	data,
	onImageChange,
}: {
	data: Product;
	onImageChange: (url: string) => void;
}) => {
	const optionVariants = {
		hidden: { opacity: 0, y: 20, scale: 0.9, rotateX: -15 },
		visible: (i: number) => ({
			opacity: 1,
			y: 0,
			scale: 1,
			rotateX: 0,
			transition: {
				type: "spring",
				stiffness: 100,
				damping: 12,
				delay: i * 0.1,
				duration: 0.3,
			},
		}),
		exit: (i: number) => ({
			opacity: 0,
			y: 20,
			scale: 0.95,
			rotateX: 10,
			transition: {
				type: "spring",
				delay: (data.option.length - 1 - i) * 0.05, // 여기를 수정했습니다
				duration: 0.2,
			},
		}),
	};
	const [quantities, setQuantities] = React.useState<{ [key: string]: number }>(
		Object.fromEntries(data.option.map((item) => [item._id, 0])),
	);
	const updateQuantity = (id: string, change: number) => {
		setQuantities((prev) => ({
			...prev,
			[id]: Math.max(0, (prev[id] || 0) + change),
		}));
	};

	return (
		<motion.div
			key="options"
			initial="hidden"
			animate="visible"
			exit="exit"
			variants={{
				visible: { opacity: 1 },
				hidden: { opacity: 0 },
				exit: { opacity: 0 },
			}}
			transition={{ duration: 0.2 }}
			className="h-full"
		>
			<ScrollArea className="h-full p-2">
				<div className="flex flex-col gap-1">
					{data.option.map((item, index) => (
						<motion.div
							key={item._id}
							custom={index}
							variants={optionVariants}
							initial="hidden"
							animate="visible"
							exit="exit"
							whileTap={{ scale: 0.95 }}
							onClick={() => {
								onImageChange(item?.image || "");
							}}
						>
							<div className="justify-between p-1 h-auto w-full rounded-md hover:bg-muted">
								<div className="flex gap-2 items-center w-full">
									<Avatar>
										<AvatarImage
											src={item.image?.replace(/(\.[^.]+)$/, "-p$1")}
										/>
										<AvatarFallback>{item.name[0]}</AvatarFallback>
									</Avatar>
									<div className="flex flex-col text-start py-1 flex-grow min-w-0">
										<div className="text-sm font-medium break-all whitespace-normal overflow-wrap-anywhere">
											{item.name}
										</div>
										<div className="text-sm text-muted-foreground flex flex-row gap-1">
											{item.price
												? `${item.price.toLocaleString()}원`
												: "가격 미정"}
											<NewRerunBadge data={item} />
										</div>
									</div>
									<QuantityControl
										itemId={item._id}
										quantity={quantities[item._id]}
										updateQuantity={updateQuantity}
									/>
								</div>
							</div>
						</motion.div>
					))}
				</div>
			</ScrollArea>
		</motion.div>
	);
};

const QuantityControl = ({
	itemId,
	quantity,
	updateQuantity,
}: QuantityControlProps) => {
	return (
		<div
			className="flex justify-end items-center"
			onPointerDownCapture={(e) => {
				e.stopPropagation();
			}}
		>
			<AnimatePresence>
				{quantity > 0 && (
					<motion.div
						initial={{ scale: 0.8, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0.8, opacity: 0 }}
						transition={{
							type: "spring",
							stiffness: 500,
							damping: 25,
							duration: 0.3,
						}}
						className="flex items-center"
					>
						<div className="w-8">
							<AnimatedButton
								size="icon"
								className="w-8 h-8 p-0 bg-zinc-200/80 hover:bg-zinc-200/70 dark:bg-zinc-700/80 dark:hover:bg-zinc-700/70"
								variant="secondary"
								onClick={(e) => {
									e.stopPropagation();
									updateQuantity(itemId, -1);
								}}
							>
								<Minus className="h-4 w-4" />
							</AnimatedButton>
						</div>
						<Label className="w-8 text-center">
							<FlipNumbers
								height={13}
								width={10}
								color="currentColor"
								background="transparent"
								play
								perspective={100}
								numbers={`${quantity}`}
							/>
						</Label>
					</motion.div>
				)}
			</AnimatePresence>
			<AnimatedButton
				size="icon"
				className="tap-handle w-8 h-8 p-0 bg-zinc-200/80 hover:bg-zinc-200/70 dark:bg-zinc-700/80 dark:hover:bg-zinc-700/70"
				variant="secondary"
				onClick={(e) => {
					e.stopPropagation();
					updateQuantity(itemId, 1);
				}}
			>
				<Plus className="h-4 w-4" />
			</AnimatedButton>
		</div>
	);
};
