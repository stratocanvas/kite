'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useEffect } from 'react';
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from 'next/navigation';


async function SignIn() {
    const urlParams = new URLSearchParams(window.location.search);
    const next = urlParams.get('next') || '/'; // Default to root if no next param
/*
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "twitter",
        options: {
            redirectTo: `${window.location.origin}${decodeURIComponent(next)}/auth/signin?next=${encodeURIComponent(next)}`,
        },
    });
    */
}


export default function AuthorAuthPage() {

    useEffect(() => {
        SignIn();
    }, []);
    return (
        <Card className="w-full flex items-center justify-center lg:w-96 mx-auto border-none shadow-none">
            <CardHeader>
                <CardTitle className="flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin" /></CardTitle>
                <CardDescription className="flex flex-col">
                </CardDescription>
            </CardHeader>
        </Card>
    )
}

