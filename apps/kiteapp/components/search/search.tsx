"use client";
import React, {
	Suspense,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { debounce } from "es-toolkit";
import { Command } from "cmdk";
import { nanoid } from "nanoid";
import { format } from "date-fns";
import {
	Check,
	CornerDownLeft,
	Pencil,
	Plus,
	Search,
	ShoppingBag,
	Truck,
	User,
	X,
} from "lucide-react";
import {
	Command as CommandPrimitive,
	CommandGroup,
	CommandItem,
	CommandList,
	CommandShortcut,
} from "@/components/ui/command";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Separator } from "../ui/separator";
import { AutoComplete, type AutoCompleteResult } from "@/app/api/search/search";
import useQueryStore, { type InputItem } from "@/store/searchquery";
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useMediaQuery } from "react-responsive";
import { Drawer, DrawerContent, DrawerTrigger } from "../ui/drawer";

const typeMapping: Record<string, string> = {
	exhibition: "행사",
	artist: "작가",
	character: "캐릭터",
	category: "카테고리",
	genre: "장르",
};

enum Days {
	All = 0,
	Saturday = 7,
	Sunday = 1,
}

interface SearchValueItem extends Partial<AutoCompleteResult> {
	id: string;
	chainMode: boolean;
}

interface SearchValuesProps {
	value: InputItem[];
	setValue: React.Dispatch<React.SetStateAction<InputItem[]>>;
	inputRef?: React.RefObject<HTMLInputElement>;
	minified?: boolean;
}

/**
 * 
 * @param minified: 미니 모드 사용여부. 미니 모드에서는 검색창을 눌러야 각종 옵션이 표시됨. 
 * @returns base64 검색 쿼리를 SearchParams로 전달
 */
export default function SearchBar({ minified }: { minified?: boolean }) {
	//자동완성에 사용되는 쿼리입니다. 서버로 전송되는 내용입니다.
	const [search, setSearch] = React.useState("");

	//사용자의 입력값입니다. 검색창에 텍스트로 표시되며, Debounce 후 search로 전달됩니다.
	const [input, setInput] = React.useState("");

	//booth 검색을 위한 쿼리를 저장합니다. 검색창에 Badge로 표시되며, helper 함수를 통해 실제 쿼리로 변환됩니다.
	const { queryInput, setQueryInput } = useQueryStore();

	//검색창에 포커스를 주기 위한 ref입니다.
	const inputRef = useRef<HTMLInputElement>(null);

	//자동완성 결과를 가져옵니다.
	const { data } = AutoComplete(search);

	const [open, setOpen] = React.useState(false);

	//input에 debounce를 적용하여 search로 전달합니다.
	const debouncedSetSearch = React.useCallback(debounce(setSearch, 300), []);

	//컴포넌트가 언마운트될 때 debounce 함수를 취소해 불필요한 호출을 방지합니다.
	useEffect(() => {
		return () => {
			debouncedSetSearch.cancel();
		};
	}, [debouncedSetSearch]);

	const isDesktop = useMediaQuery({ query: "(min-width: 768px)" });

	/**
	 * 부스 페이지에서 검색창을 여는 버튼
	 */
	const TriggerButton = (
		<Button
			variant="outline"
			className="w-full rounded-lg border shadow-lg items-center justify-start"
		>
			<Search className="text-muted-foreground h-4 w-4 mr-2 shrink-0" />
			<div
				className={`w-full flex gap-2 overflow-hidden transition-all duration-300 items-center ease-in-out${
					open
						? "max-h-0 opacity-0 translate-y-full"
						: "max-h-10 opacity-100 translate-y-0"
				}`}
			>
				<div>
					{queryInput.map((item, index) => (
						<div key={index} className="flex gap-2">
							{item.date !== undefined && item.date !== 0 && (
								<Badge
									role="status"
									variant="secondary"
									className={`rounded-md ${
										item.date === 1
											? "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-500 hover:bg-red-100 hover:dark:bg-red-900"
											: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-500 hover:bg-blue-100 hover:dark:bg-blue-900"
									}`}
								>
									<Label className="text-sm flex items-center">
										{item.date === 1 ? "일" : "토"}
									</Label>
								</Badge>
							)}
							{item.buy && item.buy.length !== 0 && (
								<Badge role="status" variant="secondary" className="rounded-md">
									<div className="flex gap-1 items-center">
										{item.buy.includes("preorder") && (
											<ShoppingBag className="h-4 w-4" />
										)}

										{item.buy.length === 2 && (
											<Separator orientation="vertical" className="mx-1 h-4" />
										)}
										{item.buy.includes("ship") && <Truck className="h-4 w-4" />}
									</div>
								</Badge>
							)}
						</div>
					))}
				</div>
				<SearchValues value={queryInput} setValue={setQueryInput} minified />
			</div>
		</Button>
	);

	/**
	 * 부스 페이지 검색창에 표시될 내용
	 */
	const CommandContent = (
		<CommandPrimitive shouldFilter={false}>
			<div className="flex flex-col w-full p-3 gap-4">
				{minified && !isDesktop && (
					<ScrollArea className="flex max-h-20 flex-col overflow-y-auto">
						<div className="flex flex-wrap gap-2 flex-grow">
							<SearchValues
								value={queryInput}
								setValue={setQueryInput}
								inputRef={inputRef}
							/>
						</div>
					</ScrollArea>
				)}
				<div className="flex flex-wrap items-center gap-2 w-full">
					<div className="flex flex-wrap gap-2 flex-grow">
						{!(minified && !isDesktop) && (
							<SearchValues
								value={queryInput}
								setValue={setQueryInput}
								inputRef={inputRef}
							/>
						)}
						<div className="flex-grow">
							<Suspense>
								<Command.Input
									ref={inputRef}
									value={input}
									onValueChange={(value) => {
										debouncedSetSearch(value);
										setInput(value);
									}}
									placeholder={
										queryInput.filter((item) => item.id !== undefined)
											.length === 0
											? "캐릭터, 작가, 또는 부스 이름 검색..."
											: ""
									}
									onKeyDown={(e) => {
										if (e.key === "Backspace" && input === "") {
											setQueryInput((prevValue) => {
												const lastItem = prevValue[prevValue.length - 1];
												if (lastItem && lastItem.id !== undefined) {
													return prevValue.slice(0, -1);
												}
												return prevValue;
											});
										}
									}}
									className="w-full focus:outline-none bg-transparent"
								/>
							</Suspense>
						</div>
					</div>
				</div>
				<SearchFilters setOpen={setOpen} />
			</div>
			<CommandList className="border-t">
				<ScrollArea
					className={
						minified && !isDesktop
							? "h-36"
							: data && data.length > 0
							  ? "flex max-h-48 flex-col overflow-y-auto"
							  : "h-0"
					}
				>
					<AutoCompleteResults
						data={data}
						setValue={setQueryInput}
						setInput={setInput}
					/>
				</ScrollArea>
			</CommandList>
		</CommandPrimitive>
	);

	return (
		<>
			{minified ? (
				isDesktop ? (
					<Popover open={open} onOpenChange={setOpen}>
						<PopoverTrigger asChild>{TriggerButton}</PopoverTrigger>
						<PopoverContent className="p-0 rounded-lg w-full PopoverContent">
							{CommandContent}
						</PopoverContent>
					</Popover>
				) : (
					<>
						<Drawer open={open} onOpenChange={setOpen}>
							<DrawerTrigger asChild>{TriggerButton}</DrawerTrigger>
							<DrawerContent>{CommandContent}</DrawerContent>
						</Drawer>
					</>
				)
			) : (
				<>
					<div className="rounded-lg border shadow-md md:shadow-xl w-full">
						{CommandContent}
					</div>
				</>
			)}
		</>
	);
}

/**
 * 사용자가 검색할 값을 미리보기로 표시합니다.
 * @param value 사용자의 검색어
 * @param setValue 사용자의 검색어 저장
 * @param inputRef 검색창 포커스를 위한 ref
 * @param minified 미니 모드 사용여부 
 * @returns 
 */
const SearchValues = ({
	value,
	setValue,
	inputRef,
	minified,
}: SearchValuesProps) => {

	/**
	 *  주어진 id를 가진 항목을 value 배열에서 제거합니다.
	 * */ 
	const handleRemove = (id: string) => {
		setValue(value.filter((item) => item.id !== id));
	};

	/**
	 * chainMode: 한 검색 태그 블록 내 여러 검색어를 지정하여 AND 조건 검색을 가능하게 합니다. 
	 * 주어진 id를 가진 항목의 chainMode 값을 토글하고, 다른 항목들의 chainMode 값을 false로 설정합니다.
	 * @param 검색어의 id. 검색 태그 블록마다 고유의 무작위 id를 갖습니다. 
	 */ 
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
		if (inputRef?.current) {
			inputRef.current.focus();
		}
	};

	/**
	 * 한 검색 태그 블록 내 검색어 수를 반환합니다. 
	 * @param item 검색창 항목
	 * @returns 검색어 수
	 */
	const getItemCount = (item: SearchValueItem) => {
		return Object.keys(item).filter(
			(key) => key !== "id" && key !== "chainMode",
		).length;
	};

	return (
		<>
			{value
				.filter((item) => item.id !== undefined) // Filter out items without an id
				.map((item) => (
					<div key={item.id} className="flex items-center gap-2">
						<Badge
							role="status"
							variant={item.chainMode ? "default" : "secondary"}
							className="flex items-center gap-1 rounded-md"
						>
							{!minified && (
								<Button
									role="button"
									className="w-4 h-4 text-muted-foreground"
									size="icon"
									variant="link"
									onClick={() => handleRemove(item.id)}
								>
									<X className="h-4 w-4 mr-1 shrink-0" />
								</Button>
							)}
							<Label className="text-sm flex items-center">
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
												<Separator
													orientation="vertical"
													className="mx-2 h-4"
												/>
											)}
										</React.Fragment>
									))}
							</Label>
							<Separator orientation="vertical" />
							{!minified && (
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
							)}
						</Badge>
					</div>
				))}
		</>
	);
};

interface SearchFiltersProps {
	setOpen?: (open: boolean) => void;
}

/**
 * 요일, 구매 옵션 조건을 처리하고 실제 검색을 수행합니다.
 * @param setOpen 검색 수행시 검색창을 닫기 위한 부분입니다.
 * @returns 
 */
const SearchFilters = ({ setOpen }: SearchFiltersProps) => {
	const router = useRouter();
	const { queryInput, setQueryInput } = useQueryStore();

	const getFilterValues = useCallback(() => {
		const filterItem = queryInput.find(
			(item) => "date" in item || "buy" in item,
		);
		return {
			date: filterItem?.date ?? Days.All,
			buy: filterItem?.buy ?? [],
		};
	}, [queryInput]);

	const { date, buy } = getFilterValues();

	const updateQueryInput = useCallback(
		(newDate: Days, newBuy: string[]) => {
			setQueryInput((prev) => {
				const filterIndex = prev.findIndex(
					(item) => "date" in item || "buy" in item,
				);
				const newFilter = {
					date: newDate,
					buy: newBuy,
				};

				if (filterIndex >= 0) {
					return [
						...prev.slice(0, filterIndex),
						newFilter,
						...prev.slice(filterIndex + 1),
					];
				}
				return [...prev, newFilter];
			});
		},
		[setQueryInput],
	);
	/**
	 * 요일 조건을 처리합니다.
	 */
	const handleDateChange = useCallback(() => {
		const newDate =
			date === Days.All
				? Days.Saturday
				: date === Days.Saturday
				  ? Days.Sunday
				  : Days.All;
		updateQueryInput(newDate, buy);
	}, [date, buy, updateQueryInput]);

	/**
	 * 구매 옵션 조건을 처리합니다.
	 */
	const handleBuyOptionsChange = useCallback(
		(value: string[]) => {
			updateQueryInput(date, value);
		},
		[date, updateQueryInput],
	);

	/**
	 * 검색을 수행합니다.
	 */
	const handleSearch = useCallback(() => {
		/**
		 * 검색어 항목을 제거합니다.
		 * @param obj 
		 * @returns 
		 */
		const removeFields = (obj: Record<string, any>) => {
			const newObj = { ...obj };
			for (const key in newObj) {
				if (key === "name" || key === "chainMode") {
					delete newObj[key];
				} else if (typeof newObj[key] === "object" && newObj[key] !== null) {
					newObj[key] = removeFields(newObj[key]);
				}
			}
			return newObj;
		};

		/**
		 * 사용자의 검색 쿼리를 searchParams로 변환하여 실제 검색이 이루어지게 합니다.
		 * @param 검색어
		 * @returns searchParams
		 */
		const transformQueryInput = (input: InputItem | InputItem[]) => {
			const inputArray = Array.isArray(input) ? input : [input];
			return inputArray.map((item) => removeFields(item));
		};

		if (
			queryInput &&
			(Array.isArray(queryInput) ? queryInput.length > 0 : true)
		) {
			const transformedQueryInput = transformQueryInput(queryInput);
			const queryString = encodeURIComponent(
				JSON.stringify(transformedQueryInput),
			);
			router.push(`/booth?q=${queryString}`);
		} else {
			router.push("/booth");
		}
	}, [queryInput, router]);

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				handleSearch();
				if (setOpen) {
					setOpen(false);
				}
			}}
		>
			<div className="justify-between flex flex-row items-end">
				<div className="flex flex-row gap-2 items-end">
					<Button
						variant="secondary"
						type="button"
						onClick={() => {
							handleDateChange();
						}}
						className={`text-sm h-7 w-14 px-2 ${
							date === Days.All
								? "text-muted-foreground"
								: date === Days.Saturday
								  ? "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-500 hover:bg-blue-100 hover:dark:bg-blue-900"
								  : "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-500 hover:bg-red-100 hover:dark:bg-red-900"
						}`}
					>
						{date === Days.All
							? "요일"
							: date === Days.Saturday
							  ? "토요일"
							  : "일요일"}
					</Button>
					<ToggleGroup
						type="multiple"
						variant="outline"
						value={buy}
						onValueChange={handleBuyOptionsChange}
					>
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
					<Button type="submit" className="h-7 w-7" variant="ghost">
						<Search className="h-4 w-4 shrink-0" />
					</Button>
				</div>
			</div>
		</form>
	);
};

interface AutoCompleteResultsProps {
	data: AutoCompleteResult[] | undefined;
	setValue: React.Dispatch<React.SetStateAction<InputItem[]>>;
	setInput: React.Dispatch<React.SetStateAction<string>>;
}

/**
 * 검색어 자동완성 결과입니다.
 * @param data 사용자의 입력값에 따른 자동완성 결과 원본입니다. 
 * @param setValue 사용자가 최종적으로 검색할 항목
 * @param setInput 사용자의 입력값
 * @returns 자동완성 항목들
 */
const AutoCompleteResults = ({
	data,
	setValue,
	setInput,
}: AutoCompleteResultsProps) => {
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

	/**
	 * 자동완성 목록 내 항목을 선택했을때 호출되는 함수입니다.
	 * chainMode가 켜진 경우 해당 태그 블록 내에, 그렇지 않은 경우 새로운 태그 블록을 추가합니다.
	 * 또한, chainMode가 켜진 경우 한 태그 블록 내에 동일한 type이 이미 존재하는 경우 새로운 항목으로 대체합니다.
	 * @param type 검색어 종류. 
	 * @param item 검색어 항목. 태그 블록에 실제로 표시되는 내용입니다.
	 */
	const handleSelect = (type: string, item: AutoCompleteResult) => {
		setValue((previous) => {
			const chainModeItem = previous.find((prevItem) => prevItem.chainMode);

			if (chainModeItem) {
				return previous.map((prevItem) =>
					prevItem.chainMode
						? { ...prevItem, [type]: { _id: item._id, name: item.name } }
						: prevItem,
				);
			}
			const newValue: InputItem = {
				id: nanoid(),
				chainMode: false,
				[type]: { _id: item._id, name: item.name },
			};
			return [...previous, newValue];
		});
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

/**
 * 검색어 자동완성 결과 내 항목입니다.
 * @param item 검색어 항목. 검색결과 항목에 실제로 표시되는 내용입니다.
 * @param type 검색어 종류. 검색어 종류에 따라 레이아웃이 결정됩니다. 
 * @returns 자동완성 결과 개별 항목
 */
const AutoCompleteResultItem = ({
	item,
	type,
}: { item: AutoCompleteResult; type: string }) => {
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
