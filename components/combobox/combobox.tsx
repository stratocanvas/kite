import React, { useEffect } from "react";
import { debounce } from "es-toolkit";
import { useState } from "react";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerFooter,
	DrawerTrigger,
} from "@/components/ui/drawer";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@/components/ui/command";
import { Check, ChevronDown, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "react-responsive";
import { cn } from "@/lib/utils";
import { useFormContext, Controller } from "react-hook-form";
import { FormControl } from "../ui/form";
import { useCallback } from "react";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { hangulIncludes, acronymizeHangul, extractHangul } from "es-hangul";
import { useSearchQuery } from "@/app/api/write/search/search";
import SubForm from "@/app/write/add/forms/subform";

type ComboBoxItem = {
	_id: string;
	name: string;
	alias?: string[];
	group?: string;
	sns?: { x: string };
	date?: Date[];
	thumbnail?: string;
	image?: string;
	// other properties of the item
};
interface ComboBoxProps {
	name: string;
	search?: string;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	list: (item: any) => React.ReactNode;
	group?: string;
	label: string;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	formValue: (item: any) => any;
	multiple?: boolean;
	onChange?: (value: ComboBoxItem) => void; // Add onChange prop to the interface
	disabled?: boolean;
	predefined?: ComboBoxItem[];
	useSearchQuery?: (
		name: string,
		query: string,
	) => Promise<{ data: ComboBoxItem[]; isLoading: boolean }>;
}

/**
 * ComboBox component represents a dropdown menu with selectable options.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string} props.name - The name of the ComboBox.
 * @param {Array} props.data - The data for the ComboBox options.
 * @param {Array} props.list - The list of ComboBox options.
 * @param {boolean} props.group - Indicates whether the ComboBox options should be grouped.
 * @param {string} props.label - The label for the ComboBox.
 * @param {any} props.formValue - The form value for the ComboBox.
 * @param {boolean} props.multiple - Indicates whether multiple options can be selected.
 * @param {function} props.onChange - The callback function to handle value changes.
 * @returns {JSX.Element} The rendered ComboBox component.
 */
export default function ComboBox({
	search,
	name,
	list,
	group,
	label,
	formValue,
	multiple,
	onChange,
	disabled,
	predefined,
}: ComboBoxProps) {
	const isDesktop = useMediaQuery({ query: "(min-width: 768px)" });
	const [open, setOpen] = useState(false);
	const { control } = useFormContext();
	const handleChange = useCallback(
		(
			selectedItem: ComboBoxItem,
			currentValue: ComboBoxItem | ComboBoxItem[] | null,
		) => {
			let newValue: ComboBoxItem | ComboBoxItem[] | null = multiple
				? [...(currentValue as ComboBoxItem[])]
				: null;
			if (multiple) {
				const currentArray = Array.isArray(currentValue) ? currentValue : [];
				const itemIndex = currentArray.findIndex(
					(item) => item._id === selectedItem._id,
				);
				newValue =
					itemIndex > -1
						? currentArray.filter((_, index) => index !== itemIndex)
						: [...currentArray, selectedItem];
			} else {
				newValue = selectedItem;
			}
			if (onChange) {
				onChange(newValue as ComboBoxItem); // Call the onChange prop with the new value
			}
			return newValue;
		},
		[multiple, onChange], // Add onChange to the dependency array
	);

	const renderItem = (field) => (
		<ComboBoxContent
			type={search}
			value={field.value}
			field={field.name}
			onChange={(selectedItem) => {
				const newValue = handleChange(formValue(selectedItem), field.value);
				field.onChange(newValue);
				if (!multiple) setOpen(false);
			}}
			list={list}
			group={group}
			label={label}
			predefined={predefined}
			search={search}
		/>
	);
	return (
		<Controller
			name={name}
			control={control}
			render={({ field }) => (
				<>
					{isDesktop ? (
						<Popover open={open} onOpenChange={setOpen}>
							<PopoverTrigger asChild>
								<FormControl>
									<Button
										disabled={disabled}
										variant="outline"
										role="combobox"
										aria-expanded={open}
										className={`text-base w-full justify-between ${
											!field.value?.name && "text-muted-foreground"
										}`}
										onClick={() => setOpen(!open)}
									>
										{field.value?.name ||
											`${label} ${multiple ? "추가..." : "선택..."}`}
										{multiple ? (
											<Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
										) : (
											<ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
										)}
									</Button>
								</FormControl>
							</PopoverTrigger>

							<PopoverContent className="w-full p-0" align="start">
								{renderItem(field)}
							</PopoverContent>
						</Popover>
					) : (
						<Drawer open={open} onOpenChange={setOpen}>
							<DrawerTrigger asChild>
								<FormControl>
									<Button
										disabled={disabled}
										variant="outline"
										role="combobox"
										aria-expanded={open}
										className={`text-base w-full justify-between ${
											!field.value?.name && "text-muted-foreground"
										}`}
										onClick={() => setOpen(!open)}
									>
										{field.value?.name ||
											`${label} ${multiple ? "추가..." : "선택..."}`}
										{multiple ? (
											<Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
										) : (
											<ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
										)}
									</Button>
								</FormControl>
							</DrawerTrigger>

							<DrawerContent>
								<div className="mt-4 border-t">
									{/*multiple &&
										Array.isArray(field.value) &&
										field.value.length > 0 && (
											<>
												<Label className="text-sm text-muted-foreground ml-3">
													선택한 항목
												</Label>
												<div className="flex flex-wrap gap-1 my-1 mx-3">
													{field.value.map(
														(item: { _id: string; name: string }) => (
															<Badge
																key={item._id}
																className="flex items-center gap-1 px-2 py-1 rounded-md"
																variant="secondary"
																role="status"
															>
																<Button
																	role="button"
																	className="w-4 h-4 text-muted-foreground"
																	size="icon"
																	asChild
																	variant="ghost"
																	onClick={() => {
																		const newValue = field.value.filter(
																			(v: { _id: string }) =>
																				v._id !== item._id,
																		);
																		field.onChange(newValue);
																	}}
																>
																	<X className="h-4 w-4 mr-1" />
																</Button>
																<Label className="text-sm">{item.name}</Label>
															</Badge>
														),
													)}
												</div>
											</>
										)*/}
									{renderItem(field)}
								</div>
								<DrawerFooter className="flex flex-row gap-2 justify-between">
									{multiple &&
										Array.isArray(field.value) &&
										field.value.length > 0 && (
											<Button
												className="w-full"
												role="button"
												variant="secondary"
												onClick={() => {
													field.onChange([]);
												}}
											>
												초기화
											</Button>
										)}
									<Button
										className="w-full"
										role="button"
										onClick={() => {
											setOpen(false);
										}}
									>
										확인
									</Button>
								</DrawerFooter>
							</DrawerContent>
						</Drawer>
					)}
				</>
			)}
		/>
	);
}

function ComboBoxContent({
	value,
	onChange,
	list,
	group,
	label,
	type,
	predefined,
	search,
	field,
}: Omit<ComboBoxProps, "name" | "formValue"> & {
	field: string;
	type?: string;
	value: ComboBoxItem;
	onChange: (value: ComboBoxItem) => void;
}) {
	const [query, setQuery] = React.useState("");
	const [input, setInput] = React.useState("");

	const debouncedSetQuery = React.useCallback(debounce(setQuery, 300), []);

	useEffect(() => {
		return () => {
			debouncedSetQuery.cancel();
		};
	}, [debouncedSetQuery]);

	const { data, isLoading } = useSearchQuery(type || "", query);

	const groupedData =
		data && group
			? data.reduce(
					(acc, item) => {
						const groupValue = item[group] as string; // Ensure groupValue is a string
						if (!acc[groupValue]) acc[groupValue] = [];
						acc[groupValue].push(item);
						return acc;
					},
					{} as Record<string, ComboBoxItem[]>,
			  )
			: { "": data };

	const groupedPredefined =
		predefined && group
			? predefined.reduce(
					(acc, item) => {
						const groupValue = item[group] as string; // Ensure groupValue is a string
						if (!acc[groupValue]) acc[groupValue] = [];
						acc[groupValue].push(item);
						return acc;
					},
					{} as Record<string, ComboBoxItem[]>,
			  )
			: { "": predefined };

	return (
		<Command
			value={input}
			onValueChange={setInput}
			shouldFilter={search ? false : true}
			filter={(value, input, keywords) => {
				const extendedValue = `${value} ${keywords?.join("") ?? ""}`;
				const hangulInput = extractHangul(input);
				const acronym = acronymizeHangul(extractHangul(extendedValue)).join("");
				return extendedValue.toLowerCase().includes(input) ||
					hangulIncludes(extendedValue, input) ||
					(hangulInput && hangulIncludes(acronym, hangulInput))
					? 1
					: 0;
			}}
		>
			<CommandInput
				placeholder={`${label} 검색...`}
				className="text-base border-t-0 border-l-0 border-r-0 rounded-none text-base"
				onValueChange={search ? debouncedSetQuery : setInput}
			/>
			<CommandList>
				<ScrollArea className="h-72">
					<CommandEmpty>
						{isLoading ? (
							<div className="flex justify-center mt-2" />
						) : (
							<div className="flex flex-col gap-2 items-center">
								검색된 {label} 없음
								{search && search !== "exhibition" && (
									<SubForm type={search} field={field} />
								)}
							</div>
						)}
					</CommandEmpty>
					{predefined &&
						Object.entries(groupedPredefined).map(([groupName, items]) => (
							<CommandGroup key={groupName} heading={groupName}>
								{items?.map((item: ComboBoxItem) => (
									<CommandItem
										key={item._id}
										onSelect={() => onChange(item)}
										keywords={[`item.${groupName}`, ...(item.alias || [])]}
									>
										<Check
											className={cn(
												"mr-2 h-4 w-4",
												Array.isArray(value)
													? value.some((v) => v._id === item._id)
														? "opacity-100"
														: "opacity-0"
													: item._id === value?._id
													  ? "opacity-100"
													  : "opacity-0",
											)}
										/>
										{list(item)}
									</CommandItem>
								))}
							</CommandGroup>
						))}
					{Object.entries(groupedData).map(([groupName, items]) => (
						<CommandGroup
							key={groupName}
							heading={predefined ? `모든 ${label}` : "" || groupName}
						>
							{items?.map((item: ComboBoxItem) => (
								<CommandItem
									key={item._id}
									onSelect={() => onChange(item)}
									keywords={[`item.${groupName}`, ...(item.alias || [])]}
								>
									<Check
										className={cn(
											"mr-2 h-4 w-4",
											Array.isArray(value)
												? value.some((v) => v._id === item._id)
													? "opacity-100"
													: "opacity-0"
												: item._id === value?._id
												  ? "opacity-100"
												  : "opacity-0",
										)}
									/>
									{list(item)}
								</CommandItem>
							))}
						</CommandGroup>
					))}
				</ScrollArea>
			</CommandList>
		</Command>
	);
}
