'use client'
import { Button } from '@/components/ui/button'
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dot, Loader2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export default function Result() {
    const [nextUrl, setNextUrl] = useState('/');
    const [authorInfo, setAuthorInfo] = useState<{ isAuthor: boolean; name?: string; sns_x?: string } | null>(null);
    const router = useRouter();

    const fetchAuthorInfo = useCallback(async () => {
        /*
        const info = await ConnectAuthor(window.location.search);
        setAuthorInfo(info);
        */
    }, []);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const next = urlParams.get('next') || '/booth';
        setNextUrl(next);

        fetchAuthorInfo();
    }, [fetchAuthorInfo]);

    return (
        <div className='flex flex-col items-center justify-center'>
            <Card className='border-none shadow-none'>
                <CardContent>

                    <div>

                        {authorInfo === null ? (
                            <CardHeader className='text-center'>
                                <CardTitle className='flex justify-center'>
                                    <Loader2 className='h-6 w-6 animate-spin' />
                                </CardTitle>
                            </CardHeader>
                        ) : authorInfo?.isAuthor ? (
                            <>
                                <CardHeader>
                                    <CardTitle>
                                        연결 성공
                                    </CardTitle>
                                    <CardDescription>
                                        이제 이 부스의 정보를 편집할 수 있어요.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Card>
                                        <CardContent className='mt-4'>
                                            <div className='flex flex-row gap-2 items-center'>
                                                <Avatar>
                                                    <AvatarImage src={authorInfo.sns_x} />
                                                    <AvatarFallback>
                                                        <p>{authorInfo.name?.charAt(0)}</p>
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p>{authorInfo.name}</p>
                                                    <p className='text-muted-foreground text-sm'>{authorInfo.sns_x}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </CardContent>
                                <CardFooter>
                                    <Button className='w-full md:w-auto' onClick={() => {
                                        router.push(nextUrl);
                                    }}>
                                        확인
                                    </Button>
                                </CardFooter>

                            </>
                        ) : (
                            <>
                                <CardHeader>
                                    <CardTitle>
                                        연결 실패
                                    </CardTitle>
                                    <CardDescription>
                                        이 부스의 운영자가 맞는데도 오류가 표시된다면, 아래 내용이 원인일 수 있어요.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul>
                                        <li className='flex items-top gap-1'><Dot className='h-6 w-6 shrink-0' /> 부스에 작가 정보가 등록되지 않음</li>
                                        <li className='flex items-top gap-1'><Dot className='h-6 w-6 shrink-0' /> 부스에 등록된 작가의 X 아이디와 로그인한 X 아이디가 일치하지 않음</li>
                                        <li className='flex items-top gap-1'><Dot className='h-6 w-6 shrink-0' /> 일시적 서버 오류</li>
                                    </ul>

                                    <p className='mt-4'>문제가 계속된다면 고객센터에 문의해 주세요.</p>

                                </CardContent>

                                <CardFooter className='flex flex-col md:flex-row gap-2'>
                                    <Button className='w-full md:w-auto' onClick={() => {
                                        router.push(nextUrl);
                                    }}>
                                        확인
                                    </Button>
                                    <Button className='w-full md:w-auto' variant='secondary' onClick={() => {
                                        router.push(nextUrl);
                                    }}>
                                        문의하기
                                    </Button>
                                </CardFooter>
                            </>
                        )}
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}