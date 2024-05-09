'use client'
import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation';
import { fetchUser } from "./fetch";


export default function AuthorAuth({ authDialogOpen, setAuthDialogOpen }: { authDialogOpen: any, setAuthDialogOpen: any }) {
    const supabase = createClient();
    const [twitter, setTwitter] = useState(false);
    const [user, setUser] = useState(false);
    const router = useRouter();

    const Connect = () => {
        const path = window.location.pathname + window.location.search;
        const searchParams = new URLSearchParams(window.location.search);

        if (!user) {
            searchParams.set('next', encodeURIComponent(path));
            router.push(`${decodeURIComponent(path)}/auth?${searchParams.toString()}`);
        }
        if (!twitter) {
            supabase.auth.linkIdentity({
                provider: 'twitter',
                options: {
                    redirectTo: `${origin}${path}/auth/connect?next=${encodeURIComponent(path)}`
                }
            });
        }
    }

    //경고. 이 부분은 server side로 보내야 함.
    useEffect(() => {
        async function checkProvider() {
            const user = await fetchUser();
            if (user) {
                setUser(true);
                if (user.app_metadata.providers.includes('twitter')) {
                    setTwitter(true);
                }
            }
        }
        checkProvider();
    }, []);
    return (
        <>
            <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>이 부스의 작가님이 맞는지 확인할게요</DialogTitle>
                        <DialogDescription>
                            X 아이디로 로그인해주세요
                        </DialogDescription>
                    </DialogHeader>
                    <Button onClick={() => Connect()}>X 아이디로 인증하기</Button>
                    <DialogFooter>
                        <Button variant="link">X 아이디가 없어요</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
