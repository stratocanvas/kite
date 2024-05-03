'use client'

import { useCallback, useState, useEffect } from 'react';
import { GetBookmark, SetBookmark } from "../actions";
import { Button } from '@/components/ui/button'
import { Heart, HeartOff, ThumbsDown, Flag, Siren, Ellipsis, Pencil, MessageCircleWarning } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import useSWR from 'swr';
import { useRouter } from 'next/navigation'
import AuthorAuth from "../auth/author-auth"
import Link from "next/link";
import CheckOwner from "./owner";

function useBoothMenu(boothId: string, authorData: any) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const router = useRouter();
    const { data: bookmarked, mutate } = useSWR(boothId, GetBookmark, { revalidateOnFocus: false });

    const changeBookmark = useCallback(async () => {
        mutate(!bookmarked, false);

        try {
            const result = await SetBookmark(boothId, !bookmarked);
            if (result && result.errorType === 'userError') {
                if (typeof window !== "undefined") {
                    const path = window.location.pathname + window.location.search;
                    router.push(`/auth?next=${encodeURIComponent(path)}`);
                }
            }
        } catch (error) {
            console.error("Error setting bookmark:", error);
        }
    }, [boothId, bookmarked, mutate, router]);

    useEffect(() => {
        const checkOwnership = async () => {
            const authorIds = authorData.map((author) => author.author_id);
            const result = await CheckOwner(authorIds);
            setIsOwner(result);
        };
        checkOwnership();
    }, [authorData]);

    return {
        dialogOpen,
        setDialogOpen,
        isOwner,
        bookmarked,
        changeBookmark,
    };
}



export function BoothMenu({ data }: { data: any }) {
    const { dialogOpen, setDialogOpen, isOwner, bookmarked, changeBookmark } = useBoothMenu(
        data.booth_id,
        data.author
    );

    return (
        <div className="absolute right-0 top-0 z-10 flex gap-4 m-4">
            <Button
                onClick={changeBookmark}
                size="icon"
                variant="ghost"
                className={`w-8 h-8 rounded-full backdrop-blur ${bookmarked ? 'bg-white/60 hover:bg-white/70' : 'bg-black/40 hover:bg-black/20'
                    }`}
            >
                <Heart
                    fill={bookmarked ? "rgba(0, 0, 0, 0.8)" : "none"}
                    className='w-5 h-5'
                    style={{ color: bookmarked ? 'rgba(0, 0, 0, 0.2)' : 'white' }}
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
                        {bookmarked ? (
                            <DropdownMenuItem onClick={changeBookmark} className="flex justify-between">
                                <span>찜 목록에서 제거</span>
                                <HeartOff className="ml-4 h-4 w-4" />
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem onClick={changeBookmark} className="flex justify-between">
                                <span>찜 목록에 추가</span>
                                <Heart className="ml-4 h-4 w-4" />
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        {isOwner ? (
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
                                <DropdownMenuItem className="flex justify-between" onSelect={() => setDialogOpen(true)}>
                                    <span>편집 권한 얻기</span>
                                    <Flag className="ml-4 h-4 w-4" />
                                </DropdownMenuItem>

                            </>
                        )}
                        <DropdownMenuItem className="flex justify-between">
                            <span>오류 제보</span>
                            <MessageCircleWarning className="ml-4 h-4 w-4" />
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex justify-between">
                            <span>악용 신고</span>
                            <Siren className="ml-4 h-4 w-4" />
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
            <AuthorAuth dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} />
        </div>
    )
}

export function BoothMenu2({ data }: { data: any }) {
    const { dialogOpen, setDialogOpen, isOwner, bookmarked, changeBookmark } = useBoothMenu(
        data.booth_id,
        data.author
    );

    return (
        <div className="flex gap-4">
            {bookmarked ? (
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
                        {bookmarked ? (
                            <DropdownMenuItem onClick={changeBookmark} className="flex justify-between">
                                <span>찜 목록에서 제거</span>
                                <HeartOff className="ml-4 h-4 w-4" />
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem onClick={changeBookmark} className="flex justify-between">
                                <span>찜 목록에 추가</span>
                                <Heart className="ml-4 h-4 w-4" />
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        {isOwner ? (
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
                                <DropdownMenuItem className="flex justify-between" onSelect={() => setDialogOpen(true)}>
                                    <span>편집 권한 얻기</span>
                                    <Flag className="ml-4 h-4 w-4" />
                                </DropdownMenuItem>

                            </>
                        )}
                        <DropdownMenuItem className="flex justify-between">
                            <span>오류 제보</span>
                            <MessageCircleWarning className="ml-4 h-4 w-4" />
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex justify-between">
                            <span>악용 신고</span>
                            <Siren className="ml-4 h-4 w-4" />
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
            <AuthorAuth dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} />

        </div>
    )
}