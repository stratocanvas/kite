"use client";
import React, { Suspense, useEffect, useRef } from "react";
import { debounce } from "es-toolkit";
import { Command } from "cmdk";
import { nanoid } from "nanoid";
import { format } from "date-fns";
import { Check, Pencil, Plus, Search, User, X } from "lucide-react";
import {
	Command as CommandPrimitive,
	CommandGroup,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Separator } from "../ui/separator";
import { AutoComplete, type AutoCompleteResult } from "@/app/api/search/search";

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

interface SearchValueItem extends Partial<AutoCompleteResult> {
	id: string;
	chainMode: boolean;
}

interface SearchValuesProps {
	value: SearchValueItem[];
	setValue: React.Dispatch<React.SetStateAction<SearchValueItem[]>>;
	inputRef: React.RefObject<HTMLInputElement>;
}

export default function SearchBar() {
	//자동완성에 사용되는 쿼리입니다. 서버로 전송되는 내용입니다.
	const [search, setSearch] = React.useState("");

	//사용자의 입력값입니다. 검색창에 텍스트로 표시되며, Debounce 후 search로 전달됩니다.
	const [input, setInput] = React.useState("");

	//날짜 구분(양일, 토요일, 일요일)을 설정합니다.
	const [date, setDate] = React.useState<Days>(Days.All);

	//booth 검색을 위한 쿼리를 저장합니다. 검색창에 Badge로 표시되며, helper 함수를 통해 실제 쿼리로 변환됩니다.
	const [query, setQuery] = React.useState<SearchValueItem[]>([]);

	//검색창에 포커스를 주기 위한 ref입니다.
	const inputRef = useRef<HTMLInputElement>(null);

	//자동완성 결과를 가져옵니다.
	const { data } = AutoComplete(search);

	//input에 debounce를 적용하여 search로 전달합니다.
	const debouncedSetSearch = React.useCallback(debounce(setSearch, 300), []);

	//날짜 구분을 변경합니다
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

	//컴포넌트가 언마운트될 때 debounce 함수를 취소해 불필요한 호출을 방지합니다.
	useEffect(() => {
		return () => {
			debouncedSetSearch.cancel();
		};
	}, [debouncedSetSearch]);

	return (
		<CommandPrimitive
			className="rounded-lg border shadow-md w-96 md:w-[70vw] lg:w-[50vw] xl:w-[30vw]"
			shouldFilter={false}
		>
			<div className="flex flex-col w-full p-3 gap-4">
				<div className="flex flex-wrap items-center gap-2 w-full">
					<div className="flex flex-wrap gap-2 flex-grow">
						<SearchValues
							value={query}
							setValue={setQuery}
							inputRef={inputRef}
						/>
						<div className="flex-grow min-w-[200px]">
							<Suspense>
								<Command.Input
									ref={inputRef}
									value={input}
									onValueChange={(value) => {
										debouncedSetSearch(value);
										setInput(value);
									}}
									placeholder={
										query.length === 0
											? "캐릭터, 작가, 또는 부스 이름 검색..."
											: ""
									}
									onKeyDown={(e) => {
										if (e.key === "Backspace" && input === "") {
											setQuery((prevValue) => prevValue.slice(0, -1));
										}
									}}
									className="w-full focus:outline-none bg-transparent"
								/>
							</Suspense>
						</div>
					</div>
				</div>
				<SearchFilters date={date} handleDateChange={handleDateChange} />
			</div>
			<CommandList className="border-t">
				<ScrollArea
					className={
						data && data.length > 0
							? "flex max-h-48 flex-col overflow-y-auto"
							: "h-0"
					}
				>
					<AutoCompleteResults
						data={data}
						setValue={setQuery}
						setInput={setInput}
					/>
				</ScrollArea>
			</CommandList>
		</CommandPrimitive>
	);
}

const SearchValues: React.FC<SearchValuesProps> = ({
	value,
	setValue,
	inputRef,
}) => {
	// 주어진 id를 가진 항목을 value 배열에서 제거합니다.
	const handleRemove = (id: string) => {
		setValue(value.filter((item) => item.id !== id));
	};

	// 주어진 id를 가진 항목의 chainMode 값을 토글하고, 다른 항목들의 chainMode 값을 false로 설정합니다.
	const handleChainMode = (id: string) => {
		// setValue 함수를 사용하여 상태를 업데이트합니다.
		setValue((prevValue) =>
			// 이전 상태의 value 배열을 순회합니다.
			prevValue.map((item) => {
				// 현재 항목의 id가 주어진 id와 일치하는 경우
				if (item.id === id) {
					// chainMode 값을 토글합니다.
					return { ...item, chainMode: !item.chainMode };
				}
				// 일치하지 않는 경우, chainMode 값을 false로 설정합니다.
				return { ...item, chainMode: false };
			}),
		);
		// 검색창에 포커스를 줍니다.
		if (inputRef.current) {
			inputRef.current.focus();
		}
	};

	// 주어진 항목에서 id와 chainMode를 제외한 속성의 개수를 반환합니다.
	const getItemCount = (item: SearchValueItem) => {
		return Object.keys(item).filter(
			(key) => key !== "id" && key !== "chainMode",
		).length;
	};

	return (
		<>
			{value.map((item) => (
				<div key={item.id} className="flex items-center gap-2">
					<Badge
						role="status"
						variant={item.chainMode ? "default" : "secondary"}
						className="flex items-center gap-1 rounded-md"
					>
						<Button
							role="button"
							className="w-4 h-4 text-muted-foreground"
							size="icon"
							variant="link"
							onClick={() => handleRemove(item.id)}
						>
							<X className="h-4 w-4 mr-1 shrink-0" />
						</Button>
						<span className="text-sm flex items-center">
							{Object.entries(item)
								// id와 chainMode를 제외한 항목들을 필터링합니다.
								.filter(([key]) => key !== "id" && key !== "chainMode")
								// 필터링된 항목들을 순회하며 React Fragment로 렌더링합니다.
								.map(([key, value], index, array) => (
									<React.Fragment key={key}>
										{/* 각 항목의 name 속성을 표시합니다. */}
										{(value as AutoCompleteResult).name}
										{/* 마지막 항목이 아닌 경우, 수직 구분선을 표시합니다. */}
										{index < array.length - 1 && (
											<Separator orientation="vertical" className="mx-2 h-4" />
										)}
									</React.Fragment>
								))}
						</span>
						<Separator orientation="vertical" />
						<Button
							role="button"
							className="w-4 h-4 text-muted-foreground"
							size="icon"
							variant="link"
							onClick={() => handleChainMode(item.id)}
						>
							{item.chainMode ? (
								// item의 chainMode가 true인 경우, Check 아이콘을 표시합니다.
								<Check className="h-4 w-4 ml-1 shrink-0" />
							) : (
								<>
									{getItemCount(item) > 1 ? (
										// item의 속성 개수가 1보다 큰 경우, Pencil 아이콘을 표시합니다.
										<Pencil className="h-4 w-4 ml-1 shrink-0" />
									) : (
										// item의 속성 개수가 1 이하인 경우, Plus 아이콘을 표시합니다.
										<Plus className="h-4 w-4 ml-1 shrink-0" />
									)}
								</>
							)}
						</Button>
					</Badge>
				</div>
			))}
		</>
	);
};

interface SearchFiltersProps {
	date: Days;
	handleDateChange: () => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
	date,
	handleDateChange,
}) => {
	return (
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
	);
};

interface AutoCompleteResultsProps {
	data: AutoCompleteResult[] | undefined;
	setValue: React.Dispatch<React.SetStateAction<SearchValueItem[]>>;
	setInput: React.Dispatch<React.SetStateAction<string>>;
}

const AutoCompleteResults: React.FC<AutoCompleteResultsProps> = ({
	data,
	setValue,
	setInput,
}) => {
	if (!data || data.length === 0) return null;

	// data 배열을 type값을 기준으로 그룹화합니다.
	const groupedData = data.reduce(
		(acc, item) => {
			// acc 객체에 item.type이 없으면 빈 배열을 생성합니다.
			if (!acc[item.type]) acc[item.type] = [];
			// item을 해당 type 배열에 추가합니다.
			acc[item.type].push(item);
			return acc;
		},
		{} as Record<string, AutoCompleteResult[]>,
	);

	// 항목을 선택했을 때 호출되는 함수입니다.
	const handleSelect = (type: string, item: AutoCompleteResult) => {
		setValue((previous) => {
			// chainMode가 true인 항목을 찾습니다.
			const chainModeItem = previous.find((prevItem) => prevItem.chainMode);

			if (chainModeItem) {
				// chainMode가 true인 항목이 있으면 해당 항목의 type 속성을 업데이트합니다.
				return previous.map((prevItem) =>
					prevItem.chainMode
						? { ...prevItem, [type]: { _id: item._id, name: item.name } }
						: prevItem,
				);
			}
			// chainMode가 true인 항목이 없으면 새로운 항목을 생성합니다.
			const newValue: SearchValueItem = {
				id: nanoid(),
				chainMode: false,
				[type]: { _id: item._id, name: item.name },
			};
			return [...previous, newValue];
		});
		// 입력 필드를 초기화합니다.
		setInput("");
	};

	return (
		<>
			{Object.entries(groupedData).map(([type, items]) => (
				<CommandGroup key={type} heading={typeMapping[type] || type}>
					{items.map((item) => (
						<CommandItem
							key={item._id}
							value={item._id}
							onSelect={() => handleSelect(type, item)}
						>
							<AutoCompleteResultItem item={item} type={type} />
						</CommandItem>
					))}
				</CommandGroup>
			))}
		</>
	);
};

const AutoCompleteResultItem: React.FC<{
	item: AutoCompleteResult;
	type: string;
}> = ({ item, type }) => {
	return (
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
								if (item.date && item.date.length > 0) {
									return `${format(item.date[0], "M. d")} - ${format(
										item.date[item.date.length - 1],
										"M. d",
									)}`;
								}
								return "";
							default:
								return "";
						}
					})()}
				</Label>
			</div>
		</div>
	);
};
