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
import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from '@/utils/supabase/client'
import { SubmitData } from "./submit";
import { useForm } from "react-hook-form";

const supabase = createClient();


const formSchema = z.object({
    id: z.string().min(2).max(16).regex(/^[a-zA-Z0-9_]+$/),
    nickname: z.string().min(1).max(16),
})

const fetchUsedId = async (input: string) => {
    const { data, error } = await supabase
        .from("users")
        .select("name")
        .eq("name", input)
        .limit(1)
        .maybeSingle();
    if (!data || error) {
        return ''; 
    }
    return { data, error };
};

const fetchUserData = async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    const { data, error: dataError } = await supabase
        .from('users')
        .select('name, n_name')
        .eq('id', user.id)
        .single();

    return { data, error: dataError };
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
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        mode: 'onChange',
        defaultValues: {
            id: '', // Initialize with empty string or any default value
            nickname: '', // Initialize with empty string or any default value
        },
    });

    useEffect(() => {
        const fetchData = async () => {
            const data = await prePopulated();
            // Use setValue to update form fields individually
            form.setValue('id', data.name || ''); // Provide a fallback value to ensure it's always controlled
            form.setValue('nickname', data.n_name || ''); // Provide a fallback value to ensure it's always controlled
        };

        fetchData();
    }, [form]);

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
        <Card className="w-full max-w-sm mx-auto">
            <CardHeader>
                <CardTitle>안녕하세요</CardTitle>
                <CardDescription>
                    처음 오셨군요! 시작하기 전에 프로필을 설정할게요.
                </CardDescription>
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
                                    <FormDescription>
                                        다른 사람에게 표시되는 닉네임이예요. 창의력을 발휘해보세요! ㅇㅇ같이 단순한 이름도 괜찮아요.
                                    </FormDescription>
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
                                        다른 사람에게 표시되는 고유한 아이디예요.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit">확인</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}