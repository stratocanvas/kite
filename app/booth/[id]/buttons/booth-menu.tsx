'use client'

import { useCallback, useState, useEffect, memo } from 'react';
import { GetBookmarks, SetBookmark } from "../../../api/auth/booth/buttons/actions";
import { Button } from '@/components/ui/button'
import { Heart, HeartOff, ThumbsDown, Flag, Siren, Ellipsis, Pencil, MessageCircleWarning, Info } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import useSWR, { useSWRConfig } from 'swr';
import { useRouter } from 'next/navigation'
import AuthorAuth from "../auth/author-auth"
import Link from "next/link";
import CheckOwner from "../../../api/auth/booth/buttons/owner";
import { useToast } from "@/components/ui/use-toast"
import { UserStateContext } from "@/providers"
import { useContext } from "react"
import Contact from '../contact/contact';

function useBoothMenu(boothId: string, authorData: any) {
    const { userData } = useContext(UserStateContext);
    const { data: wishlist, mutate } = useSWR('wishlist', GetBookmarks, { revalidateOnFocus: true, revalidateOnReconnect: true, revalidateOnMount: true });
    const { toast } = useToast();
    const router = useRouter();
    const [authDialogOpen, setAuthDialogOpen] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [contactDialogOpen, setContactDialogOpen] = useState(false);

    const changeBookmark = useCallback(async () => {
        if (!userData) {
            toast({
                description: "로그인이 필요합니다.",
            });
            const path = window.location.pathname + window.location.search;
            router.push(`/auth?next=${encodeURIComponent(path)}`);
            return;
        }

        const isBookmarked = wishlist?.some((item) => item.booth_id === boothId) ?? false;
        const updatedWishlist = isBookmarked
            ? (wishlist || []).filter((item) => item.booth_id !== boothId)
            : [...(wishlist || []), { booth_id: boothId }];

        mutate(updatedWishlist, false); // 로컬 데이터를 업데이트

        try {
            const result = await SetBookmark(boothId, !isBookmarked);
            mutate(); // 서버에서 최신 데이터를 다시 가져옴
        } catch (error) {
            console.error("Error setting bookmark:", error);
        }
    }, [boothId, wishlist, mutate, userData]);

    useEffect(() => {
        if (authorData) {
            const checkOwnership = async () => {
                const authorIds = authorData.map((author) => author.author_id);
                const result = await CheckOwner(authorIds);
                setIsOwner(result);
            };
            checkOwnership();
        }
    }, [authorData]);

    return {
        authDialogOpen,
        setAuthDialogOpen,
        isOwner,
        wishlist,
        changeBookmark,
        contactDialogOpen,
        setContactDialogOpen
    };
}



export function BoothMenu({ data }: { data: any }) {
    const { authDialogOpen, setAuthDialogOpen, isOwner, wishlist, changeBookmark, contactDialogOpen, setContactDialogOpen } = useBoothMenu(
        data.booth_id,
        data.author
    );

    return (
        <div className="absolute right-0 top-0 z-10 flex gap-4 m-4">
            <Button
                onClick={changeBookmark}
                size="icon"
                variant="ghost"
                className={`w-8 h-8 rounded-full backdrop-blur ${wishlist?.some((item) => item.booth_id === data.booth_id) ? 'bg-white/60 hover:bg-white/70' : 'bg-black/40 hover:bg-black/20'
                    }`}
            >
                <Heart
                    fill={wishlist?.some((item) => item.booth_id === data.booth_id) ? "rgba(0, 0, 0, 0.8)" : "none"}
                    className='w-5 h-5'
                    style={{ color: wishlist?.some((item) => item.booth_id === data.booth_id) ? 'rgba(0, 0, 0, 0.2)' : 'white' }}
                />
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" className="w-8 h-8 rounded-full backdrop-blur bg-black/40 hover:bg-black/20">
                        <Ellipsis className="w-5 h-5 text-white" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-auto mr-4">
                    <DropdownMenuGroup>
                        {wishlist?.some((item) => item.booth_id === data.booth_id) ? (
                            <DropdownMenuItem onClick={changeBookmark} className="flex justify-between">
                                <span>위시리스트에서 제거</span>
                                <HeartOff className="ml-4 h-4 w-4" />
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem onClick={changeBookmark} className="flex justify-between">
                                <span>위시리스트에 추가</span>
                                <Heart className="ml-4 h-4 w-4" />
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        {/* isOwner ? (
                            <>
                                <Link href={`/booth/${data.booth_id}/edit`}>
                                    <DropdownMenuItem className="flex justify-between">
                                        <span>편집</span>
                                        <Pencil className="ml-4 h-4 w-4" />
                                    </DropdownMenuItem>
                                </Link>
                            </>
                        ) : (
                            <>
                                <DropdownMenuItem className="flex justify-between" onSelect={() => setAuthDialogOpen(true)}>
                                    <span>편집 권한 얻기</span>
                                    <Flag className="ml-4 h-4 w-4" />
                                </DropdownMenuItem>

                            </>
                        )*/}
                        <DropdownMenuItem className="flex justify-between" onSelect={() => setContactDialogOpen(true)}>
                            <span>문의</span>
                            <Info className="ml-4 h-4 w-4" />
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
            {/*<AuthorAuth authDialogOpen={authDialogOpen} setAuthDialogOpen={setAuthDialogOpen} />*/}
            <Contact contactDialogOpen={contactDialogOpen} setContactDialogOpen={setContactDialogOpen} boothId={data.booth_id} />
        </div>
    )
}
export const LikeButton = memo(({ booth }: { booth: any }) => {
    const { mutate: globalMutate } = useSWRConfig();
    const { data: wishlist, mutate } = useSWR('wishlist', GetBookmarks, { revalidateOnFocus: true, revalidateOnReconnect: true, revalidateOnMount: true });
    const router = useRouter();

    const changeBookmark = useCallback(async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation(); // 이벤트 버블링 막기
        event.preventDefault(); // 기본 이벤트 방지

        const isBookmarked = wishlist?.some((item) => item.booth_id === booth.booth_id) ?? false;
        const updatedWishlist = isBookmarked
            ? (wishlist || []).filter((item) => item.booth_id !== booth.booth_id)
            : [...(wishlist || []), { booth_id: booth.booth_id }];

        mutate(updatedWishlist, false); // 로컬 데이터를 업데이트

        try {
            const result = await SetBookmark(booth.booth_id, !isBookmarked);
            globalMutate('wishlist');
            if (result && result.errorType === 'userError') {
                if (typeof window !== "undefined") {
                    const path = window.location.pathname + window.location.search;
                    router.push(`/auth?next=${encodeURIComponent(path)}`);
                }
            }
        } catch (error) {
            console.error("Error setting bookmark:", error);
        }
    }, [booth.booth_id, wishlist, mutate, globalMutate, router]);

    return (
        <Button
            role='button'
            onClick={changeBookmark}
            size="icon"
            variant={wishlist?.some((item) => item.booth_id === booth.booth_id) ? "default" : "secondary"}
            className="w-8 h-8 rounded-full booth-menu-button"
        >
            <Heart fill={wishlist?.some((item) => item.booth_id === booth.booth_id) ? "currentColor" : "none"} className='w-5 h-5' />
        </Button>
    );
});

export function BoothMenu2({ data }: { data: any }) {
    const { authDialogOpen, setAuthDialogOpen, isOwner, wishlist, changeBookmark, contactDialogOpen, setContactDialogOpen } = useBoothMenu(
        data.booth_id,
        data.author
    );

    return (
        <div className="flex gap-4">
            {wishlist?.some((item) => item.booth_id === data.booth_id) ? (
                <Button onClick={changeBookmark} size="icon" variant="default" className="w-8 h-8 rounded-full">
                    <Heart fill="currentColor" className='w-5 h-5' />
                </Button>
            ) : (
                <Button onClick={changeBookmark} size="icon" variant="secondary" className="w-8 h-8 rounded-full">
                    <Heart className='w-5 h-5' />
                </Button>
            )}

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="secondary" className="w-8 h-8 rounded-full">
                        <Ellipsis className="w-5 h-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-auto mr-4">
                    <DropdownMenuGroup>
                        {wishlist?.some((item) => item.booth_id === data.booth_id) ? (
                            <DropdownMenuItem onClick={changeBookmark} className="flex justify-between">
                                <span>위시리스트에서 제거</span>
                                <HeartOff className="ml-4 h-4 w-4" />
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem onClick={changeBookmark} className="flex justify-between">
                                <span>위시리스트에 추가</span>
                                <Heart className="ml-4 h-4 w-4" />
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        {/* isOwner ? (
                            <>
                                <Link href={`/booth/${data.booth_id}/edit`}>
                                    <DropdownMenuItem className="flex justify-between">
                                        <span>편집</span>
                                        <Pencil className="ml-4 h-4 w-4" />
                                    </DropdownMenuItem>
                                </Link>
                            </>
                        ) : (
                            <>
                                <DropdownMenuItem className="flex justify-between" onSelect={() => setAuthDialogOpen(true)}>
                                    <span>편집 권한 얻기</span>
                                    <Flag className="ml-4 h-4 w-4" />
                                </DropdownMenuItem>

                            </>
                        ) */}
                        <DropdownMenuItem className="flex justify-between" onSelect={() => setContactDialogOpen(true)}>
                            <span>문의</span>
                            <Info className="ml-4 h-4 w-4" />
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
            {/*<AuthorAuth authDialogOpen={authDialogOpen} setAuthDialogOpen={setAuthDialogOpen} />*/}
            <Contact contactDialogOpen={contactDialogOpen} setContactDialogOpen={setContactDialogOpen} boothId={data.booth_id} />
        </div>
    )
}