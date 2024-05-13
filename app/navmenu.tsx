"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"
import { Bookmark, PencilLine, User, LogOut, LogIn, Settings, UserRoundX } from "lucide-react"
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { GetUser, SignOut } from "@/app/api/auth/fetch"
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast"
import { UserStateContext } from "@/providers"
import { useContext, useEffect, useCallback, useState } from "react";
import { deleteUser } from "@/app/api/auth/deleteuser";
import { Dialog, DialogTrigger, DialogContent, DialogClose, DialogFooter, DialogDescription, DialogTitle, DialogHeader } from "@/components/ui/dialog"
import kitelogo from "@/assets/kitelogo.svg"

export function TopMenuDesktop() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname();
  const isSticky = pathname === '/';
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const { userData, setUserData } = useContext(UserStateContext);
  /*
    const [events, setEvents] = React.useState<{ value: number, label: string, location: string, start_date: Date, end_date: Date }[]>([]);
  
    React.useEffect(() => {
      const fetchOptions = async () => {
        const { data, error } = await supabase
          .from('event')
          .select('event_id, name, location, start_date, end_date')
        if (error) console.error('Error fetching data', error);
        else {
          setEvents(data.map(item => ({
            value: item.event_id,
            label: item.name,
            location: item.location,
            start_date: item.start_date,
            end_date: item.end_date
          })));
        }
      };
      fetchOptions();
    }, [])
  */

  useEffect(() => {
    if (theme !== 'system') {
      setTheme('system')
    }
  }, [theme])

  const fetchUser = useCallback(async () => {
    const data = await GetUser();
    setUserData(data);
  }, [setUserData]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser])

  const handleSignOut = useCallback(async () => {
    await SignOut();
    setUserData(null);
    toast({
      description: "로그아웃 되었습니다.",
    })
  }, [setUserData]);

  const handleDeleteUser = useCallback(async () => {
    if (userData) {
      await deleteUser(userData.id);
      setUserData(null);
      toast({
        description: "회원 탈퇴 되었습니다.",
      })
      router.push("/")
      setOpen(false)
    }
  }, [userData, router, setOpen, setUserData]);


  return (
    <div className={cn("bg-background/80 backdrop-blur-md py-1 border-none relative top-0 z-40", {
      "sticky z-50 top-0": isSticky,
    })}>
      <div className="flex justify-between mx-6 xl:mx-96">
        <div className="flex gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <svg width="18" height="18" viewBox="0 0 170 170" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M170 0H0V148.753L74.3734 74.3794L74.3765 74.3763L74.3796 74.3794L95.5725 74.4334L95.6265 95.6263L95.6304 95.6302L21.2606 170H170V0Z" fill="currentcolor" />
              </svg>
            </Button>
          </Link>
          <Link href="/booth">
            <Button variant="ghost">
              부스
            </Button>
          </Link>
        </div>
        <Button className="hidden" onClick={() => setTheme('light')} />

        <Button className="hidden" onClick={() => setTheme('dark')} />

        <Button className="hidden" onClick={() => setTheme('system')} />
        <div className="flex gap-2">
          <Link href="/write">
            <Button size="icon" variant="ghost">
              <PencilLine />
            </Button>
          </Link>
          <Dialog open={open} onOpenChange={setOpen}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost"><User /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-auto">
                {userData ? (
                  <>
                    <DropdownMenuLabel>{userData?.n_name}</DropdownMenuLabel>
                    <DropdownMenuLabel className="text-muted-foreground text-sm -mt-2">@{userData?.name}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem>
                        <Link href="/dashboard" className="w-full">
                          <div className="flex justify-between items-center">
                            <span>북마크</span>
                            <Bookmark className="h-4 w-4" />
                          </div>
                        </Link>
                      </DropdownMenuItem>
                      {/*
                    <DropdownMenuItem className="flex justify-between">
                      <Link href="/settings" className="w-full">
                        <div className="flex justify-between items-center">
                          <span>설정</span>
                          <Settings className="h-4 w-4" />
                        </div>
                      </Link>
                    </DropdownMenuItem>
                     */ }
                      <DropdownMenuSeparator />
                    </DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => {
                      handleSignOut()

                    }} className="flex justify-between items-center">
                      <span>로그아웃</span>
                      <LogOut className="h-4 w-4" />
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem >
                      <DialogTrigger className="w-full">
                        <div className="flex justify-between items-center">
                          <span className="text-red-500 hover:text-red-500">회원 탈퇴</span>
                          <UserRoundX className="text-red-500 hover:text-red-500 w-4 h-4" />
                        </div>
                      </DialogTrigger>

                    </DropdownMenuItem>

                  </>
                ) : (
                  <>
                    <DropdownMenuItem className="flex justify-between items-center" onClick={() => {
                      const path = window.location.pathname + window.location.search;
                      router.push(`/auth?next=${encodeURIComponent(path)}`);
                    }}>
                      <span>로그인</span>
                      <LogIn className="h-4 w-4" />
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  회원 탈퇴
                </DialogTitle>
                <DialogDescription>
                  이 작업은 취소할 수 없습니다.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="destructive" onClick={() => {
                  handleDeleteUser()
                }}>
                  회원 탈퇴
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
