import { Button } from "./ui/button";
import Image from "next/image";
import GoogleLogo from "@/public/google.svg";
import XLogo from "@/public/x.svg";
import { CardContent, CardDescription, CardFooter } from "./ui/card";
import Link from "next/link";

export default function SignInPage() {
	return (
		<>
			<CardContent className="flex flex-row gap-2">
				<div className="w-full">
					<GoogleSignIn />
				</div>
				<div className="w-full">
					<TwitterSignIn />
				</div>
			</CardContent>
			<CardFooter className="flex flex-col gap-2">
				<CardDescription className="text-start">
					계속하면{" "}
					<Link href={"https://kitebooth.com/privacypolicy.md"}>
						<span className="underline">개인정보 처리방침</span>
					</Link>
					에 동의하는 것으로 간주됩니다.
				</CardDescription>
			</CardFooter>
		</>
	);
}

export function GoogleSignIn() {
	return (
		<form
			action={async () => {
				"use server";
			}}
		>
			<Button size="lg" variant="secondary" className="w-full rounded-xl h-16">
				<Image
					src={GoogleLogo}
					alt="Google로 계속하기"
					width={30}
					height={30}
				/>
			</Button>
		</form>
	);
}

export function TwitterSignIn() {
	return (
		<form
			action={async () => {
				"use server";
			}}
		>
			<Button size="lg" variant="secondary" className="w-full rounded-xl h-16">
				<Image
					src={XLogo}
					alt="Twitter로 계속하기"
					className="dark:invert"
					width={24}
					height={24}
				/>
			</Button>
		</form>
	);
}
