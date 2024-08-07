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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TriangleAlert } from "lucide-react";
interface LocationState {
	inputValue: string;
	setInputValue: (value: string) => void;
}

const useLocationStore = create<LocationState>((set) => ({
	inputValue: "",
	setInputValue: (value) => set({ inputValue: value }),
}));

export default function BasicForm() {
	//행사가 변경되었을 때 날짜 초기화
	const { control, watch, setValue, getValues } = useFormContext();
	const { dirtyFields } = useFormState();
	const { inputValue, setInputValue } = useLocationStore();
	const location = watch("location");
	const shouldShowAlert = location.some((date: string) =>
		date.startsWith("Ad"),
	);

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
										search="exhibition"
										list={(item) => (
											<div className="flex flex-col">
												<p>{item.name}</p>
												<p className="text-sm text-muted-foreground">
													{item.date.length > 0 && (
														<div>
															{`${format(
																item.date[0],
																"yyyy년 M월 d일",
															)} - ${format(
																item.date[item.date.length - 1],
																"yyyy년 M월 d일",
															)}`}
														</div>
													)}
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
									{(watch("exhibition")?.date || field.value)?.map(
										(date: string) => (
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
														{format(new Date(date), "yyyy. M. d", {
															locale: ko,
														})}
													</div>
												</div>
											</ToggleGroupItem>
										),
									)}
								</ToggleGroup>
							</FormControl>
							<FormMessage />
							<FormDescription>
								{getValues("exhibition") === undefined
									? "행사를 먼저 선택해 주세요"
									: "참가할 날짜를 모두 선택해 주세요"}
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
								/>
							</FormControl>
							<div className="flex gap-2 mt-2">
								{LocationButtons(inputValue, field, 4)}
							</div>

							{shouldShowAlert && (
								<Alert>
									<TriangleAlert className="h-4 w-4" />
									<AlertTitle>연령 제한 부스</AlertTitle>
									<AlertDescription>
										이 부스는 성인인증을 마친 사람들에게만 표시돼요
									</AlertDescription>
								</Alert>
							)}
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
										search="artist"
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
											sns: { x: item.sns.x },
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

	const displayLocations = inputValue ? locations : field.value;

	return (
		<ToggleGroup
			type="multiple"
			value={field.value}
			variant="outline"
			onValueChange={handleValueChange}
		>
			{displayLocations.map((location: string) => (
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
