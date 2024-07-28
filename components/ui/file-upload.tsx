import React, { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { useResizeDetector } from "react-resize-detector";
import { ImagePlus, Frown, Trash, RefreshCcw, Loader2 } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { ControllerRenderProps } from "react-hook-form";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dropdown } from "react-day-picker";
interface FileUploadProps extends ControllerRenderProps {
	maxSize?: number;
	maxFiles?: number;
	ratio: number;
}

function FileUpload({
	onChange,
	value,
	maxSize,
	maxFiles,
	ratio,
}: FileUploadProps) {
	const { width, ref } = useResizeDetector();
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [isCompressing, setIsCompressing] = useState(false);

	useEffect(() => {
		if (value instanceof File) {
			setPreviewUrl(URL.createObjectURL(value));
		} else {
			setPreviewUrl(null);
		}
	}, [value]);

	const onDrop = useCallback(
		(uploadedFiles: File[]) => {
			const file = uploadedFiles[0];
			if (file) {
				onChange(file);
				setPreviewUrl(URL.createObjectURL(file));
			}
		},
		[onChange],
	);

	const {
		getRootProps,
		getInputProps,
		isDragActive,
		isDragAccept,
		isDragReject,
		open,
	} = useDropzone({
		onDrop,
		accept: {
			"image/*": [".jpeg", ".png", ".webp"],
		},
		maxSize,
		maxFiles: 1,
	});

	const handleDelete = (e: { stopPropagation: () => void }) => {
		setPreviewUrl(null);
		onChange(null);
		e.stopPropagation();
	};

	const handleChange = (e: { stopPropagation: () => void }) => {
		open();
		e.stopPropagation();
	};

	return (
		<div ref={ref}>
			<div {...getRootProps()}>
				<Card className="flex items-center justify-center text-center">
					<AspectRatio ratio={ratio} className="m-0">
						<CardContent
							className={`p-0 flex flex-col justify-center h-full ${
								isDragActive ? "bg-accent text-accent-foreground" : ""
							}`}
						>
							<input {...getInputProps()} />
							{isCompressing && (
								<div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
									<Loader2 className="animate-spin h-10 w-10 text-white" />
								</div>
							)}
							{previewUrl ? (
								<div>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<AspectRatio ratio={ratio}>
												<Image
													fill
													src={previewUrl}
													alt="Preview"
													className="rounded-lg w-full h-full object-cover"
												/>
											</AspectRatio>
										</DropdownMenuTrigger>
										{width && width > 200 ? (
											<Card
												className="absolute bottom-5 left-1/2 transform -translate-x-1/2 mx-auto h-auto bg-white/75 dark:bg-black/75 backdrop-blur-sm max-w-[80%]"
												onClick={(e) => e.stopPropagation()}
											>
												<CardContent className="pb-0 pl-2 pr-2 flex items-center h-12 max-width-[80%]">
													<div className="flex h-5 items-center space-x-3 text-sm flex-grow">
														<Button
															variant="link"
															size="sm"
															type="button"
															onClick={handleChange}
														>
															<RefreshCcw className={cn("h-4 w-4")} />
														</Button>
														<Button
															className="flex-shrink-0"
															variant="link"
															size="sm"
															type="button"
															onClick={handleDelete}
														>
															<Trash className={cn("h-4 w-4 text-red-600")} />
														</Button>
													</div>
												</CardContent>
											</Card>
										) : (
											<DropdownMenuContent>
												<DropdownMenuGroup className="w-full">
													<DropdownMenuItem onClick={handleChange}>
														<div className="flex w-full items-center gap-1 items-center justify-between">
															<p>변경</p>
															<RefreshCcw className={cn("h-4 w-4")} />
														</div>
													</DropdownMenuItem>
													<DropdownMenuItem onClick={handleDelete}>
														<div className="flex w-full items-center gap-1 items-center justify-between">
															<p className="text-red-600">삭제</p>
															<Trash className={cn("h-4 w-4 text-red-600")} />
														</div>
													</DropdownMenuItem>
												</DropdownMenuGroup>
											</DropdownMenuContent>
										)}
									</DropdownMenu>
								</div>
							) : isDragAccept ? (
								<div>
									<CardHeader className="flex items-center justify-center text-center">
										<ImagePlus className={cn(width && width > 200 ? "h-16 w-16": "h-8 w-8")} />
										{width && width > 200 && (
											<>
												<CardTitle className="mt-4">
													파일을 끌어다 놓으세요
												</CardTitle>
												<CardDescription>
													또는 클릭하여 파일을 선택하세요
												</CardDescription>
												<Separator />
												<CardDescription>
													최대 {maxSize ? maxSize / 1000000 : 0}MB의 이미지 파일{" "}
													{maxFiles}개만 업로드 가능합니다
												</CardDescription>
											</>
										)}
									</CardHeader>
								</div>
							) : isDragReject ? (
								<div>
									<CardHeader className="flex items-center justify-center text-center">
										<Frown className={cn(width && width > 200 ? "h-16 w-16": "h-8 w-8")} />

										{width && width > 200 && (
											<>
												<CardTitle className="mt-4">
													다른 파일을 선택해 주세요
												</CardTitle>
												<Separator />
												<CardDescription>
													최대 {maxSize ? maxSize / 1000000 : 0}MB의 이미지 파일{" "}
													{maxFiles}개만 업로드 가능합니다
												</CardDescription>
											</>
										)}
									</CardHeader>
								</div>
							) : (
								<div>
									<CardHeader className="flex items-center justify-center text-center">
										<ImagePlus className={cn(width && width > 200 ? "h-16 w-16": "h-8 w-8")} />
										{width && width > 200 && (
											<>
												<CardTitle className="mt-4">
													파일을 끌어다 놓으세요
												</CardTitle>
												<CardDescription>
													또는 클릭하여 파일을 선택하세요
												</CardDescription>
												<Separator />
												<CardDescription>
													최대 {maxSize ? maxSize / 1000000 : 0}MB의 이미지 파일{" "}
													{maxFiles}개만 업로드 가능합니다
												</CardDescription>
											</>
										)}
									</CardHeader>
								</div>
							)}
						</CardContent>
					</AspectRatio>
				</Card>
			</div>
		</div>
	);
}

export default FileUpload;
