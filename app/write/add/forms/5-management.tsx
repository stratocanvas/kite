"use client";
import { useFormContext, useFieldArray } from "react-hook-form";
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleHelp, Package, Plus, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import CryptoJS from "crypto-js";
import { useActiveTabStore } from "@/store/addform";
import { Badge } from "@/components/ui/badge";
import { useMediaQuery } from "react-responsive";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { NumericFormat, PatternFormat } from "react-number-format";
import ComboBox from "@/components/combobox/combobox";
const bank: { _id: string; name: string; group: string; pattern?: string }[] = [
	{
		_id: "경남",
		name: "경남은행",
		group: "은행",
	},
	{
		_id: "광주",
		name: "광주은행",
		group: "은행",
	},
	{
		_id: "단위농협",
		name: "단위농협(지역농축협)",
		group: "은행",
	},
	{
		_id: "부산",
		name: "부산은행",
		group: "은행",
	},
	{
		_id: "새마을",
		name: "새마을금고",
		group: "은행",
	},
	{
		_id: "산림",
		name: "산림조합",
		group: "은행",
	},
	{
		_id: "신한",
		name: "신한은행",
		group: "은행",
	},
	{
		_id: "신협",
		name: "신협",
		group: "은행",
	},
	{
		_id: "씨티",
		name: "씨티은행",
		group: "은행",
	},
	{
		_id: "우리",
		name: "우리은행",
		group: "은행",
	},
	{
		_id: "우체국",
		name: "우체국예금보험",
		group: "은행",
	},
	{
		_id: "저축",
		name: "저축은행중앙회",
		group: "은행",
	},
	{
		_id: "전북",
		name: "전북은행",
		group: "은행",
	},
	{
		_id: "제주",
		name: "제주은행",
		group: "은행",
	},
	{
		_id: "카카오",
		name: "카카오뱅크",
		group: "은행",
	},
	{
		_id: "케이",
		name: "케이뱅크",
		group: "은행",
	},
	{
		_id: "토스",
		name: "토스뱅크",
		group: "은행",
	},
	{
		_id: "하나",
		name: "하나은행",
		group: "은행",
	},
	{
		_id: "기업",
		name: "IBK기업은행",
		group: "은행",
	},
	{
		_id: "국민",
		name: "KB국민은행",
		group: "은행",
	},
	{
		_id: "대구",
		name: "DGB대구은행",
		group: "은행",
	},
	{
		_id: "산업",
		name: "KDB산업은행",
		group: "은행",
	},
	{
		_id: "농협",
		name: "NH농협은행",
		group: "은행",
	},
	{
		_id: "SC제일",
		name: "SC제일은행",
		group: "은행",
	},
	{
		_id: "수협",
		name: "Sh수협은행",
		group: "은행",
	},
] as const;
const ObjectId = (): string => {
	const timestamp = Math.floor(new Date().getTime() / 1000)
		.toString(16)
		.padStart(8, "0");
	const randomPart = CryptoJS.lib.WordArray.random(8).toString(
		CryptoJS.enc.Hex,
	);

	return timestamp + randomPart;
};

export default function ManagementForm() {
	return (
		<>
			<div className="flex flex-col space-y-6">
				<DepositField />
				<POSField />
				<ContentProtectionField />
			</div>
		</>
	);
}

//FIELDS

function DepositField() {
	const { control, getValues } = useFormContext();
	const active = getValues("deposit.enabled");
	return (
		<>
			<div className="flex items-center gap-2">
				<FormLabel className="text-lg">송금</FormLabel>
				<Badge variant="secondary">베타</Badge>
				<HelpTooltip content="계좌번호를 등록하면 장바구니에서 토스 앱으로 빠르게 송금할 수 있어요. 장바구니 금액도 자동으로 입력돼요." />
			</div>
			<Card className="w-full md:w-96 h-full">
				<CardContent className="space-y-4 mt-4">
					<FormField
						control={control}
						name="deposit.enabled"
						render={({ field }) => (
							<FormItem className="flex flex-row items-center justify-between">
								<FormLabel className="text-base mt-2">송금 받기</FormLabel>
								<FormControl>
									<Switch
										checked={field.value}
										onCheckedChange={field.onChange}
									/>
								</FormControl>
							</FormItem>
						)}
					/>
					<FormField
						control={control}
						name="deposit.account.number"
						render={({ field }) => (
							<FormItem>
								<FormLabel className={!active ? "text-muted-foreground" : ""}>
									계좌번호
								</FormLabel>
								<FormControl>
									<NumericFormat
										disabled={!active}
										className="text-base"
										allowNegative={false}
										inputMode="numeric"
										valueIsNumericString={true}
										customInput={Input}
										autoComplete="off"
										value={field.value}
										placeholder="- 제외하고 숫자만 입력"
										onValueChange={(values) => {
											field.onChange(values.floatValue);
										}}
									/>
								</FormControl>{" "}
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={control}
						name="deposit.account.bank"
						render={({ field }) => (
							<FormItem>
								<FormLabel className={!active ? "text-muted-foreground" : ""}>
									은행
								</FormLabel>
								<FormControl>
									<ComboBox
										disabled={!active}
										name={field.name}
										predefined={bank}
										list={(item) => (
											<div className="flex flex-col">
												<p>{item.name}</p>
											</div>
										)}
										label="은행"
										formValue={(item) => ({
											_id: item._id,
											name: item.name,
											pattern: item.pattern,
										})}
										group="group"
										multiple={false}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={control}
						name="deposit.account.holder"
						render={({ field }) => (
							<FormItem>
								<FormLabel className={!active ? "text-muted-foreground" : ""}>
									예금주
								</FormLabel>
								<FormControl>
									<Input
										{...field}
										autoComplete="off"
										className="text-base"
										disabled={!active}
									/>
								</FormControl>{" "}
								<FormMessage />
							</FormItem>
						)}
					/>
				</CardContent>
			</Card>
		</>
	);
}

function POSField() {
	const { control, getValues, watch } = useFormContext();
	const active = watch("pos.enabled");
	const level = watch("pos.displayLevel");
	const { setActiveTab } = useActiveTabStore();
	enum TabValue {
		Basic = "basic",
		Info = "info",
		Goods = "goods",
		Etc = "etc",
		Management = "management",
	}
	return (
		<>
			<div className="flex flex-row gap-2 items-center mt-2">
				<FormLabel className="text-lg">POS</FormLabel>
				<Badge variant="secondary">지원 예정</Badge>
				<HelpTooltip content="굿즈 거래와 재고를 관리하고, 재고 현황을 참가자들에게 보여줄 수 있어요." />
			</div>
			<Card className="w-full md:w-96 h-full">
				<CardContent className="space-y-6 mt-4">
					<FormField
						control={control}
						name="pos.enabled"
						render={({ field }) => (
							<FormItem className="flex flex-row items-center justify-between">
								<FormLabel className="text-base mt-2">POS 사용</FormLabel>

								<FormControl>
									<Switch
										disabled
										checked={field.value}
										onCheckedChange={field.onChange}
									/>
								</FormControl>
							</FormItem>
						)}
					/>
					{active && (
						<Alert className="bg-muted">
							<Package className="h-4 w-4" />
							<AlertTitle>재고 정보를 입력해주세요.</AlertTitle>
							<AlertDescription>
								POS를 사용하려면 굿즈의 재고 정보가 필요해요. 아직 확정되지
								않았다면 나중에 입력할 수 있어요.
							</AlertDescription>
							<Button
								className="w-full mt-4"
								size="sm"
								type="button"
								onClick={() => {
									setActiveTab(TabValue.Goods);
								}}
							>
								재고 정보 입력하기
							</Button>
						</Alert>
					)}
					<FormField
						control={control}
						name="pos.displayLevel"
						render={({ field }) => (
							<FormItem>
								<FormLabel className={!active ? "text-muted-foreground" : ""}>
									재고 현황 표시
								</FormLabel>
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value}
								>
									<FormControl className="w-full">
										<SelectTrigger className="text-base" disabled={!active}>
											<SelectValue
												placeholder="선택하세요"
												className="text-base"
											/>
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value="secret">
											<p>비공개</p>
										</SelectItem>
										<SelectItem value="approx">
											<p>대략적인 재고</p>
										</SelectItem>
										<SelectItem value="exact">
											<p>정확한 재고</p>
										</SelectItem>
									</SelectContent>
								</Select>
								<FormDescription>
									{active && (
										<>
											{level === "secret" &&
												"참가자에게 재고 현황을 표시하지 않아요."}
											{level === "approx" &&
												`"재고 있음", "매진 임박", "매진" 등으로 재고 현황을 대략적으로 표시해요.`}
											{level === "exact" && "정확한 재고 수량을 표시해요."}
										</>
									)}
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
				</CardContent>
			</Card>
		</>
	);
}

function ContentProtectionField() {
	const { control, getValues, watch } = useFormContext();
	const active = watch("watermark.enabled");
	enum TabValue {
		Basic = "basic",
		Info = "info",
		Goods = "goods",
		Etc = "etc",
		Management = "management",
	}
	return (
		<>
			<div className="flex flex-row gap-2 items-center mt-2">
				<FormLabel className="text-lg">컨텐츠 저작권 보호</FormLabel>
			</div>
			<Card className="w-full md:w-96 h-full">
				<CardContent className="space-y-6 mt-4">
					<FormField
						control={control}
						name="watermark.enabled"
						render={({ field }) => (
							<FormItem className="flex flex-row items-center justify-between">
								<FormLabel className="text-base mt-2">
									이미지 워터마크
								</FormLabel>

								<FormControl>
									<Switch
										checked={field.value}
										onCheckedChange={field.onChange}
									/>
								</FormControl>
							</FormItem>
						)}
					/>
					<FormField
						control={control}
						name="watermark.range"
						render={({ field }) => (
							<FormItem>
								<FormLabel className={!active ? "text-muted-foreground" : ""}>
									워터마크 적용 범위
								</FormLabel>
								<FormControl>
									<ToggleGroup
										className="justify-start w-full"
										variant="outline"
										type="multiple"
										disabled={!active}
										value={field.value}
										onValueChange={(value) => {
											field.onChange(value);
										}}
									>
										<ToggleGroupItem
											value="description"
											className="[&[data-state=on]]:data-state-on w-full"
										>
											인포
										</ToggleGroupItem>
										<ToggleGroupItem
											value="product"
											className="[&[data-state=on]]:data-state-on w-full"
										>
											굿즈
										</ToggleGroupItem>
									</ToggleGroup>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={control}
						name="watermark.type"
						render={({ field }) => (
							<FormItem>
								<FormLabel className={!active ? "text-muted-foreground" : ""}>
									워터마크 종류
								</FormLabel>
								<FormControl>
									<ToggleGroup
										className="justify-start w-full"
										variant="outline"
										type="single"
										disabled={!active}
										value={field.value}
										onValueChange={(value) => {
											field.onChange(value);
										}}
									>
										<ToggleGroupItem
											value="text"
											className="[&[data-state=on]]:data-state-on w-full"
										>
											텍스트
										</ToggleGroupItem>
										<ToggleGroupItem
											value="background"
											className="[&[data-state=on]]:data-state-on w-full"
										>
											텍스트와 배경
										</ToggleGroupItem>
										<ToggleGroupItem
											value="logo"
											className="[&[data-state=on]]:data-state-on w-full"
										>
											로고
										</ToggleGroupItem>
									</ToggleGroup>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Alert className="bg-muted">
						<Sparkles className="h-4 w-4" />
						<AlertTitle>스마트 워터마크</AlertTitle>
						<AlertDescription>
							이미지 내 캐릭터의 얼굴을 자동으로 인식해서 캐릭터의 몸통 부분에만
							워터마크를 적용해요.
						</AlertDescription>
					</Alert>
				</CardContent>
			</Card>
		</>
	);
}

const HelpTooltip = ({ content }: { content: string }) => {
	const isDesktop = useMediaQuery({ query: "(min-width: 768px)" });
	return isDesktop ? (
		<TooltipProvider>
			<Tooltip delayDuration={300}>
				<TooltipTrigger asChild>
					<CircleHelp className="h-4 w-4 text-muted-foreground" />
				</TooltipTrigger>
				<TooltipContent side="bottom" className="w-auto max-w-72">
					<p>{content}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	) : (
		<Popover>
			<PopoverTrigger asChild>
				<CircleHelp className="h-4 w-4 text-muted-foreground" />
			</PopoverTrigger>
			<PopoverContent side="bottom" className="w-auto p-2 max-w-72">
				<p className="text-sm">{content}</p>
			</PopoverContent>
		</Popover>
	);
};
