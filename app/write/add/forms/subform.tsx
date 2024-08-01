"use client";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { useForm, FormProvider, Form } from "react-hook-form";
import { cn } from "@/lib/utils";
import {
	Drawer,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogClose,
} from "@/components/ui/dialog";
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMediaQuery } from "react-responsive";
import { Input } from "@/components/ui/input";

export const formSchema = z.object({
	type: z.enum(["exhibition", "artist", "genre", "character", "category"]),
	name: z.string(),
	alias: z.array(z.string()).optional(),
	thumbnail: z.instanceof(File).optional(),
	sns: z
		.object({
			x: z.string().optional(),
		})
		.optional(),
	genre: z
		.object({
			_id: z.string().optional(),
			name: z.string().optional(),
		})
		.optional(),
});

const labels: { [key: string]: string } = {
	exhibition: "행사",
	artist: "작가",
	genre: "장르 및 태그",
	character: "캐릭터",
	category: "카테고리",
};

interface FormType {
	type:
		| "exhibition"
		| "artist"
		| "genre"
		| "character"
		| "category"
		| undefined;
}

function getLabel(type: string): string {
	return labels[type] || "Default Label";
}

export default function SubForm({
	type,
	field,
}: {
	type: string;
	field: string;
}) {
	const isDesktop = useMediaQuery({ query: "(min-width: 768px)" });
	const label = getLabel(type);
	const subForm = useForm<z.infer<typeof formSchema>>({
		mode: "onBlur", // 또는 "onBlur"
		resolver: zodResolver(formSchema),
		defaultValues: {
			type: undefined,
			name: "",
			alias: [],
			thumbnail: undefined,
			sns: {
				x: "",
			},
			genre: {},
		},
	});
	function onSubmitSubForm(data: z.infer<typeof formSchema>) {
		console.log(data);
	}
	return (
		<>
			{isDesktop ? (
				<Dialog>
					<DialogTrigger>
						<Button variant="secondary">{label} 추가</Button>
					</DialogTrigger>
					<FormProvider {...subForm}>
						<DialogContent>
							<form
								key={2}
								onSubmit={(e) => {
									e.preventDefault();
									e.stopPropagation();
									subForm.setValue("type", type as FormType["type"]);
									subForm.handleSubmit(onSubmitSubForm)(e);
								}}
							>
								<DialogHeader>
									<DialogTitle>{label} 추가</DialogTitle>
								</DialogHeader>
								<div>
									<FormContent type={type} field={field} form={subForm} />
								</div>
								<DialogFooter>
									<Button type="submit">Submit</Button>
								</DialogFooter>
							</form>
						</DialogContent>
					</FormProvider>
				</Dialog>
			) : (
				<Drawer shouldScaleBackground>
					<DrawerTrigger>
						<Button variant="secondary">{label} 추가</Button>
					</DrawerTrigger>
					<FormProvider {...subForm}>
						<DrawerContent>
							<form
								key={2}
								onSubmit={(e) => {
									e.preventDefault();
									e.stopPropagation();
									subForm.setValue("type", type as FormType["type"]);
									subForm.handleSubmit(onSubmitSubForm)(e);
								}}
							>
								<DrawerHeader>
									<DrawerTitle>{label} 추가</DrawerTitle>
								</DrawerHeader>
								<div>
									<FormContent type={type} field={field} form={subForm} />
								</div>
								<DrawerFooter>
									<Button type="submit">Submit</Button>
								</DrawerFooter>
							</form>
						</DrawerContent>
					</FormProvider>
				</Drawer>
			)}
		</>
	);
}

function FormContent({
	type,
	field,
	form,
}: { type: string; field: string; form: any }) {
	const label = getLabel(type);
	//제출시 실행

	return (
		<div className="px-3 flex flex-col gap-2 z-20">
			<FormField
				control={form.control}
				name="name"
				render={({ field }) => (
					<FormItem>
						<FormLabel className="text-lg">이름</FormLabel>
						<FormControl>
							<Input
								className="w-full md:w-96 text-base"
								autoComplete="off"
								placeholder={`${label} 이름을 입력하세요.`}
								{...field}
							/>
						</FormControl>
					</FormItem>
				)}
			/>
		</div>
	);
}
