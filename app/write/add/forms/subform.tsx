"use client";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import {
	useForm,
	FormProvider,
	Form,
	useFormContext,
	useFormState,
} from "react-hook-form";
import {
	DrawerClose,
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
import { Drawer } from "vaul";
import { nanoid } from "nanoid";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMediaQuery } from "react-responsive";
import { Input } from "@/components/ui/input";
import ComboBox from "@/components/combobox/combobox";
import { SubmitSubForm } from "@/app/api/write/submit/submit";
import FileUpload from "@/components/ui/file-upload";
import { toast } from "sonner";
import { GetUploadURL } from "@/app/api/write/submit/s3";
import axios from "axios";
import { useState } from "react";

export const formSchema = z.object({
	type: z.enum(["exhibition", "artist", "genre", "character", "category"]),
	name: z.string().min(1),
	alias: z.array(z.string()).optional(),
	thumbnail: z.instanceof(File).optional().nullable(),
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
	open,
	onOpenChange,
}: {
	type: string;
	field: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const { setValue } = useFormContext();
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
			sns: undefined,
			genre: undefined,
		},
	});
	const [uploadProgress, setUploadProgress] = useState(0);

	async function onSubmitSubForm(data: z.infer<typeof formSchema>) {
		let thumbnailUrl = "";
		console.log(new Date().toLocaleTimeString(), "Starting..."); // 파일 업로드 처리
		if (data.thumbnail) {
			const path = `${type}`;
			const extension = data.thumbnail.name.split(".").pop() || "webp";
			const filename = `${nanoid()}.${extension}`;

			try {
				const url = await GetUploadURL(path, filename);
				console.log(new Date().toLocaleTimeString(), "GET Presigned URL", url); // 파일 업로드 처리
				const response = await axios.put(url, data.thumbnail, {
					headers: { "Content-Type": data.thumbnail.type },
					onUploadProgress: (progressEvent) => {
						const percentCompleted = Math.round(
							(progressEvent.loaded * 100) / progressEvent.total,
						);
						console.log(
							new Date().toLocaleTimeString(),
							"PUT Object",
							percentCompleted,
						);
					},
				});
				console.log("Upload complete:", response.data);
				thumbnailUrl = `https://${process.env.NEXT_PUBLIC_S3_BUCKET}.s3.${process.env.NEXT_PUBLIC_S3_REGION}.amazonaws.com/${path}/${filename}`;
			} catch (error) {
				return; // 파일 업로드 실패 시 함수 종료
			}
		}
		console.log(
			new Date().toLocaleTimeString(),
			"File Uploaded to:",
			thumbnailUrl,
		);
		// SubmitSubForm 호출
		try {
			// thumbnail URL로 data 객체 업데이트
			const updatedData = {
				...data,
				thumbnail: thumbnailUrl || data.thumbnail, // URL이 없으면 원래 값 유지
			};
			console.log(new Date().toLocaleTimeString(), "Submitting...");

			const result = await SubmitSubForm(updatedData, "sub");
			setValue(field.name, [...field.value, result]);
			subForm.reset();
			console.log(new Date().toLocaleTimeString(), "Submitted");
			onOpenChange(false);
		} catch (error) {
			console.error(error);
		}
	}
	return (
		<>
			{isDesktop ? (
				<Dialog open={open} onOpenChange={onOpenChange}>
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
									<Button
										type="submit"
										disabled={subForm.formState.isSubmitting}
									>
										등록
									</Button>
								</DialogFooter>
							</form>
						</DialogContent>
					</FormProvider>
				</Dialog>
			) : (
				<Drawer.NestedRoot open={open} onOpenChange={onOpenChange}>
					<FormProvider {...subForm}>
						<DrawerContent onClick={(e) => e.stopPropagation()}>
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
								<DrawerFooter className="flex flex-row gap-2">
									<DrawerClose>
										<Button type="button" variant="secondary">
											취소
										</Button>
									</DrawerClose>
									<Button
										type="submit"
										className="w-full"
										disabled={subForm.formState.isSubmitting}
									>
										등록 {uploadProgress}%
									</Button>
								</DrawerFooter>
							</form>
						</DrawerContent>
					</FormProvider>
				</Drawer.NestedRoot>
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
		<div className="flex flex-col gap-3 z-20 p-4 lg:px-0 lg:py-8">
			<FormField
				control={form.control}
				name="thumbnail"
				render={({ field }) => (
					<FormItem onClick={(e) => e.stopPropagation()}>
						<FormLabel>프로필 사진</FormLabel>
						<div className="w-28 h-28">
							<FormControl onClick={(e) => e.stopPropagation()}>
								<FileUpload
									{...field}
									ratio={1}
									maxSize={10000000}
									maxFiles={1}
								/>
							</FormControl>
						</div>
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="name"
				render={({ field }) => (
					<FormItem>
						<FormLabel>이름</FormLabel>
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
			{type === "artist" && (
				<FormField
					control={form.control}
					name="sns.x"
					render={({ field }) => (
						<FormItem>
							<FormLabel>X 아이디</FormLabel>
							<FormControl>
								<Input
									className="w-full md:w-96 text-base"
									autoComplete="off"
									{...field}
								/>
							</FormControl>
						</FormItem>
					)}
				/>
			)}
			{type === "character" && (
				<FormField
					control={form.control}
					name="genre"
					render={({ field }) => (
						<FormItem>
							<FormLabel>장르 및 태그</FormLabel>
							<div className="w-full md:w-96">
								<FormControl>
									<ComboBox
										name={field.name}
										search="genre"
										list={(item) => (
											<div className="flex flex-col">
												<p>{item.name}</p>
											</div>
										)}
										label="장르 또는 태그"
										formValue={(item) => ({
											_id: item._id,
											name: item.name,
										})}
									/>
								</FormControl>
							</div>
							<FormMessage />
						</FormItem>
					)}
				/>
			)}
		</div>
	);
}
