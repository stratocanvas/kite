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
import FileUpload from "@/components/ui/file-upload";
import Tiptap from "@/components/tiptap-editor";

export default function InfoForm() {
	//행사가 변경되었을 때 날짜 초기화
	const { control, watch, setValue } = useFormContext();

	return (
		<>
			<div className="flex flex-col space-y-6">
				<FormField
					control={control}
					name="thumbnail"
					render={({ field }) => (
						<FormItem className="flex flex-col">
							<FormLabel className="text-lg">현수막</FormLabel>
							<FormControl>
								<FileUpload
									{...field}
									ratio={4 / 3}
									maxSize={10000000}
									maxFiles={1}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={control}
					name="description"
					render={({ field }) => (
						<FormItem className="flex flex-col">
							<div className="flex justify-between items-center">
								<FormLabel className="text-lg">인포</FormLabel>
							</div>
							<FormControl>
								<Tiptap
									initValue={field.value || null}
									onChange={(data) => {
										field.onChange(data);
									}}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</div>
		</>
	);
}
