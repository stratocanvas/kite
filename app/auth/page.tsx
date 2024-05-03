'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createBrowserClient } from '@supabase/ssr'
import { useEffect } from 'react';


const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

export default function LoginPage() {
    const signIn = (provider: string, next: string) => {
        const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
        supabase.auth.signInWithOAuth({
            provider: provider,
            options: {
                redirectTo: redirectUrl,
            },
        });
    }

    const signOut = () => supabase.auth.signOut();

    // Extract 'next' parameter from URL on client side
    let next = "/";
    useEffect(() => {
        const { searchParams } = new URL(window.location.href);
        next = searchParams.get("next") ?? "/";
    }, []);

    return (
        <Card className="w-full max-w-sm mx-auto">
            <CardHeader>
                <CardTitle>로그인</CardTitle>
                <CardDescription>
                    회원가입도 여기서 할 수 있어요.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
                <Button onClick={() => signIn('twitter', next)}>Twitter로 계속하기</Button>
                <Button onClick={() => signIn('google', next)}>Google로 계속하기</Button>
                <Button onClick={() => signOut()}>로그아웃</Button>
            </CardContent>
        </Card>
    );
}