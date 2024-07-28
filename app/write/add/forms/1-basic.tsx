"use client";
import { useFormContext, useFormState } from "react-hook-form";
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import * as React from "react";
import { format } from "date-fns";
import { fi, ko } from "date-fns/locale";
import { create } from "zustand";
import ComboBox from "@/components/combobox/combobox";
import { ItemBadge } from "./3-goods";
import { RequiredBadge } from "../components/badge";
interface LocationState {
	inputValue: string;
	setInputValue: (value: string) => void;
}

const useLocationStore = create<LocationState>((set) => ({
	inputValue: "",
	setInputValue: (value) => set({ inputValue: value }),
}));

type Artist = {
	_id: string;
	name: string;
	alias: string[];
	sns: { x: string };
	thumbnail: string;
};

type Exhibition = {
	_id: string;
	name: string;
	group: string;
	date: number[];
};
//임시 데이터
const exhibition: Exhibition[] = [
	{
		group: "서울 코믹월드",
		name: "코믹월드 2024 SUMMER",
		_id: "seco24s",
		date: [1721437200000, 1721548800000],
	},
	{
		group: "일러스타 페스",
		name: "일러스타 페스 5",
		_id: "ilfs005",
		date: [1724461200000, 1724572800000],
	},
];

const artist: Artist[] = [
	{
		_id: "abcdef0a1",
		name: "카이저 PMC 이사",
		alias: ["박민철"],
		sns: {
			x: "parkmincheol",
		},
		thumbnail: "x",
	},
	{
		_id: "abadefa01",
		name: "검은 양복",
		alias: [],
		sns: {
			x: "bsuit",
		},
		thumbnail: "x",
	},
	{
		_id: "abceef021",
		name: "두근두근 문예부",
		alias: [],
		sns: {
			x: "ddlc2024",
		},
		thumbnail: "x",
	},
	{
		_id: "abcdegae01",
		name: "카이저 코퍼레이션",
		alias: [],
		sns: {
			x: "kaisercorp_arts",
		},
		thumbnail: "x",
	},
] as const;
export default function BasicForm() {
	//행사가 변경되었을 때 날짜 초기화
	const { control, watch, setValue, setError, getFieldState } =
		useFormContext();
	const { dirtyFields } = useFormState();
	const { inputValue, setInputValue } = useLocationStore();

	return (
		<>
			<div className="flex flex-col space-y-6 md:w-96">
				<FormField
					control={control}
					name="exhibition"
					render={({ field }) => (
						<FormItem className="flex flex-col">
							<div className="flex justify-between items-center">
								<FormLabel className="text-lg">행사</FormLabel>
								<RequiredBadge field={field} />
							</div>
							<div className="w-full md:w-96">
								<FormControl>
									<ComboBox
										name={field.name}
										data={exhibition}
										list={(item) => (
											<div className="flex flex-col">
												<p>{item.name}</p>
												<p className="text-sm text-muted-foreground">
													{item.date}
												</p>
											</div>
										)}
										group="group"
										label="행사"
										formValue={(item) => ({
											_id: item._id,
											name: item.name,
											date: item.date,
										})}
										multiple={false}
										onChange={() => {
											setValue("date", []);
										}}
									/>
								</FormControl>
							</div>
						</FormItem>
					)}
				/>

				<FormField
					control={control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<div className="flex justify-between items-center">
								<FormLabel className="text-lg">부스 이름</FormLabel>
								<RequiredBadge field={field} />
							</div>
							<FormControl>
								<Input
									className="w-full md:w-96 text-base"
									autoComplete="off"
									placeholder="부스 이름을 입력하세요."
									{...field}
								/>
							</FormControl>
						</FormItem>
					)}
				/>

				<FormField
					control={control}
					name="date"
					render={({ field }) => (
						<FormItem className="flex flex-col">
							<div className="flex justify-between items-center">
								<FormLabel className="text-lg">날짜</FormLabel>
								<RequiredBadge field={field} />
							</div>
							<FormControl>
								<ToggleGroup
									className="justify-start"
									variant="outline"
									type="multiple"
									value={field.value}
									onValueChange={(values) => {
										field.onChange(values);
									}}
								>
									{watch("exhibition")?.date?.map((date: string) => (
										<ToggleGroupItem
											key={date}
											value={date}
											className="[&[data-state=on]]:data-state-on group"
										>
											<div className="flex flex-col items-center">
												<div>
													{format(new Date(date), "EEEE", { locale: ko })}
												</div>
												<div className="text-xs text-muted-foreground group-data-[state=on]:text-blue-600 group-data-[state=on]:dark:text-blue-400">
													{format(new Date(date), "yyyy. M. d", { locale: ko })}
												</div>
											</div>
										</ToggleGroupItem>
									))}
								</ToggleGroup>
							</FormControl>
							<FormDescription>
								{dirtyFields.exhibition
									? "참가할 날짜를 모두 선택해 주세요"
									: "행사를 먼저 선택해 주세요"}
							</FormDescription>
						</FormItem>
					)}
				/>
				<FormField
					control={control}
					name="location"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-lg">부스 위치</FormLabel>
							<FormControl>
								<Input
									className="w-full md:w-96 text-base"
									placeholder="A00..."
									value={inputValue}
									autoComplete="off"
									onChange={(e) => setInputValue(e.target.value)}
									disabled={dirtyFields.location}
								/>
							</FormControl>
							<div className="flex gap-2 mt-2">
								{inputValue && LocationButtons(inputValue, field, 4)}
							</div>
							<FormDescription>
								{inputValue.length > 0
									? "위치를 모두 선택해 주세요"
									: "위치를 검색하면 적절한 위치를 선택할 수 있습니다"}
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={control}
					name="artist"
					render={({ field }) => (
						<FormItem className="flex flex-col gap-1">
							<FormLabel className="text-lg">작가</FormLabel>
							<div className="w-full md:w-96">
								<FormControl>
									<ComboBox
										name={field.name}
										data={artist}
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
														@{item.sns.x}
													</p>
												</div>
											</div>
										)}
										label="작가"
										formValue={(item) => ({
											_id: item._id,
											name: item.name,
											thumbnail: item.thumbnail,
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
			</div>
		</>
	);
}

interface Field {
	value: string[];
	onChange: (value: string[]) => void;
}

const LocationButtons = (inputValue: string, field: Field, length: number) => {
	if (!inputValue) return null;

	const baseNumber = Number.parseInt(inputValue.match(/\d+$/)?.[0] || "0", 10);
	const prefix = inputValue
		.replace(/\d+$/, "")
		.replace(/^(.)/, (c) => c.toUpperCase())
		.replace(/[-\s]/g, "");

	const locations = Array.from({ length: length }, (_, i) => {
		const number = baseNumber === 0 ? i + 1 : baseNumber + i;
		return `${prefix}${number.toString().padStart(2, "0")}`;
	});

	const handleValueChange = (value: string[]) => {
		field.onChange(value);
	};

	return (
		<ToggleGroup
			type="multiple"
			value={field.value}
			variant="outline"
			onValueChange={handleValueChange}
		>
			{locations.map((location) => (
				<ToggleGroupItem
					key={location}
					value={location}
					aria-label={`Select ${location}`}
					className="[&[data-state=on]]:data-state-on"
				>
					{location}
				</ToggleGroupItem>
			))}
		</ToggleGroup>
	);
};
