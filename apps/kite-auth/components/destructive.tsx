"use client";
import {
	deleteAccount,
	handleSignOut,
	unlinkProfile,
} from "@/lib/auth/accountActions";
import { useSession } from "next-auth/react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "react-responsive";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "./ui/drawer";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "./ui/alert-dialog";
import React from "react";
import { Input } from "./ui/input";
import { LogOut, UserRoundX } from "lucide-react";
import { toast } from "sonner";

export function Unlink({
	id,
	provider,
	providerId,
}: { id: string; provider: string; providerId: string }) {
	const router = useRouter();
	const unlink = async () => {
		const res = await unlinkProfile(id, provider, providerId);
		if (res) {
			router.refresh();
		}
	};
	return (
		<Button
			variant="secondary"
			onClick={() => {
				toast.promise(unlink(), {
					loading: "연결 해제중...",
					success: "연결 해제됨",
					error: "연결 해제 실패",
				});
			}}
		>
			해제
		</Button>
	);
}

export function DeleteAccount({ id }: { id: string }) {
	const [input, setInput] = React.useState("");
	const challenge = "회원 탈퇴";
	const isDesktop: boolean = useMediaQuery({
		query: "(min-width:768px)",
	});
	const goodbye = () => {
		return new Promise<void>((resolve, reject) => {
			deleteAccount(id)
				.then((success) => {
					if (success) {
						handleSignOut().then(resolve).catch(reject);
					} else {
						reject(new Error("Failed to delete account"));
					}
				})
				.catch(reject);
		});
	};

	const openButton = (
		<Button variant="destructive" size="lg" className="w-full">
			<UserRoundX className="h-4 w-4 mr-2" />
			회원 탈퇴
		</Button>
	);

	const description = (
		<>
			회원 탈퇴를 진행해도 등록한 부스는 삭제되지 않습니다.
			<br />
			회원 탈퇴는 취소할 수 없습니다.
		</>
	);

	const confirmation = (
		<>
			<p className="mb-1 md:-mb-2">
				계속하려면 <span className="font-bold">회원 탈퇴</span>를 입력하세요.
			</p>
			<Input
				className="text-[16px]"
				onChange={(e) => setInput(e.target.value)}
				placeholder="회원 탈퇴"
			/>
		</>
	);

	const confirmButton = (
		<Button
			variant="destructive"
			onClick={() => {
				toast.promise(goodbye(), {
					loading: "탈퇴중...",
					success: "탈퇴 완료",
					error: "탈퇴 실패",
				});
			}}
			disabled={input !== challenge}
		>
			회원 탈퇴
		</Button>
	);
	return isDesktop ? (
		<AlertDialog>
			<AlertDialogTrigger asChild>{openButton}</AlertDialogTrigger>
			<AlertDialogContent className="sm:max-w-[425px]">
				<AlertDialogHeader>
					<AlertDialogTitle>회원 탈퇴</AlertDialogTitle>
					<AlertDialogDescription>{description}</AlertDialogDescription>
				</AlertDialogHeader>
				{confirmation}
				<AlertDialogFooter>
					<AlertDialogCancel
						onClick={() => {
							setInput("");
						}}
					>
						취소
					</AlertDialogCancel>
					<AlertDialogAction
						asChild
						className="bg-destructive text-white hover:bg-destructive/90"
					>
						{confirmButton}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	) : (
		<Drawer dismissible={false}>
			<DrawerTrigger asChild>{openButton}</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader className="text-left">
					<DrawerTitle>회원 탈퇴</DrawerTitle>
					<DrawerDescription>{description}</DrawerDescription>
				</DrawerHeader>
				<div className="px-4">{confirmation}</div>
				<DrawerFooter className="mt-2">
					{confirmButton}
					<DrawerClose asChild>
						<Button
							variant="outline"
							onClick={() => {
								setInput("");
							}}
						>
							취소
						</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}

export function SignOut() {
	const signOut = () =>
		new Promise<void>((resolve, reject) => {
			handleSignOut().then(resolve).catch(reject);
		});

	return (
		<Button
			type="submit"
			className="w-full"
			variant="secondary"
			size="lg"
			onClick={() => {
				toast.promise(signOut(), {
					loading: "로그아웃 중...",
					success: "로그아웃 완료",
					error: "로그아웃 실패",
				});
			}}
		>
			<LogOut className="h-4 w-4 mr-2" />
			로그아웃
		</Button>
	);
}
