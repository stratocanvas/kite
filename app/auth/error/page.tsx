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
        <div className='mx-4 mt-4'>
            <Alert className='w-full md:w-1/2 mx-auto'>
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
                <Alert className='w-full md:w-1/2 mx-auto mt-4'>
                    <>
                        <ArrowRight className='w-7 h-7' />
                        <AlertTitle className='ml-4 text-lg'>
                            X 계정에 이메일 주소가 설정되지 않은 것 같습니다.
                        </AlertTitle>
                        <AlertDescription className='ml-4'>
                            X 계정에 이메일 주소를 등록하거나 Google 계정으로 로그인 해주세요.
                        </AlertDescription>
                    </>
                </Alert>
            )}
        </div>
    );
}