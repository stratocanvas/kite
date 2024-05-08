'use client'
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useEffect, useLayoutEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useForm } from "react-hook-form";
import { getUserData, getUsedId, SubmitData } from "./fetch";
import { useToast } from "@/components/ui/use-toast";
import { UserStateContext } from "@/providers"
import { useRouter } from "next/navigation";

const formSchema = z.object({
    id: z.string().min(2).max(24).regex(/^[a-zA-Z0-9_]+$/),
    nickname: z.string().min(1).max(24),
})

const fetchUsedId = async (input: string) => {
    const { data, error } = await getUsedId(input)
    return { data, error };
};

const fetchUserData = async () => {
    const { data, error } = await getUserData()
    return { data, error };
};

const checkIdDuplication = async (input: string) => {
    const { data, error } = await fetchUsedId(input);
    const { data: userData, error: userDataError } = await fetchUserData();

    if (!data || data.name === userData?.name) {
        return true;
    }
    return false;
}

const prePopulated = async () => {
    const { data, error } = await fetchUserData();

    if (error) {
        return { name: '', n_name: '' }
    }

    return { name: data.name, n_name: data.n_name }
}


export default function InitialSetup() {

    const router = useRouter();
    const { userData } = React.useContext(UserStateContext);


    const { toast } = useToast();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        mode: 'onChange',
        defaultValues: {
            id: '', // Initialize with empty string or any default value
            nickname: '', // Initialize with empty string or any default value
        },
    });

    useEffect(() => {
        if (!userData) {
            const path = window.location.pathname + window.location.search;
            router.push(`/auth?next=${encodeURIComponent(path)}`);
        } else {
            const fetchData = async () => {
                const data = await prePopulated();
                // Use setValue to update form fields individually
                form.setValue('id', data.name || ''); // Provide a fallback value to ensure it's always controlled
                form.setValue('nickname', data.n_name || ''); // Provide a fallback value to ensure it's always controlled
            }
            fetchData();
        };

    }, [form, userData]);

    const { watch, setError, clearErrors } = form;
    const idValue = watch("id"); // 'id' 필드의 현재 값을 관찰합니다.

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            // idValue가 유효한 경우에만 중복 검사를 실행합니다.
            if (formSchema.shape.id.safeParse(idValue).success) {
                const isUnique = await checkIdDuplication(idValue);
                if (!isUnique) {
                    // 중복된 아이디인 경우, 오류를 설정합니다.
                    setError('id', {
                        type: 'custom',
                        message: '이미 사용중인 아이디입니다.',
                    });
                } else {
                    // 중복되지 않은 경우, 오류를 제거합니다.
                    clearErrors('id');
                }
            }
        }, 500); // 입력 변경 후 100ms 지연

        return () => clearTimeout(delayDebounceFn); // 컴포넌트 언마운트 또는 다음 useEffect 실행 전에 타이머를 취소합니다.
    }, [idValue, setError, clearErrors]); // idValue가 변경될 때마다 useEffect를 다시 실행합니다.


    async function onSubmit(values: z.infer<typeof formSchema>) {
        // 중복 아이디 검사를 수행합니다.
        const isUnique = await checkIdDuplication(values.id);
        if (!isUnique) {
            // 중복된 아이디인 경우, 오류를 설정하고 함수 실행을 중단합니다.
            setError('id', {
                type: 'custom',
                message: '이미 사용중인 아이디입니다.',
            });
            return; // 여기서 함수 실행을 중단합니다.
        }
        await SubmitData(values);
    }

    return (
        <Card className="w-full max-w-sm mx-auto border-none shadow-none">
            <CardHeader>
                <CardTitle>내 정보</CardTitle>

            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="nickname"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>닉네임</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>아이디</FormLabel>
                                    <FormControl>
                                        <div className="flex items-center">
                                            <span className="mr-2 text-muted-foreground">@</span>
                                            <Input {...field} />
                                        </div>
                                    </FormControl>
                                    <FormDescription>
                                        숫자, 영문 소문자, 대문자, _ 만 입력 가능합니다.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full md:w-auto" onClick={() => {
                            toast({
                                description: '변경사항 저장됨',
                            })
                        }}>확인</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}