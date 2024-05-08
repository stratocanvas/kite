"use client"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { SubmitRequest } from "./submit"

const formSchema = z.object({
    infoUrl: z.string().url({
        message: "URL 형식이 아닙니다."
    }).optional(),
    comment: z.string().optional()
})

export default function RequestForm() {
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            infoUrl: "",
            comment: ""
        }
    })
    function onSubmit(values: z.infer<typeof formSchema>) {
        SubmitRequest(values)
    }
    return (
        <Card className="sm:w-full lg:w-[600px] mx-auto border-none shadow-none">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Button asChild type="button" size="icon" variant="ghost">
                        <Link href="/write">
                            <ChevronLeft />
                        </Link>
                    </Button>
                    <CardTitle>부스 추가 요청</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="infoUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-md">부스 인포 게시글</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://example.com" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        부스 인포 게시글 또는 작가님의 SNS 계정 링크를 입력해 주세요. 
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="comment"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-md">설명</FormLabel>
                                    <FormControl>
                                        <Textarea className="resize-none" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full lg:w-auto" size="lg">제출</Button>
                    </form>
                </Form>
            </CardContent>
            <div className="w-full px-10">
            </div>
        </Card>
    )
}

