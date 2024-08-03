"use client";
import { Plus, Search, User, X } from "lucide-react";

import {
	Command as CommandPrimitive,
	CommandEmpty,
	CommandGroup,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";
import { Command, CommandSeparator } from "cmdk";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { useSearchQuery } from "@/app/api/search/search";
import React, { useEffect, useRef } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { debounce } from "es-toolkit";
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { format } from "date-fns";

const typeMapping: Record<string, string> = {
	exhibition: "행사",
	artist: "작가",
	character: "캐릭터",
	category: "카테고리",
	genre: "장르",
};
enum Days {
	All = "all",
	Saturday = "saturday",
	Sunday = "sunday",
}
export default function SearchBar() {
	const inputRef = useRef<HTMLInputElement>(null);
	const [query, setQuery] = React.useState("");
	const { data, isLoading } = useSearchQuery(query);
	const queryClient = new QueryClient();
	const [input, setInput] = React.useState("");
	const debouncedSetQuery = React.useCallback(debounce(setQuery, 300), []);
	const [value, setValue] = React.useState<
		(string | { _id: string; type: string; name: string })[]
	>([]);
	const [date, setDate] = React.useState<Days>(Days.All);
	const handleDateChange = () => {
		setDate((prevDate) => {
			switch (prevDate) {
				case Days.All:
					return Days.Saturday;
				case Days.Saturday:
					return Days.Sunday;
				case Days.Sunday:
					return Days.All;
				default:
					return Days.All;
			}
		});
	};
	useEffect(() => {
		return () => {
			debouncedSetQuery.cancel();
		};
	}, [debouncedSetQuery]);

	return (
		<QueryClientProvider client={queryClient}>
			<CommandPrimitive
				className="rounded-lg border shadow-md w-96 md:w-[70vw] lg:w-[50vw] xl:w-[30vw]"
				shouldFilter={false}
			>
				<div className="flex flex-col w-full p-3 gap-4">
					<div className="flex flex-wrap items-center gap-2 w-full">
						<div className="flex flex-wrap gap-2 flex-grow">
							{value.map((data) => (
								<Badge
									key={data._id}
									role="status"
									variant="secondary"
									className="rounded-md"
								>
									<Button
										role="button"
										className="w-4 h-4 text-muted-foreground"
										size="icon"
										asChild
										variant="ghost"
										onClick={() =>
											setValue(value.filter((item) => item._id !== data._id))
										}
									>
										<X className="h-4 w-4 mr-1" />
									</Button>
									<Label className="text-sm">{data.name}</Label>
									<Button
										role="button"
										className="w-4 h-4 text-muted-foreground"
										size="icon"
										asChild
										variant="ghost"
									>
										<Plus className="h-4 w-4 ml-1" />
									</Button>
								</Badge>
							))}
							<div className="flex-grow min-w-[200px]">
								<Command.Input
									ref={inputRef}
									value={input}
									onValueChange={(value) => {
										debouncedSetQuery(value);
										setInput(value);
									}}
									placeholder={
										value.length === 0
											? "캐릭터, 작가, 또는 부스 이름 검색..."
											: ""
									}
									onKeyDown={(e) => {
										if (e.key === "Backspace" && input === "") {
											setValue((prevValue) => prevValue.slice(0, -1));
										}
									}}
									className="w-full focus:outline-none bg-transparent"
								/>
							</div>
						</div>
					</div>
					<div className="justify-between flex flex-row items-end">
						<div className="flex flex-row gap-2 items-end">
							<Button
								variant="secondary"
								onClick={handleDateChange}
								className={`text-sm h-7 w-14 px-2 ${
									date === Days.All
										? ""
										: date === Days.Saturday
										  ? "bg-blue-500 text-white hover:bg-blue-500"
										  : "bg-red-500 text-white hover:bg-red-500"
								}`}
							>
								{date === Days.All
									? "양일"
									: date === Days.Saturday
									  ? "토요일"
									  : "일요일"}
							</Button>
							<ToggleGroup type="multiple" variant="outline">
								<ToggleGroupItem
									value="preorder"
									className="text-sm h-7 [&[data-state=on]]:data-state-on group"
								>
									선입금
								</ToggleGroupItem>
								<ToggleGroupItem
									value="ship"
									className="text-sm h-7 [&[data-state=on]]:data-state-on group"
								>
									통판
								</ToggleGroupItem>
							</ToggleGroup>
						</div>
						<div className="flex gap-1 items-center">
							<Button className="h-7 w-7" variant="link">
								<Search className="h-4 w-4 shrink-0" />
							</Button>
						</div>
					</div>
				</div>
				<CommandList className="border-t">
					<ScrollArea
						className={
							data && data.length > 0
								? "flex max-h-48 flex-col overflow-y-auto"
								: "h-0"
						}
					>
						{data &&
							Object.entries(
								data.reduce(
									(acc, item) => {
										if (!acc[item.type]) acc[item.type] = [];
										acc[item.type].push(item);
										return acc;
									},
									{} as Record<string, typeof data>,
								),
							).map(([type, items]) => (
								<CommandGroup key={type} heading={typeMapping[type] || type}>
									{items.map((item) => (
										<CommandItem
											key={item._id}
											value={item._id}
											onSelect={() => {
												setValue((previous) => [
													...previous,
													{ _id: item._id, type: item.type, name: item.name },
												]);
												setInput("");
												if (inputRef.current) {
													inputRef.current.focus();
												}
											}}
										>
											<div className="w-full flex flex-row gap-2 items-center">
												{(type === "character" || type === "artist") && (
													<Avatar className="w-6 h-6">
														<AvatarImage
															src={item.thumbnail}
															className="w-full h-full object-cover"
														/>
														<AvatarFallback>
															<User className="h-4 w-4 text-muted-foreground" />
														</AvatarFallback>
													</Avatar>
												)}
												<div className="py-1 w-full flex flex-row justify-between items-center">
													<Label>{item.name}</Label>
													<Label className="text-sm text-muted-foreground">
														{(() => {
															switch (type) {
																case "character":
																	return item.genre?.name;
																case "artist":
																	return item.sns?.x;
																case "exhibition":
																	return `${format(
																		item.date[0],
																		"M. d",
																	)} - ${format(
																		item.date[item.date.length - 1],
																		"M. d",
																	)}`;
																default:
																	return "";
															}
														})()}
													</Label>
												</div>
											</div>
										</CommandItem>
									))}
								</CommandGroup>
							))}
					</ScrollArea>
				</CommandList>
			</CommandPrimitive>
		</QueryClientProvider>
	);
}
