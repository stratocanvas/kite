'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useLayoutEffect } from 'react';
import { GetUser } from "@/app/fetch"
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from 'lucide-react';


export default function LoginPage() {
    const supabase = createClient()
    const router = useRouter();
    useLayoutEffect(() => {
        const fetchUser = async () => {
            const data = await GetUser();
            if (data) {
                router.back()
            }
        };

        fetchUser();
    }, []);
    const signIn = (provider: string, next: string) => {
        const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
        supabase.auth.signInWithOAuth({
            provider: provider,
            options: {
                redirectTo: redirectUrl,
            },
        });
    }

    // Extract 'next' parameter from URL on client side
    let next = "/";
    useEffect(() => {
        const { searchParams } = new URL(window.location.href);
        next = searchParams.get("next") ?? "/";
    }, []);

    return (
        <Card className="sm:w-full lg:w-[500px] mx-auto border-none shadow-none">
            <CardHeader>
                <CardTitle>로그인</CardTitle>
                <CardDescription>
                    회원가입도 여기서 할 수 있어요.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
                <Button onClick={() => signIn('twitter', next)}>Twitter로 계속하기</Button>
                <Button onClick={() => signIn('google', next)}>Google로 계속하기</Button>

            </CardContent>
            <CardFooter>
                <Alert>
                    <Info className='w-4 h-4' />
                    <AlertTitle>
                        Twitter 로그인 시 오류가 발생하나요?
                    </AlertTitle>
                    <AlertDescription>
                        Twitter 계정에 이메일이 등록되어 있는지 확인해 주세요.
                    </AlertDescription>
                </Alert>
            </CardFooter>
        </Card>
    );
}