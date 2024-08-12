"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import {
	Bookmark,
	PencilLine,
	User,
	LogOut,
	LogIn,
	Settings,
	UserRoundX,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { UserStateContext } from "@/providers";
import { useContext, useEffect, useCallback, useState } from "react";
import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogClose,
	DialogFooter,
	DialogDescription,
	DialogTitle,
	DialogHeader,
} from "@/components/ui/dialog";
import KiteLogo from "@/public/kite.svg";
import Image from "next/image";
export function TopMenuDesktop() {
	const [open, setOpen] = useState(false);
	const pathname = usePathname();
	const isSticky = pathname === "/";
	const { theme, setTheme } = useTheme();
	const router = useRouter();
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

	/*
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

*/
	return (
		<div
			className={cn(
				"bg-background/80 backdrop-blur-md py-1 border-none relative top-0 z-40",
				{
					"sticky z-50 top-0": isSticky,
				},
			)}
		>
			<div className="flex justify-between mx-6 xl:mx-96">
				<div className="flex gap-2">
					<Link href="/">
						<Button variant="ghost" size="icon">
							<Image
								src={KiteLogo}
								alt="Kite 로그인"
								className="dark:invert"
								width={20}
								height={20}
							/>
						</Button>
					</Link>
					<Link href="/booth">
						<Button variant="ghost">부스</Button>
					</Link>
				</div>
				<Button className="hidden" onClick={() => setTheme("light")} />

				<Button className="hidden" onClick={() => setTheme("dark")} />

				<Button className="hidden" onClick={() => setTheme("system")} />
				<div className="flex gap-2">
					<Link href="/write">
						<Button size="icon" variant="ghost">
							<PencilLine />
						</Button>
					</Link>
					<Dialog open={open} onOpenChange={setOpen}>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button size="icon" variant="ghost">
									<User />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-auto">
								<DropdownMenuItem
									className="flex justify-between items-center"
									onClick={() => {
										const path =
											window.location.pathname + window.location.search;
										router.push(`http://auth.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}?next=${encodeURIComponent(path)}`);
									}}
								>
									<span>로그인</span>
									<LogIn className="h-4 w-4" />
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>회원 탈퇴</DialogTitle>
								<DialogDescription>
									이 작업은 취소할 수 없습니다.
								</DialogDescription>
							</DialogHeader>
							<DialogFooter>
								<Button variant="destructive">회원 탈퇴</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			</div>
		</div>
	);
}
