'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useLayoutEffect } from 'react';
import { GetUser } from "@/app/fetch"
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from 'lucide-react';
import Image from 'next/image';
import google from './google.png';
import twitterwhite from './twitterwhite.png';
import twitterblack from './twitterblack.png';

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
                <Button size='lg' className='flex justify-between bg-[#4285f4] hover:bg-[#4285f4]/90' onClick={() => signIn('google', next)}>
                    <Image className='-ml-6 w-8 h-8' src={google} alt="Google" width={32} height={32} />
                    <p className='text-md text-white'>Google 계정으로 로그인</p>
                    <div className='w-1 h-8' />
                </Button>
                <Button className='flex justify-between' size='lg' onClick={() => signIn('twitter', next)}>
                    <div className='relative -ml-5 w-6 h-6'>
                        <Image className='block dark:hidden' src={twitterwhite} alt="Twitter" width={24} height={24} />
                        <Image className='hidden dark:block absolute top-0 left-0' src={twitterblack} alt="Twitter" width={24} height={24} />
                    </div>
                    <p className='text-md'>X 계정으로 로그인</p>
                    <div className='w-0 h-8' />
                </Button>

            </CardContent>
            <CardFooter>
                <Alert>
                    <Info className='w-4 h-4' />
                    <AlertTitle>
                        X 로그인 시 오류가 발생하나요?
                    </AlertTitle>
                    <AlertDescription>
                        X 계정에 이메일이 등록되어 있는지 확인해 주세요.
                    </AlertDescription>
                </Alert>
            </CardFooter>
        </Card>
    );
}