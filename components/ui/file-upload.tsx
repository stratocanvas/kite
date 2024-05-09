"use client"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { cn } from "@/lib/utils"
import React, { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { ImagePlus, Frown, Trash, RefreshCcw, Loader2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useResizeDetector } from 'react-resize-detector';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import imageCompression from 'browser-image-compression';


interface FileUploadProps {
    name: string;
    maxSize?: number;
    maxFiles?: number;
    ratio: number;
    onChange: (file: string | null) => void;
    value?: string;
}


function FileUpload({ name, maxSize, maxFiles, ratio, onChange, value }: FileUploadProps) {
    const { width, ref } = useResizeDetector();
    const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
    const [isCompressing, setIsCompressing] = useState(false);

    useEffect(() => {
        if (value !== previewUrl) {
            setPreviewUrl(value || null);
        }
    }, [value, previewUrl]);

    const onDrop = useCallback(async (uploadedFiles: File[]) => {
        const file = uploadedFiles[0];
        if (file) {
            // setIsCompressing(true);
            // const options = {
            //     maxSizeMB: 1,
            //     useWebWorker: true,
            //     fileType: 'image/webp',
            // }
            try {
                // const compressedFile = await imageCompression(file, options);
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64String = reader.result as string;
                    onChange(base64String);
                    setPreviewUrl(base64String);
                    // setIsCompressing(false);
                };
                reader.readAsDataURL(file);
            } catch (error) {
                console.log(error);
                // setIsCompressing(false);
            }
        }
    }, [onChange]);



    const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject, open } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.png', '.webp']
        },
        maxSize,
        maxFiles: 1
    });

    return (
        <div ref={ref}> {/* ref를 사용하여 이 div의 크기를 감지 */}
            {width && width > 200 ? (
                <div {...getRootProps()}>
                    <Card className="flex items-center justify-center text-center">
                        <AspectRatio ratio={ratio} className="m-0">
                            <CardContent className={`p-0 flex flex-col justify-center h-full ${isDragActive ? "bg-accent text-accent-foreground" : ""}`}>
                                <input {...getInputProps()} />
                                {isCompressing && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                                        <Loader2 className="animate-spin h-10 w-10 text-white" />
                                    </div>
                                )}
                                {previewUrl ? (
                                    <div>
                                        <AspectRatio ratio={ratio}>
                                            <Image fill src={previewUrl} alt="Preview" className="rounded-lg w-full h-full object-cover" />
                                        </AspectRatio>
                                        <Card className="absolute bottom-5 left-1/2 transform -translate-x-1/2 mx-auto h-auto bg-white/75 dark:bg-black/75 backdrop-blur-sm max-w-[80%]" onClick={(e) => e.stopPropagation()}>
                                            <CardContent className="pb-0 pl-2 pr-2 flex items-center h-12 max-width-[80%]">
                                                <div className="flex h-5 items-center space-x-3 text-sm flex-grow">
                                                    <Button variant="link" size="sm" type="button" onClick={(e) => { e.stopPropagation(); open(); }}>
                                                        <RefreshCcw className={cn("h-4 w-4")} />
                                                    </Button>
                                                    <Button className="flex-shrink-0" variant="link" size="sm" type="button" onClick={() => {
                                                        setPreviewUrl(null);
                                                        onChange(null);
                                                    }}>
                                                        <Trash className={cn("h-4 w-4 text-red-600")} />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                ) : isDragAccept ? (
                                    // 파일을 끌어다 놓을 수 있는 상태
                                    <div>
                                        <CardHeader className="flex items-center justify-center text-center">
                                            <ImagePlus className={cn("h-16 w-16 mb-4")} />
                                            <CardTitle>파일을 끌어다 놓으세요</CardTitle>
                                            <CardDescription>또는 클릭하여 파일을 선택하세요</CardDescription>
                                            <Separator />
                                            <CardDescription>최대 {maxSize ? maxSize / 1000000 : 0}MB의 이미지 파일 {maxFiles}개만 업로드 가능합니다</CardDescription>
                                        </CardHeader>
                                    </div>
                                ) : isDragReject ? (
                                    // 드래그한 파일이 허용되지 않는 상태
                                    <div>
                                        <CardHeader className="flex items-center justify-center text-center">
                                            <Frown className={cn("h-16 w-16 mb-4")} />
                                            <CardTitle>다른 파일을 선택해 주세요</CardTitle>
                                            <Separator />
                                            <CardDescription>최대 {maxSize ? maxSize / 1000000 : 0}MB의 이미지 파일 {maxFiles}개만 업로드 가능합니다</CardDescription>
                                        </CardHeader>
                                    </div>
                                ) : (
                                    // 기본 상태
                                    <div>
                                        <CardHeader className="flex items-center justify-center text-center">
                                            <ImagePlus className={cn("h-16 w-16 mb-4")} />
                                            <CardTitle>파일을 끌어다 놓으세요</CardTitle>
                                            <CardDescription>또는 클릭하여 파일을 선택하세요</CardDescription>
                                            <Separator />
                                            <CardDescription>최대 {maxSize ? maxSize / 1000000 : 0}MB의 이미지 파일 {maxFiles}개만 업로드 가능합니다</CardDescription>
                                        </CardHeader>
                                    </div>
                                )}

                            </CardContent>
                        </AspectRatio>
                    </Card>

                </div>
            ) : (

                <div {...getRootProps()}>
                    <Card className="flex items-center justify-center text-center">
                        <AspectRatio ratio={ratio} className="m-0">
                            <CardContent className={`p-0 flex flex-col w-full justify-center h-full ${isDragActive ? "bg-accent text-accent-foreground" : ""}`}>
                                <input {...getInputProps()} />
                                {isCompressing && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                                        <Loader2 className="animate-spin h-8 w-8 text-white" />
                                    </div>
                                )}
                                {previewUrl ? (
                                    <div >
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild className="w-full">
                                                <AspectRatio ratio={ratio}>
                                                    <Image fill src={previewUrl} alt="Preview" className="rounded-lg w-full h-full object-cover" />
                                                </AspectRatio>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent >
                                                <DropdownMenuGroup className="w-full">
                                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); open(); }}>
                                                        <div className="flex w-full items-center gap-1 items-center justify-between">
                                                            <p>변경</p>
                                                            <RefreshCcw className={cn("h-4 w-4")} />
                                                        </div>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={(e) => {
                                                        setPreviewUrl(null);
                                                        onChange(null);
                                                        e.stopPropagation();
                                                    }}>
                                                        <div className="flex w-full items-center gap-1 items-center justify-between">
                                                            <p className="text-red-600">삭제</p>
                                                            <Trash className={cn("h-4 w-4 text-red-600")} />
                                                        </div>
                                                    </DropdownMenuItem>
                                                </DropdownMenuGroup>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                ) : isDragAccept ? (
                                    // 파일을 끌어다 놓을 수 있는 상태
                                    <div>
                                        <CardHeader className="flex items-center justify-center text-center">
                                            <ImagePlus className={cn("h-10 w-10")} />
                                        </CardHeader>
                                    </div>
                                ) : isDragReject ? (
                                    // 드래그한 파일이 허용되지 않는 상태
                                    <div>
                                        <CardHeader className="flex items-center justify-center text-center">
                                            <Frown className={cn("h-10 w-10")} />
                                        </CardHeader>
                                    </div>
                                ) : (
                                    // 기본 상태
                                    <div>
                                        <CardHeader className="flex items-center justify-center text-center">
                                            <ImagePlus className={cn("h-10 w-10")} />
                                        </CardHeader>
                                    </div>
                                )}

                            </CardContent>
                        </AspectRatio>
                    </Card>

                </div>
            )}
        </div>
    );
}

export default FileUpload;

