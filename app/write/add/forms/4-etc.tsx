"use client";
import { useFormContext, useFieldArray, Form } from "react-hook-form";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import ComboBox from "@/components/combobox/combobox";
import { ItemBadge } from "./3-goods";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
} from "@/components/ui/carousel";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
	Check,
	Clock,
	Hash,
	LayoutGrid,
	Pencil,
	Plus,
	ShoppingCart,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { NumericFormat } from "react-number-format";
import CryptoJS from "crypto-js";
import { useEditModeStore } from "@/store/addform";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { format, parse, isAfter, addMinutes } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { EditButton, DeleteButton } from "../components/button";
import { RequiredBadge } from "../components/badge";
import { watch } from "node:fs";

const ObjectId = (): string => {
	const timestamp = Math.floor(new Date().getTime() / 1000)
		.toString(16)
		.padStart(8, "0");
	const randomPart = CryptoJS.lib.WordArray.random(8).toString(
		CryptoJS.enc.Hex,
	);

	return timestamp + randomPart;
};


const getImageUrl = (image?: File) => {
	if (image instanceof File) {
		return URL.createObjectURL(image);
	}
	return "";
};

export default function EtcForm() {
	return (
		<>
			<div className="flex flex-col space-y-6">
				<GenreField />
				<PromotionField />
				<BuyField />
			</div>
		</>
	);
}

//FIELDS
function GenreField() {
	const { control } = useFormContext();
	return (
		<FormField
			control={control}
			name="genre"
			render={({ field }) => (
				<FormItem className="flex flex-col gap-1">
					<FormLabel className="text-lg">장르 및 태그</FormLabel>
					<div className="w-full md:w-96">
						<FormControl>
							<ComboBox
								name={field.name}
								search="genre"
								list={(item) => (
									<div className="flex flex-col">
										<p>{item.name}</p>
									</div>
								)}
								label="장르 또는 태그"
								formValue={(item) => ({
									_id: item._id,
									name: item.name,
								})}
								multiple={true}
							/>
						</FormControl>
						<div className="flex flex-wrap gap-1 my-1">
							{field.value.map((item: { _id: string; name: string }) => (
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
							))}
						</div>
					</div>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}

interface PromotionField {
	_id: string;
	type: "quantity" | "allOption" | "totalPrice";
	// Add other properties as needed
}

function PromotionField() {
	const { control } = useFormContext<{ promotion: PromotionField[] }>();
	const { fields, append, remove } = useFieldArray<{
		promotion: PromotionField[];
	}>({
		control,
		name: "promotion",
	});
	return (
		<>
			<div className="flex items-center justify-between">
				<FormLabel className="text-lg">혜택</FormLabel>
				<div className="flex gap-2 items-center">
					<EditButton fields={fields} />
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button type="button" variant="secondary" size="sm">
								<Plus className="mr-2 h-4 w-4" /> 추가
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="w-56" align="end">
							<DropdownMenuGroup>
								<DropdownMenuItem
									onClick={() => {
										append({
											_id: ObjectId(),
											type: "quantity",
										});
									}}
								>
									<Hash className="h-8 w-8 mr-4 self-start " />
									<span className="flex flex-col gap-1 mt-1 ">
										<p className="font-bold">수량</p>
										<p className="text-muted-foreground">
											지정한 굿즈를 일정 수량 이상 구입할 때 혜택을 적용합니다.
										</p>
									</span>
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => {
										append({
											_id: ObjectId(),
											type: "allOption",
										});
									}}
								>
									<LayoutGrid className="h-8 w-8 mr-4 self-start " />
									<span className="flex flex-col gap-1 mt-1 ">
										<p className="font-bold">모든 옵션</p>
										<p className="text-muted-foreground">
											지정한 굿즈의 모든 옵션을 구입할 때 혜택을 적용합니다.
										</p>
									</span>
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => {
										append({
											_id: ObjectId(),
											type: "totalPrice",
										});
									}}
								>
									<ShoppingCart className="h-8 w-8 mr-4 self-start " />
									<span className="flex flex-col gap-1 mt-1 ">
										<p className="font-bold">금액</p>
										<p className="text-muted-foreground">
											장바구니 합계가 지정한 금액 이상일 때 혜택을 적용합니다.
										</p>
									</span>
								</DropdownMenuItem>
							</DropdownMenuGroup>
						</DropdownMenuContent>
					</DropdownMenu>
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
				<CarouselContent className="flex items-stretch">
					{fields.map((field, index) => (
						<CarouselItem key={field.id} className="basis-auto pl-4 h-full">
							<Card className="w-[300px] lg:w-[350px] h-full mx-auto">
								<CardContent className="flex flex-col space-y-3 mt-4">
									{field.type === "quantity" && (
										<QuantityPromotion index={index} />
									)}
									{field.type === "allOption" && (
										<AllOptionPromotion index={index} />
									)}
									{field.type === "totalPrice" && (
										<TotalPricePromotion index={index} />
									)}
									<DeleteButton formProps={{ fields, remove, index }} />
								</CardContent>
							</Card>
						</CarouselItem>
					))}

					<CarouselItem
						className={`basis-auto pl-4 ${
							fields.length === 0 ? "w-full" : "w-[300px] lg:w-[350px]"
						}`}
					>
						<Card className="border-dashed border-2">
							<CardContent className="flex flex-col space-y-2 mt-5">
								<div className="flex items-center mb-3">
									<Plus className="h-6 w-6 mr-2" />
									<div className="text-lg">혜택 추가</div>
								</div>
								<Button
									type="button"
									variant="secondary"
									className="w-full h-auto p-3 justify-start"
									onClick={() => {
										append({
											_id: ObjectId(),
											type: "quantity",
										});
									}}
								>
									<div className="flex flex-row gap-3 items-start w-full">
										<div className="flex-shrink-0 self-start mt-1">
											<Hash className="h-4 w-4" />
										</div>
										<div className="flex flex-col gap-1 text-left flex-grow overflow-hidden">
											<p className="font-bold ">수량</p>
											<p className=" text-muted-foreground whitespace-normal overflow-wrap-anywhere">
												지정한 굿즈를 일정 수량 이상 구입할 때 혜택을
												적용합니다.
											</p>
										</div>
									</div>
								</Button>
								<Button
									type="button"
									variant="secondary"
									className="w-full h-auto p-3 justify-start"
									onClick={() => {
										append({
											_id: ObjectId(),
											type: "allOption",
										});
									}}
								>
									<div className="flex flex-row gap-3 items-start w-full">
										<div className="flex-shrink-0 self-start mt-1">
											<LayoutGrid className="h-4 w-4" />
										</div>
										<div className="flex flex-col gap-1 text-left flex-grow overflow-hidden">
											<p className="font-bold ">모든 옵션</p>
											<p className=" text-muted-foreground whitespace-normal overflow-wrap-anywhere">
												지정한 굿즈의 모든 옵션을 구입할 때 혜택을 적용합니다.
											</p>
										</div>
									</div>
								</Button>
								<Button
									type="button"
									variant="secondary"
									className="w-full h-auto p-3 justify-start"
									onClick={() => {
										append({
											_id: ObjectId(),
											type: "totalPrice",
										});
									}}
								>
									<div className="flex flex-row gap-3 items-start w-full">
										<div className="flex-shrink-0 self-start mt-1">
											<ShoppingCart className="h-4 w-4" />
										</div>
										<div className="flex flex-col gap-1 text-left flex-grow overflow-hidden">
											<p className="font-bold ">금액</p>
											<p className=" text-muted-foreground whitespace-normal overflow-wrap-anywhere">
												장바구니 합계가 지정한 금액 이상일 때 혜택을 적용합니다.
											</p>
										</div>
									</div>
								</Button>
							</CardContent>
						</Card>
					</CarouselItem>
				</CarouselContent>
			</Carousel>
		</>
	);
}

function BuyField() {
	const { control } = useFormContext();
	const { editMode, setEditMode } = useEditModeStore();
	const { fields, append, remove } = useFieldArray({
		control,
		name: "buy",
	});
	return (
		<>
			<div className="flex items-center justify-between">
				<FormLabel className="text-lg">선입금 및 통판</FormLabel>
				<div className="flex gap-2 items-center">
					<EditButton fields={fields} />

					<Button
						type="button"
						variant="secondary"
						size="sm"
						onClick={() =>
							append({
								_id: ObjectId(),
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
				<CarouselContent className="flex items-stretch">
					{fields.map((field, index) => (
						<CarouselItem key={field.id} className="basis-auto pl-4 h-full">
							<Card className="w-[300px] lg:w-[350px] h-full mx-auto">
								<CardContent className="flex flex-col space-y-3 mt-4">
									<FormField
										control={control}
										name={`buy[${index}].type`}
										render={({ field }) => (
											<FormItem>
												<div className="flex justify-between items-center">
													<FormLabel>종류</FormLabel>
													<RequiredBadge field={field} />
												</div>
												<FormControl>
													<ToggleGroup
														className="justify-start w-full"
														variant="outline"
														type="single"
														value={field.value}
														onValueChange={(value) => {
															field.onChange(value);
														}}
													>
														<ToggleGroupItem
															value="survey"
															className="[&[data-state=on]]:data-state-on w-full"
														>
															수요조사
														</ToggleGroupItem>
														<ToggleGroupItem
															value="preorder"
															className="[&[data-state=on]]:data-state-on w-full"
														>
															선입금
														</ToggleGroupItem>
														<ToggleGroupItem
															value="ship"
															className="[&[data-state=on]]:data-state-on w-full"
														>
															통판
														</ToggleGroupItem>
													</ToggleGroup>
												</FormControl>
											</FormItem>
										)}
									/>
									<FormField
										control={control}
										name={`buy[${index}].name`}
										render={({ field }) => (
											<FormItem>
												<div className="flex justify-between items-center">
													<FormLabel>제목</FormLabel>
													<RequiredBadge field={field} />
												</div>
												<FormControl>
													<Input
														className="w-full text-base"
														autoComplete="off"
														{...field}
													/>
												</FormControl>
											</FormItem>
										)}
									/>
									<FormField
										control={control}
										name={`buy[${index}].url`}
										render={({ field }) => (
											<FormItem>
												<div className="flex justify-between items-center">
													<FormLabel>링크</FormLabel>
													<RequiredBadge field={field} />
												</div>
												<FormControl>
													<Input
														className="w-full text-base"
														autoComplete="off"
														type="url"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={control}
										name={`buy[${index}].date`}
										render={({ field }) => <CalendarBox field={field} />}
									/>
									<DeleteButton formProps={{ fields, remove, index }} />
								</CardContent>
							</Card>
						</CarouselItem>
					))}
					<CarouselItem
						className={`basis-auto pl-4 h-[358px] ${
							fields.length === 0 ? "w-full" : "w-[300px] lg:w-[350px]"
						}`}
					>
						<Button
							asChild
							type="button"
							className="w-full h-full mx-auto border-dashed border-2"
							variant="outline"
							onClick={() =>
								append({
									_id: ObjectId(),
								})
							}
						>
							<div className="flex flex-col gap-4">
								<Plus className="h-14 w-14 text-muted-foreground" />
								<p className="text-2xl text-muted-foreground">
									선입금/통판 추가
								</p>
							</div>
						</Button>
					</CarouselItem>
				</CarouselContent>
			</Carousel>
		</>
	);
}

//SUBFIELDS
function QuantityPromotion({ index }: { index: number }) {
	const { control, watch } = useFormContext();
	return (
		<>
			<div className="flex justify-between">
				<div className="flex items-center">
					<Hash className="h-6 w-6 mr-2" />
					<FormLabel className="text-lg">수량</FormLabel>
				</div>
				<div>
					<FormField
						control={control}
						name={`promotion[${index}].thenThat.type`}
						render={({ field }) => <PromotionTypeToggleGroup field={field} />}
					/>
				</div>
			</div>
			<FormField
				control={control}
				name={`promotion[${index}].ifThis.item`}
				render={({ field }) => (
					<IfThisProductComboBox field={field} type="quantity" />
				)}
			/>

			<FormField
				control={control}
				name={`promotion[${index}].ifThis.amount`}
				render={({ field }) => (
					<AmountField field={field} level="ifThis" type="quantity" />
				)}
			/>
			{watch(`promotion[${index}].thenThat.type`) === "discount" && (
				<FormField
					control={control}
					name={`promotion[${index}].thenThat.amount`}
					render={({ field }) => (
						<AmountField field={field} level="thenThat" type="price" />
					)}
				/>
			)}
			{watch(`promotion[${index}].thenThat.type`) === "giveaway" && (
				<>
					<FormField
						control={control}
						name={`promotion[${index}].thenThat.item`}
						render={({ field }) => <ThenThatProductComboBox field={field} />}
					/>
					<FormField
						control={control}
						name={`promotion[${index}].thenThat.amount`}
						render={({ field }) => (
							<AmountField field={field} level="thenThat" type="quantity" />
						)}
					/>
				</>
			)}
		</>
	);
}

function AllOptionPromotion({ index }: { index: number }) {
	const { control, watch } = useFormContext();
	return (
		<>
			<div className="flex justify-between">
				<div className="flex items-center">
					<LayoutGrid className="h-6 w-6 mr-2" />
					<FormLabel className="text-lg">모든 옵션</FormLabel>
				</div>
				<div>
					<FormField
						control={control}
						name={`promotion[${index}].thenThat.type`}
						render={({ field }) => <PromotionTypeToggleGroup field={field} />}
					/>
				</div>
			</div>
			<FormField
				control={control}
				name={`promotion[${index}].ifThis.item`}
				render={({ field }) => (
					<IfThisProductComboBox field={field} type="allOption" />
				)}
			/>
			<p className="text-base">모든 옵션을 구입하면</p>
			{watch(`promotion[${index}].thenThat.type`) === "discount" && (
				<FormField
					control={control}
					name={`promotion[${index}].thenThat.amount`}
					render={({ field }) => (
						<AmountField field={field} level="thenThat" type="price" />
					)}
				/>
			)}
			{watch(`promotion[${index}].thenThat.type`) === "giveaway" && (
				<>
					<FormField
						control={control}
						name={`promotion[${index}].thenThat.item`}
						render={({ field }) => <ThenThatProductComboBox field={field} />}
					/>
					<FormField
						control={control}
						name={`promotion[${index}].thenThat.amount`}
						render={({ field }) => (
							<AmountField field={field} level="thenThat" type="quantity" />
						)}
					/>
				</>
			)}
		</>
	);
}

function TotalPricePromotion({ index }: { index: number }) {
	const { control, watch } = useFormContext();
	return (
		<>
			<div className="flex justify-between">
				<div className="flex items-center">
					<ShoppingCart className="h-6 w-6 mr-2" />
					<FormLabel className="text-lg">금액</FormLabel>
				</div>
				<div>
					<FormField
						control={control}
						name={`promotion[${index}].thenThat.type`}
						render={({ field }) => <PromotionTypeToggleGroup field={field} />}
					/>
				</div>
			</div>
			<p className="text-base">장바구니 금액 합이</p>
			<FormField
				control={control}
				name={`promotion[${index}].ifThis.amount`}
				render={({ field }) => (
					<AmountField field={field} level="ifThis" type="price" />
				)}
			/>

			{watch(`promotion[${index}].thenThat.type`) === "discount" && (
				<FormField
					control={control}
					name={`promotion[${index}].thenThat.amount`}
					render={({ field }) => (
						<AmountField field={field} level="thenThat" type="price" />
					)}
				/>
			)}
			{watch(`promotion[${index}].thenThat.type`) === "giveaway" && (
				<>
					<FormField
						control={control}
						name={`promotion[${index}].thenThat.item`}
						render={({ field }) => <ThenThatProductComboBox field={field} />}
					/>
					<FormField
						control={control}
						name={`promotion[${index}].thenThat.amount`}
						render={({ field }) => (
							<AmountField field={field} level="thenThat" type="quantity" />
						)}
					/>
				</>
			)}
		</>
	);
}

//BOXES
interface PromotionTypeToggleGroupProps {
	field: {
		name: string;
		value: undefined;
		onChange: (value: string) => void;
	};
}

interface IfThisProductComboboxProps {
	field: {
		name: string;
		value: undefined;
	};
	type: "quantity" | "allOption";
}

interface ThenThatProductComboboxProps {
	field: {
		name: string;
		value: undefined;
	};
}

interface AmountFieldProps {
	field: {
		name: string;
		value: undefined;
		onChange: (value: number) => void;
	};
	level: "ifThis" | "thenThat";
	type: "price" | "quantity";
}

interface CalendarProps {
	field: {
		value: Date[] | undefined[];
		onChange: (value: Date[]) => void;
		name: string;
	};
}

const PromotionTypeToggleGroup: React.FC<PromotionTypeToggleGroupProps> = ({
	field,
}) => {
	return (
		<FormItem>
			<FormControl>
				<ToggleGroup
					className="justify-start"
					variant="outline"
					type="single"
					value={field.value}
					onValueChange={(value) => {
						field.onChange(value);
					}}
				>
					<ToggleGroupItem
						value="discount"
						className="[&[data-state=on]]:data-state-on group"
					>
						할인
					</ToggleGroupItem>
					<ToggleGroupItem
						value="giveaway"
						className="[&[data-state=on]]:data-state-on group"
					>
						증정
					</ToggleGroupItem>
				</ToggleGroup>
			</FormControl>
			<FormMessage />
		</FormItem>
	);
};

const IfThisProductComboBox: React.FC<IfThisProductComboboxProps> = ({
	field,
	type,
}) => {
	const { getValues } = useFormContext();

	return (
		<FormItem>
			<FormControl>
				<div className="flex flex-wrap items-center gap-2">
					<div>
						<ComboBox
							name={field.name}
							predefined={getValues("product")}
							list={(item) => (
								<div className="flex flex-col">
									<p>{item.name}</p>
									<p className="text-muted-foreground">
										{item.category
											.map((cat: { name: string }) => cat.name)
											.join(", ")}
									</p>
									{item.option.length > 1 && (
										<p className="text-muted-foreground">
											{item.option.length}개 옵션
										</p>
									)}
								</div>
							)}
							label="굿즈"
							formValue={(item) => ({
								_id: item._id,
								name: item.name,
							})}
							multiple={false}
						/>
					</div>
					<p className="text-base">굿즈{type === "quantity" ? "를" : "의"}</p>
				</div>
			</FormControl>
			<FormMessage />
		</FormItem>
	);
};

const ThenThatProductComboBox: React.FC<ThenThatProductComboboxProps> = ({
	field,
}) => {
	const { watch } = useFormContext();

	return (
		<FormItem>
			<FormControl>
				<div className="flex flex-wrap items-center gap-2">
					<div>
						<ComboBox
							name={field.name}
							predefined={watch("product").flatMap(
								(product: {
									option: [{ _id: string; name: string }];
									_id: string;
									name: string;
								}) =>
									product.option.map((option) => ({
										...option,
										product: {
											_id: product._id,
											name: product.name,
										}, // 각 옵션에 product 정보 추가
										group: product.name,
									})),
							)}
							list={(option) => (
								<div className="flex items-center gap-2">
									<Avatar>
										<AvatarImage
											src={getImageUrl(option.image)}
											className="w-full h-full object-cover"
										/>

										<AvatarFallback>
											<p>{option.name[0]}</p>
										</AvatarFallback>
									</Avatar>
									<div className="flex flex-col">
										<p>{option.name}</p>
										<p className="text-sm text-muted-foreground">
											{option.price
												? `${option.price.toLocaleString()}원`
												: "가격 정보 없음"}
										</p>
									</div>
								</div>
							)}
							label="옵션"
							formValue={(item) => ({
								_id: item._id, //표시용 값. 실제로는 적용되지 않음.
								name: item.name, //표시용 값. 실제로는 적용되지 않음.
								product: {
									_id: item.product._id,
									name: item.product.name,
									option: {
										_id: item._id,
										name: item.name,
									},
								},
							})}
							multiple={false}
							group="group"
						/>
					</div>
					<p className="text-base">굿즈</p>
				</div>
			</FormControl>
			<FormMessage />
		</FormItem>
	);
};

const AmountField: React.FC<AmountFieldProps> = ({ field, level, type }) => {
	const width = type === "price" ? "w-24" : "w-16";
	const placeholder = type === "price" ? "금액" : "수량";
	const suffixPre = type === "price" ? "원" : "개";
	const suffixAfter =
		level === "ifThis"
			? "이상 구입하면"
			: level === "thenThat" && type === "price"
			  ? "할인"
			  : "증정";
	return (
		<FormItem>
			<FormControl>
				<div className="flex flex-wrap items-center gap-2">
					<NumericFormat
						className={`text-base ${width}`}
						allowNegative={false}
						thousandSeparator=","
						inputMode="numeric"
						valueIsNumericString={true}
						customInput={Input}
						autoComplete="off"
						placeholder={placeholder}
						value={field.value}
						onValueChange={(values) => {
							field.onChange(values.floatValue || 0);
						}}
					/>
					<p className="text-base">
						{suffixPre} {suffixAfter}
					</p>
				</div>
			</FormControl>
			<FormMessage />
		</FormItem>
	);
};

const CalendarBox: React.FC<CalendarProps> = ({ field }) => {
	const [date, setDate] = useState<DateRange | undefined>(() => {
		if (Array.isArray(field.value) && field.value.length === 2) {
			const [start, end] = field.value;
			return start && end
				? { from: start, to: end }
				: start
				  ? { from: start }
				  : undefined;
		}
		return undefined;
	});

	const [startTime, setStartTime] = useState(() => {
		if (Array.isArray(field.value) && field.value[0]) {
			return format(field.value[0], "HH:mm");
		}
		return "00:00";
	});

	const [endTime, setEndTime] = useState(() => {
		if (Array.isArray(field.value) && field.value[1]) {
			return format(field.value[1], "HH:mm");
		}
		return "23:59";
	});

	useEffect(() => {
		validateAndAdjustTimes(startTime, endTime);
	}, [startTime, endTime]);

	const validateAndAdjustTimes = (start: string, end: string) => {
		const startDate = parse(start, "HH:mm", new Date());
		const endDate = parse(end, "HH:mm", new Date());

		if (isAfter(startDate, endDate)) {
			const newEndDate = addMinutes(startDate, 30);
			const newEndTime = format(newEndDate, "HH:mm");
			setEndTime(newEndTime);
			updateField(date, start, newEndTime);
		} else {
			updateField(date, start, end);
		}
	};

	const updateField = (
		newDate: DateRange | undefined,
		start: string,
		end: string,
	) => {
		const fromDate = newDate?.from
			? setTimeToDate(newDate.from, start)
			: undefined;
		const toDate = newDate?.to ? setTimeToDate(newDate.to, end) : undefined;

		// undefined 값을 필터링하고 나머지를 Date 타입으로 단언합니다.
		const dateArray = [fromDate, toDate].filter(
			(date): date is Date => date !== undefined,
		);

		field.onChange(dateArray);
	};

	const setTimeToDate = (date: Date, timeString: string): Date => {
		const [hours, minutes] = timeString.split(":").map(Number);
		return new Date(date.setHours(hours || 0, minutes || 0));
	};

	const handleSelect = (newDate: DateRange | undefined) => {
		setDate(newDate);
		validateAndAdjustTimes(startTime, endTime);
		updateField(newDate, startTime, endTime); // 추가된 부분
	};

	const handleTimeChange = (timeString: string, isStart: boolean) => {
		if (isStart) {
			setStartTime(timeString);
		} else {
			setEndTime(timeString);
		}
	};

	return (
		<div>
			<FormItem>
				<Popover>
					<div className="flex justify-between items-center">
						<FormLabel>기간</FormLabel>
						<RequiredBadge field={field} />
					</div>
					<FormControl>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								className={cn(
									"w-full justify-start text-left",
									!date && "text-muted-foreground",
								)}
							>
								<CalendarIcon className="mr-2 h-4 w-4" />
								{date?.from
									? date.to
										? `${format(date.from, "MM/dd")} ${startTime} - ${format(
												date.to,
												"MM/dd",
										  )} ${endTime}`
										: format(date.from, "MM/dd")
									: "날짜 선택..."}
							</Button>
						</PopoverTrigger>
					</FormControl>
					<PopoverContent className="w-auto p-0" align="start">
						<Calendar
							mode="range"
							selected={date}
							onSelect={handleSelect}
							locale={ko}
						/>
						<div className="flex justify-between gap-2 p-3">
							<div>
								<Label>시작 시간</Label>
								<Input
									type="time"
									value={startTime}
									onChange={(e) => handleTimeChange(e.target.value, true)}
								/>
							</div>
							<div>
								<Label>종료 시간</Label>
								<Input
									type="time"
									value={endTime}
									onChange={(e) => handleTimeChange(e.target.value, false)}
								/>
							</div>
						</div>
					</PopoverContent>
				</Popover>
			</FormItem>
		</div>
	);
};
