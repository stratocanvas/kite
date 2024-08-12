import Image from "next/image";
import {
	Card,
	CardTitle,
	CardContent,
	CardFooter,
	CardHeader,
	CardDescription,
} from "@/components/ui/card";
import Link from "next/link";
import KiteLogo from "@/public/kite.svg";
import SignInPage, { GoogleSignIn, TwitterSignIn } from "@/components/sign-in";
import UserInfo from "@/components/userinfo";
export default async function Home() {
	return (
		<>
			<Card className="mx-auto justify-center items-center p-4 mt-[1vh] md:mt-[20vh] w-full md:w-1/2 lg:w-2/5 xl:w-1/3 border-0 shadow-none md:shadow-lg rounded-2xl md:border">
				<CardHeader>
					<div className="flex flex-col gap-6">
						<Image
							src={KiteLogo}
							alt="Kite 계정"
							className="dark:invert"
							width={32}
							height={32}
						/>
						<CardTitle>로그인</CardTitle>
					</div>
					<CardDescription>회원가입도 여기서 할 수 있어요. </CardDescription>
				</CardHeader>
				<SignInPage />
			</Card>
		</>
	);
}
