"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"
import { Bookmark, PencilLine, User, LogOut, LogIn, Settings } from "lucide-react"
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"
import { GetUser } from "@/app/fetch"
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast"
import { UserStateContext } from "@/providers"
import { useContext, useEffect, useLayoutEffect } from "react";

const supabase = createClient()
export function TopMenuDesktop() {
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

  const fetchUser = async () => {
    const data = await GetUser();
    setUserData(data);
  };

  useLayoutEffect(() => {
    fetchUser();
  }, [userData])

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUserData(null);
  };

  return (
    <div className={cn("bg-background/80 backdrop-blur-md py-1 border-none relative top-0 z-40", {
      "sticky z-50 top-0": isSticky,
    })}>
      <div className="flex justify-between mx-6 xl:mx-96">
        <div className="flex gap-2">
          <Link href="/">
            <Button variant="ghost">
              Kite
            </Button>
          </Link>
          <Link href="/booth">
            <Button variant="ghost">
              부스
            </Button>
          </Link>
        </div>
        <Button className="hidden" onClick={() => setTheme('light')}>
          라이트
        </Button>
        <Button className="hidden" onClick={() => setTheme('dark')}>
          다크
        </Button>
        <Button className="hidden" onClick={() => setTheme('system')}>
          시스템
        </Button>
        <div className="flex gap-2">
          <Link href="/write">
            <Button variant="ghost">
              <PencilLine />
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost"><User /></Button>
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
                    toast({
                      description: "로그아웃 되었습니다.",
                    })
                  }} className="flex justify-between items-center">
                    <span>로그아웃</span>
                    <LogOut className="h-4 w-4" />
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
        </div>
      </div>
    </div>
  )
}
