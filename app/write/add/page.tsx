"use client";
//기능
import { useState } from "react";

import { cn } from "@/lib/utils";
import { useForm, FormProvider, Form } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

//UI 컴포넌트
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

//아이콘
import { Check, Circle, Save } from "lucide-react";
import BasicForm from "./forms/1-basic";
import InfoForm from "./forms/2-info";
import GoodsForm from "./forms/3-goods";
import EtcForm from "./forms/4-etc";
import ManagementForm from "./forms/5-management";
import { useActiveTabStore } from "@/store/addform";

//폼 스키마
const contentSchema: z.ZodType<unknown> = z.lazy(() =>
	z
		.object({
			type: z.string(),
			attrs: z.record(z.any()).optional(),
			content: z.array(contentSchema).optional(),
			text: z.string().optional(),
			marks: z.array(z.object({ type: z.string().optional() })).optional(),
		})
		.optional(),
);

export const formSchema = z.object({
	//기본 정보
	exhibition: z.object({
		_id: z.string(),
		name: z.string(),
	}),
	name: z.string().min(1, "부스 이름을 입력해주세요"),
	date: z.array(z.number()).min(1, "참가 날짜를 선택해주세요"),
	location: z.array(z.string()).optional(),
	artist: z
		.array(
			z.object({
				_id: z.string(),
				name: z.string(),
				thumbnail: z.string().optional(),
			}),
		)
		.optional(),

	//인포
	thumbnail: z.instanceof(File).optional(),
	description: z
		.object({
			type: z.string().optional(),
			content: z.array(contentSchema).optional(),
			/*
			.refine((content) => content.some((item) => item?.type === "image"), {
				message: "인포 이미지를 올려주세요",
			}),
			*/
		})
		.optional(),
	//굿즈
	product: z
		.array(
			z.object({
				_id: z.string(),
				name: z.string().min(1, "굿즈 이름을 입력해주세요"),
				category: z.array(
					z.object({
						_id: z.string(),
						name: z.string(),
					}),
				),
				artist: z.array(
					z.object({
						_id: z.string(),
						name: z.string(),
					}),
				),
				option: z.array(
					z.object({
						_id: z.string(),
						image: z.instanceof(File).optional(),
						name: z.string().min(1, "굿즈 이름을 입력해주세요"),
						price: z.number().min(0, "가격을 입력해주세요"),
						character: z
							.array(
								z.object({
									_id: z.string(),
									name: z.string(),
								}),
							)
							.optional(),
						stock: z.number().optional(),
						type: z.enum(["new", "rerun"]).optional(),
					}),
				),
			}),
		)
		.optional(),

	//추가 정보
	genre: z
		.array(
			z.object({
				_id: z.string(),
				name: z.string(),
			}),
		)
		.optional(),
	buy: z
		.array(
			z.object({
				type: z.enum(["survey", "preorder", "ship"]),
				name: z.string().min(1, "제목을 입력해주세요"),
				url: z
					.string()
					.url({ message: "https://로 시작하는 링크를 입력해주세요" }),
				date: z.array(z.date()).min(2).max(2),
			}),
		)
		.optional(),
	promotion: z.array(
		z.object({
			type: z.enum(["quantity", "allOption", "totalPrice"]),
			ifThis: z.object({
				item: z
					.object({
						_id: z.string(),
						name: z.string(),
					})
					.optional(),
				amount: z.number().optional(),
			}),
			thenThat: z.object({
				type: z.enum(["discount", "giveaway"]),
				item: z
					.object({
						product: z.object({
							_id: z.string(),
							name: z.string(),
							option: z.object({
								_id: z.string(),
								name: z.string(),
							}),
						}),
					})
					.optional(),
				amount: z.number(),
			}),
		}),
	),

	//운영
	pos: z.object({
		enabled: z.boolean(),
		displayLevel: z.enum(["secret", "approx", "exact"]).optional(),
	}),
	deposit: z
		.object({
			enabled: z.boolean(),
		})
		.and(
			z.discriminatedUnion("enabled", [
				z.object({
					enabled: z.literal(true),
					account: z.object({
						number: z.number(),
						bank: z.object({
							_id: z.string(),
							name: z.string(),
						}),
						holder: z.string(),
					}),
				}),
				z.object({
					enabled: z.literal(false),
					account: z
						.object({
							number: z.number().optional(),
							bank: z
								.object({
									_id: z.string().optional(),
									name: z.string().optional(),
								})
								.optional(),
							holder: z.string().optional(),
						})
						.optional(),
				}),
			]),
		),
	notice: z
		.array(
			z.object({
				title: z.string(),
				description: z.string(),
				priority: z.enum(["normal", "high", "urgent"]),
			}),
		)
		.optional(),
});

//탭 목록
enum TabValue {
	Basic = "basic",
	Info = "info",
	Goods = "goods",
	Etc = "etc",
	Management = "management",
}
const tabLabels = {
	[TabValue.Basic]: "기본 정보",
	[TabValue.Info]: "인포",
	[TabValue.Goods]: "굿즈",
	[TabValue.Etc]: "추가 정보",
	[TabValue.Management]: "운영",
};

const queryClient = new QueryClient();

export default function BoothForm() {
	//폼 기본값
	const form = useForm<z.infer<typeof formSchema>>({
		mode: "onBlur", // 또는 "onBlur"
		resolver: zodResolver(formSchema),
		defaultValues: {
			exhibition: undefined,
			name: "",
			date: [], 
			location: [],
			artist: [],
			thumbnail: undefined,
			description: {},
			product: [],
			genre: [],
			buy: [],
			promotion: [],
			pos: {
				enabled: false,
			},
			deposit: {
				enabled: false,
			},
			notice: [],
		},
	});

	//제출시 실행
	function onSubmit(data: z.infer<typeof formSchema>) {
		console.log(data);
	}

	//활성화된 탭 상태
	const { activeTab, setActiveTab } = useActiveTabStore();

	//아코디언 열림/닫힘 상태
	const [accordionOpen, setAccordionOpen] = useState("close");

	//탭 변경 핸들러 ()
	const handleTabChange = (value: TabValue) => {
		setActiveTab(value);
	};

	return (
		<>
			<Card className="sm:w-full lg:w-[800px] lg:mx-auto border-none shadow-none">
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle className="mt-2">부스 등록</CardTitle>
					<div className="flex gap-2">
						<Button type="button" variant="secondary" size="sm">
							<Save className="mr-2 h-4 w-4" /> 임시 저장
						</Button>
						<Button type="button" size="sm">
							<Check className="mr-2 h-4 w-4" /> 제출
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<Tabs
						value={activeTab}
						defaultValue={TabValue.Basic}
						className="w-full"
					>
						{/*Tab controller*/}
						<div className="w-full flex flex-col gap-2">
							{/*Tablet and desktop (lg...)*/}
							<TabsList className="hidden w-full lg:grid grid-cols-5 mb-4">
								{Object.values(TabValue).map((value) => (
									<TabsTrigger
										key={value}
										value={value}
										onClick={() => handleTabChange(value)}
									>
										{tabLabels[value]}
									</TabsTrigger>
								))}
							</TabsList>
							{/*Mobile (xs, sm, md)*/}
							<Accordion
								value={accordionOpen}
								onValueChange={setAccordionOpen}
								type="single"
								collapsible
								className="lg:hidden w-full mb-4"
							>
								<AccordionItem value="open">
									<AccordionTrigger onClick={() => setAccordionOpen("open")}>
										{tabLabels[activeTab]}
									</AccordionTrigger>
									{Object.values(TabValue).map((value) => (
										<AccordionContent
											className="pb-1"
											key={value}
											onClick={() => {
												setAccordionOpen("close");
												handleTabChange(value);
											}}
										>
											<Button
												type="button"
												variant="ghost"
												className="w-full justify-start flex gap-2 items-center"
											>
												<Circle
													fill="currentColor"
													className={cn(
														"h-2 w-2",
														value === activeTab ? "opacity-100" : "opacity-0",
													)}
												/>
												{tabLabels[value]}
											</Button>
										</AccordionContent>
									))}
								</AccordionItem>
							</Accordion>
						</div>
						{/*Tab content (form)*/}
						<FormProvider {...form}>
							<QueryClientProvider client={queryClient}>
								<form key={1} onSubmit={form.handleSubmit(onSubmit)}>
									<TabsContent asChild value={TabValue.Basic}>
										<BasicForm />
									</TabsContent>
									<TabsContent asChild value={TabValue.Info}>
										<InfoForm />
									</TabsContent>
									<TabsContent asChild value={TabValue.Goods}>
										<GoodsForm />
									</TabsContent>
									<TabsContent asChild value={TabValue.Etc}>
										<EtcForm />
									</TabsContent>
									<TabsContent asChild value={TabValue.Management}>
										<ManagementForm />
									</TabsContent>
									<Button type="submit">Submit</Button>
								</form>
							</QueryClientProvider>
						</FormProvider>
					</Tabs>
				</CardContent>
			</Card>
		</>
	);
}
