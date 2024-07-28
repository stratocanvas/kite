import type React from "react";
import { useState } from "react";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Check,
	ChevronDown,
	ChevronsDown,
	ChevronsUpDown,
	Plus,
	X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "react-responsive";
import { cn } from "@/lib/utils";
import { useFormContext, Controller } from "react-hook-form";
import { FormControl, FormMessage } from "../ui/form";
import { useCallback } from "react";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { hangulIncludes, acronymizeHangul, extractHangul } from "es-hangul";

interface ComboBoxProps {
	name: string;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	data: any[];
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	list: (item: any) => React.ReactNode;
	group?: string;
	label: string;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	formValue: (item: any) => any;
	multiple?: boolean;
	onChange?: (value: any) => void; // Add onChange prop to the interface
	disabled?: boolean;
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
	name,
	data,
	list,
	group,
	label,
	formValue,
	multiple,
	onChange,
	disabled,
}: ComboBoxProps) {
	const isDesktop = useMediaQuery({ query: "(min-width: 768px)" });
	const [open, setOpen] = useState(false);
	const { control } = useFormContext();
	const handleChange = useCallback(
		(
			selectedItem: ComboBoxProps["data"][number] | ComboBoxProps["data"],
			currentValue:
				| ComboBoxProps["data"][number]
				| ComboBoxProps["data"]
				| null,
		) => {
			let newValue: ComboBoxProps["data"][number] | ComboBoxProps["data"] =
				multiple ? [...currentValue] : null;
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
				onChange(newValue); // Call the onChange prop with the new value
			}
			return newValue;
		},
		[multiple, onChange], // Add onChange to the dependency array
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
								<ComboBoxContent
									value={field.value}
									onChange={(selectedItem) => {
										const newValue = handleChange(
											formValue(selectedItem),
											field.value,
										);
										field.onChange(newValue);
										if (!multiple) setOpen(false);
									}}
									data={data}
									list={list}
									group={group}
									label={label}
								/>
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
									{Array.isArray(field.value) && field.value.length > 0 && (
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
														>
															<Button
																className="w-4 h-4 text-muted-foreground"
																size="icon"
																asChild
																variant="ghost"
																onClick={() => {
																	const newValue = field.value.filter(
																		(v: { _id: string }) => v._id !== item._id,
																	);
																	field.onChange(newValue);
																}}
															>
																<X className="h-4 w-4 mr-1" />
															</Button>
															<p className="text-sm">{item.name}</p>
														</Badge>
													),
												)}
											</div>
										</>
									)}
									<ComboBoxContent
										value={field.value}
										onChange={(selectedItem) => {
											const newValue = handleChange(
												formValue(selectedItem),
												field.value,
											);
											field.onChange(newValue);
											if (!multiple) setOpen(false);
										}}
										data={data}
										list={list}
										group={group}
										label={label}
									/>
								</div>
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
	data,
	list,
	group,
	label,
}: Omit<ComboBoxProps, "name" | "formValue"> & {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	value: any;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	onChange: (value: any) => void;
}) {
	const groupedData = group
		? data.reduce(
				(acc, item) => {
					const groupValue = item[group];
					if (!acc[groupValue]) acc[groupValue] = [];
					acc[groupValue].push(item);
					return acc;
				},
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				{} as Record<string, any[]>,
		  )
		: { "": data };

	const [input, setInput] = useState("");
	return (
		<Command
			value={input}
			onValueChange={setInput}
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
				className="text-base"
				autoFocus
			/>
			<CommandList>
				<ScrollArea className="h-72">
					<CommandEmpty>검색된 {label} 없음</CommandEmpty>
					{Object.entries(groupedData).map(([groupName, items]) => (
						<CommandGroup key={groupName} heading={groupName}>
							{items.map(
								(item: {
									alias: [string];
									_id: React.Key | null | undefined;
								}) => (
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
								),
							)}
						</CommandGroup>
					))}
				</ScrollArea>
			</CommandList>
		</Command>
	);
}
