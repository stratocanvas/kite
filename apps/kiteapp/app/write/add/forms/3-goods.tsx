"use client";
import { useFormContext, useFieldArray } from "react-hook-form";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
} from "@/components/ui/carousel";
import ComboBox from "@/components/combobox/combobox";
import { Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import FileUpload from "@/components/ui/file-upload";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NumericFormat, removeNumericFormat } from "react-number-format";
import { Separator } from "@/components/ui/separator";
import CryptoJS from "crypto-js";
import { DeleteButton, EditButton } from "../components/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { RequiredBadge } from "../components/badge";
import { Skeleton } from "@/components/ui/skeleton";

const ObjectId = (): string => {
	const timestamp = Math.floor(new Date().getTime() / 1000)
		.toString(16)
		.padStart(8, "0");
	const randomPart = CryptoJS.lib.WordArray.random(8).toString(
		CryptoJS.enc.Hex,
	);

	return timestamp + randomPart;
};
const optionSchema = {
	image: undefined,
	name: "",
	price: undefined,
	character: [],
	stock: undefined,
	new: false,
	rerun: false,
};

const productSchema = {
	name: "",
	category: [],
	artist: [],
	option: [optionSchema],
};

type Artist = {
	_id: string;
	name: string;
	alias: string[];
	sns: { x: string };
	thumbnail: string;
	group: string;
};

export default function GoodsForm() {
	//행사가 변경되었을 때 날짜 초기화
	const { control, getValues } = useFormContext();
	const { fields, append, remove } = useFieldArray({
		control,
		name: "product",
	});
	const boothArtists: Artist[] = getValues("artist").map((item: Artist) => ({
		...item,
		group: "이 부스의 작가",
	}));
	const pos = getValues("pos.enabled");
	return (
		<>
			<div className="flex items-center justify-between -mt-1">
				<FormLabel className="text-lg">굿즈</FormLabel>
				<div className="flex gap-2 items-center">
					<EditButton fields={fields} />

					<Button
						type="button"
						variant="secondary"
						size="sm"
						onClick={() =>
							append({
								_id: ObjectId(),
								...productSchema,
								option: [{ _id: ObjectId(), ...optionSchema }],
							})
						}
					>
						<Plus className="mr-2 h-4 w-4" /> 추가
					</Button>
				</div>
			</div>

			<Carousel
				className="w-full"
				opts={{
					align: "start",
					dragFree: true,
				}}
				plugins={[]}
			>
				<CarouselContent className="mt-6 flex items-stretch">
					{fields.map((field, index) => (
						<CarouselItem className="basis-auto pl-4 h-full" key={field.id}>
							<Card className="w-[300px] lg:w-[350px] h-full mx-auto">
								<CardContent className="flex flex-col space-y-3 mt-4">
									<FormField
										control={control}
										name={`product[${index}].name`}
										render={({ field }) => (
											<FormItem>
												<div className="flex justify-between items-center">
													<FormLabel>굿즈 이름</FormLabel>
													<RequiredBadge field={field} />
												</div>
												<FormControl>
													<Input
														type="text"
														autoComplete="off"
														className="text-base"
														{...field}
													/>
												</FormControl>
											</FormItem>
										)}
									/>
									<FormField
										control={control}
										name={`product[${index}].category`}
										render={({ field }) => (
											<FormItem>
												<FormLabel>카테고리</FormLabel>
												<FormControl>
													<ComboBox
														name={field.name}
														search="category"
														list={(item) => (
															<div className="flex flex-col">
																<p>{item.name}</p>
															</div>
														)}
														label="카테고리"
														formValue={(item) => ({
															_id: item._id,
															name: item.name,
														})}
														multiple={true}
														onChange={(value) => field.onChange(value)}
													/>
												</FormControl>
												<div className="flex flex-wrap gap-1 my-1">
													{field.value.map(
														(item: { _id: string; name: string }) => (
															<ItemBadge
																key={item._id}
																item={item}
																onRemove={(id: string) => {
																	const newValue = field.value.filter(
																		(v: { _id: string }) => v._id !== id,
																	);
																	field.onChange(newValue);
																}}
															/>
														),
													)}
												</div>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={control}
										name={`product[${index}].artist`}
										render={({ field }) => (
											<FormItem>
												<FormLabel>작가</FormLabel>
												<FormControl>
													<ComboBox
														name={field.name}
														search="artist"
														list={(item) => (
															<div className="flex items-center gap-2">
																<Avatar>
																	<AvatarImage src={item.thumbnail} />
																	<AvatarFallback>
																		<p>{item.name[0]}</p>
																	</AvatarFallback>
																</Avatar>
																<div className="flex flex-col">
																	<p>{item.name}</p>
																	<p className="text-sm text-muted-foreground">
																		@{item.sns?.x}
																	</p>
																</div>
															</div>
														)}
														label="작가"
														formValue={(item) => ({
															_id: item._id,
															name: item.name,
														})}
														multiple={true}
														onChange={(value) => field.onChange(value)}
														predefined={boothArtists}
														group="group"
													/>
												</FormControl>
												<div className="flex flex-wrap gap-1 my-1">
													{field.value.map(
														(item: { _id: string; name: string }) => (
															<ItemBadge
																key={item._id}
																item={item}
																onRemove={(id: string) => {
																	const newValue = field.value.filter(
																		(v: { _id: string }) => v._id !== id,
																	);
																	field.onChange(newValue);
																}}
															/>
														),
													)}
												</div>
												<FormMessage />
											</FormItem>
										)}
									/>
									<OptionFields productIndex={index} />
									<DeleteButton
										formProps={{ fields, remove, index }}
										label="굿즈"
									/>
								</CardContent>
							</Card>
						</CarouselItem>
					))}
					<CarouselItem
						className={`basis-auto pl-4 ${
							fields.length === 0 ? "w-full" : "w-[300px] lg:w-[350px]"
						} ${pos ? "h-[676px]" : "h-[612px]"}`}
					>
						<Button
							asChild
							type="button"
							className="w-full h-full mx-auto border-dashed border-2"
							variant="outline"
							onClick={() =>
								append({
									_id: ObjectId(),
									...productSchema,
									option: [{ _id: ObjectId(), ...optionSchema }],
								})
							}
						>
							<div className="flex flex-col gap-4">
								<Plus className="h-14 w-14 text-muted-foreground" />
								<p className="text-2xl text-muted-foreground">굿즈 추가</p>
							</div>
						</Button>
					</CarouselItem>
				</CarouselContent>
			</Carousel>
		</>
	);
}

function OptionFields({ productIndex }: { productIndex: number }) {
	const { control, watch, setValue, register, getValues } = useFormContext();
	const { fields, append, remove } = useFieldArray({
		control,
		name: `product[${productIndex}].option`,
	});
	const pos = getValues("pos.enabled");

	return (
		<>
			<Label>옵션</Label>
			<ScrollArea className={`w-full rounded-md ${pos ? "h-72" : "h-56"}`}>
				<div className="flex flex-col gap-6 w-full">
					{fields.map((optionField, optionIndex) => (
						<div key={optionField.id} className="flex flex-col">
							<div className="flex flex-row gap-4">
								<div className="w-2/5 flex flex-col gap-2">
									<FormField
										control={control}
										name={`product[${productIndex}].option[${optionIndex}].image`}
										render={({ field }) => (
											<FormItem className="flex flex-col">
												<FormControl>
													<FileUpload
														{...field}
														ratio={1}
														maxSize={10000000}
														maxFiles={1}
													/>
												</FormControl>
											</FormItem>
										)}
									/>
									<FormField
										control={control}
										name={`product[${productIndex}].option[${optionIndex}].type`}
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<ToggleGroup
														className="w-full"
														variant="outline"
														type="single"
														value={field.value}
														orientation="vertical"
														onValueChange={(value) => {
															field.onChange(value);
														}}
													>
														<div className="w-full flex flex-col lg:flex-row gap-1 lg:justify-between">
															<ToggleGroupItem
																value="new"
																className="[&[data-state=on]]:data-state-on w-full"
															>
																신규
															</ToggleGroupItem>
															<ToggleGroupItem
																value="rerun"
																className="[&[data-state=on]]:data-state-on w-full"
															>
																복각
															</ToggleGroupItem>
														</div>
													</ToggleGroup>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								<div className="w-3/5 flex flex-col space-y-3">
									<FormField
										control={control}
										name={`product[${productIndex}].option[${optionIndex}].name`}
										render={({ field }) => (
											<FormItem>
												<div className="flex flex-col gap-1">
													<div className="flex justify-between items-center">
														<FormLabel>옵션 이름</FormLabel>
														<RequiredBadge field={field} />
													</div>
													<FormControl>
														<Input
															type="text"
															autoComplete="off"
															className="text-base"
															{...field}
														/>
													</FormControl>
												</div>
											</FormItem>
										)}
									/>
									<FormField
										control={control}
										name={`product[${productIndex}].option[${optionIndex}].price`}
										render={({ field }) => (
											<FormItem>
												<div className="flex flex-col gap-1">
													<div className="flex justify-between items-center">
														<FormLabel>가격</FormLabel>
														<RequiredBadge field={field} />
													</div>{" "}
													<FormControl>
														<NumericFormat
															className="text-base"
															allowNegative={false}
															thousandSeparator=","
															suffix="원"
															inputMode="numeric"
															valueIsNumericString={true}
															customInput={Input}
															autoComplete="off"
															value={field.value}
															onValueChange={(values) => {
																field.onChange(values.floatValue);
															}}
														/>
													</FormControl>
												</div>
											</FormItem>
										)}
									/>
									{pos && (
										<FormField
											control={control}
											name={`product[${productIndex}].option[${optionIndex}].stock`}
											render={({ field }) => (
												<FormItem>
													<div className="flex flex-col gap-1">
														<FormLabel>재고</FormLabel>
														<FormControl>
															<NumericFormat
																className="text-base"
																allowNegative={false}
																thousandSeparator=","
																suffix="개"
																inputMode="numeric"
																valueIsNumericString={true}
																customInput={Input}
																autoComplete="off"
																value={field.value}
																onValueChange={(values) => {
																	field.onChange(values.floatValue);
																}}
															/>
														</FormControl>
													</div>
													<FormMessage />
												</FormItem>
											)}
										/>
									)}
									<FormField
										control={control}
										name={`product[${productIndex}].option[${optionIndex}].character`}
										render={({ field }) => (
											<FormItem>
												<div className="flex flex-col gap-1">
													<FormLabel>캐릭터</FormLabel>
													<FormControl>
														<ComboBox
															name={field.name}
															search="character"
															list={(item) => (
																<div className="flex items-center gap-2">
																	<Avatar>
																		<AvatarImage
																			src={item.thumbnail}
																			className="w-full h-full object-cover"
																		/>
																		<AvatarFallback>
																			<p>{item.name[0]}</p>
																		</AvatarFallback>
																	</Avatar>
																	<div className="flex flex-col">
																		<p>{item.name}</p>
																		<p className="text-sm text-muted-foreground">
																			{item.genre.name}
																		</p>
																	</div>
																</div>
															)}
															label="캐릭터"
															formValue={(item) => ({
																_id: item._id,
																name: item.name,
																thumbnail: item.thumbnail,
																genre: item.genre,
															})}
															multiple={true}
															onChange={(selectedItems) => {
																const selectedGenres = watch("genre");
																const characterGenres = selectedItems.map(
																	(item: {
																		genre: { _id: string; name: string };
																	}) => item.genre,
																);
																const uniqueGenres = characterGenres.filter(
																	(characterGenre: { _id: string }) =>
																		!selectedGenres.some(
																			(selectedGenre: { _id: string }) =>
																				selectedGenre._id ===
																				characterGenre._id,
																		),
																);
																setValue("genre", [
																	...selectedGenres,
																	...uniqueGenres,
																]);
															}}
														/>
													</FormControl>
												</div>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</div>
							<div className="flex flex-wrap gap-1 my-1">
								{watch(
									`product[${productIndex}].option[${optionIndex}].character`,
								).map((item: { _id: string; name: string }) => (
									<ItemBadge
										key={item._id}
										item={item}
										onRemove={(id: string) => {
											const currentValue = getValues(
												`product[${productIndex}].option[${optionIndex}].character`,
											);
											const newValue = currentValue.filter(
												(v: { _id: string }) => v._id !== id,
											);
											setValue(
												`product[${productIndex}].option[${optionIndex}].character`,
												newValue,
												{ shouldValidate: true },
											);
										}}
									/>
								))}
							</div>
							{fields.length > 1 && (
								<DeleteButton
									formProps={{ fields, remove, index: optionIndex }}
									label="옵션"
								/>
							)}
							<Separator className="mt-2" />
						</div>
					))}
				</div>
			</ScrollArea>
			<Button
				type="button"
				variant="secondary"
				onClick={() => append({ _id: ObjectId(), ...optionSchema })}
			>
				<Plus className="mr-2 h-4 w-4" />
				옵션 추가
			</Button>
		</>
	);
}

interface ItemProps {
	item: { _id: string; name: string };
	onRemove: (id: string) => void;
}

export const ItemBadge = ({ item, onRemove }: ItemProps) => (
	<Badge
		key={item._id}
		className="flex items-center gap-1 px-2 py-1 rounded-md"
		variant="secondary"
		role="status"
	>
		<Button
			className="w-4 h-4 text-muted-foreground"
			size="icon"
			role="button"
			asChild
			variant="ghost"
			onClick={() => onRemove(item._id)}
		>
			<X className="h-4 w-4 mr-1" />
		</Button>
		<Label className="text-sm">{item.name}</Label>
	</Badge>
);
