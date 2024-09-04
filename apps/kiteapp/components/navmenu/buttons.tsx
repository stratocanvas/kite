"use client";
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
import { LogIn, LogOut, Settings, Bookmark, PencilLine } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { handleSignOut } from "./actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function SignInButton({ mobile }: { mobile?: boolean }) {
	const signInUrl = new URL(
		process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:3001",
	);
	const currentPath = usePathname();
	signInUrl.searchParams.set("service", "kite");
	signInUrl.searchParams.set("next", currentPath);
	return (
		<Link href={signInUrl}>
			{mobile ? (
				<div className="flex items-center w-full">
					<LogIn className="h-4 w-4 mr-3 text-muted-foreground" />
					<span className="font-bold">로그인</span>
				</div>
			) : (
				<DropdownMenuItem className="flex justify-between items-center">
					<span>로그인</span>
					<LogIn className="h-4 w-4" />
				</DropdownMenuItem>
			)}
		</Link>
	);
}

export function SignOutButton({ mobile }: { mobile?: boolean }) {
	const signOut = () =>
		new Promise<void>((resolve, reject) => {
			handleSignOut().then(resolve).catch(reject);
		});

	return (
		<>
			{mobile ? (
				<button
					type="button"
					className="flex items-center w-full"
					onClick={() => {
						toast.promise(signOut(), {
							loading: "로그아웃 중...",
							success: "로그아웃 완료",
							error: "로그아웃 실패",
						});
					}}
				>
					<LogOut className="h-4 w-4 mr-3 text-muted-foreground" />
					<span className="font-bold">로그아웃</span>
				</button>
			) : (
				<DropdownMenuItem
					className="flex justify-between items-center"
					onClick={() => {
						toast.promise(signOut(), {
							loading: "로그아웃 중...",
							success: "로그아웃 완료",
							error: "로그아웃 실패",
						});
					}}
				>
					<span>로그아웃</span>
					<LogOut className="h-4 w-4" />
				</DropdownMenuItem>
			)}
		</>
	);
}

export function BookmarksButton({ mobile }: { mobile?: boolean }) {
	return (
		<Link href="/bookmark">
			{mobile ? (
				<div className="flex items-center w-full">
					<Bookmark className="h-4 w-4 mr-3 text-muted-foreground" />
					<span className="font-bold">북마크</span>
				</div>
			) : (
				<DropdownMenuItem className="flex justify-between items-center">
					<span>북마크</span>
					<Bookmark className="h-4 w-4" />
				</DropdownMenuItem>
			)}
		</Link>
	);
}

export function SettingsButton({ mobile }: { mobile?: boolean }) {
	return (
		<Link href="/settings">
			{mobile ? (
				<div className="flex items-center w-full">
					<Settings className="h-4 w-4 mr-3 text-muted-foreground" />
					<span className="font-bold">설정</span>
				</div>
			) : (
				<DropdownMenuItem className="flex justify-between items-center">
					<span>설정</span>
					<Settings className="h-4 w-4" />
				</DropdownMenuItem>
			)}
		</Link>
	);
}

export function WriteButton({ mobile }: { mobile?: boolean }) {
	return (
		<Link href="/write">
			{mobile ? (
				<div className="flex items-center w-full">
					<PencilLine className="h-4 w-4 mr-3 text-muted-foreground" />
					<span className="font-bold">부스 등록</span>
				</div>
			) : (
				<DropdownMenuItem className="flex justify-between items-center">
					<span>부스 등록</span>
					<PencilLine className="h-4 w-4" />
				</DropdownMenuItem>
			)}
		</Link>
	);
}
