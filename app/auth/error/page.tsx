'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowRight, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function AuthError() {
    const [error, setError] = useState('');
    const [errorCode, setErrorCode] = useState('');
    const [errorDescription, setErrorDescription] = useState('');

    useEffect(() => {
        const hash = window.location.hash.slice(1);
        const searchParams = new URLSearchParams(hash);

        setError(searchParams.get('error') || '');
        setErrorCode(searchParams.get('error_code') || '');
        setErrorDescription(searchParams.get('error_description') || '');
    }, []);

    return (
        <>
            <div className='mx-4 mt-4'>
                <Alert className='w-full md:w-1/2 lg:w-1/3 mx-auto border-none'>
                    <TriangleAlert className='w-7 h-7 mt-1 ml-0' />
                    <AlertTitle className=' ml-4 text-3xl'>
                        {errorCode ? errorCode : '로그인 오류'}
                    </AlertTitle>
                    <AlertDescription className='ml-4'>
                        <p className='font-bold text-xl'>{error}</p>
                        <p>{errorDescription}</p>
                    </AlertDescription>
                </Alert>
                {errorDescription === 'Error getting user email from external provider' && (
                    <Alert className='w-full md:w-1/2 lg:w-1/3 mx-auto mt-4'>
                        <>
                            <ArrowRight className='w-7 h-7' />
                            <AlertTitle className='ml-4 text-lg'>
                                X 계정에 이메일 주소를 등록해 주세요.
                            </AlertTitle>
                            <AlertDescription className='ml-4'>
                                이 오류는 로그인에 사용된 X 계정에 이메일 주소가 등록되지 않은 경우 발생합니다. X 계정에 이메일 주소를 등록하거나 Google 계정으로 로그인 해주세요.
                            </AlertDescription>
                        </>
                    </Alert>
                )}
                {errorDescription === 'Flow state not found' && (
                    <Alert className='w-full md:w-1/2 lg:w-1/3 mx-auto mt-4'>
                        <>
                            <ArrowRight className='w-7 h-7' />
                            <AlertTitle className='ml-4 text-lg'>
                                인터넷 사용 기록을 삭제한 후 브라우저를 새로고침 해주세요.
                            </AlertTitle>
                            <AlertDescription className='ml-4'>
                                현재 이 문제의 원인을 조사하고 있습니다. 불편을 드려 죄송합니다.
                            </AlertDescription>
                        </>
                    </Alert>
                )}
 
            </div>
            <div>
                
            </div>
        </>
    );
}