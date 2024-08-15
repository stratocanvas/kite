import Image from "next/image";
import {
	Card,
	CardTitle,
	CardHeader,
	CardDescription,
	CardContent,
	CardFooter,
} from "@/components/ui/card";
import KiteLogo from "@/public/kite.svg";
import { SignIn } from "@/components/signin";
import Link from "next/link";
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
				<CardContent className="flex flex-row gap-2">
					<div className="w-full">
						<SignIn provider="google" />
					</div>
					<div className="w-full">
						<SignIn provider="twitter" />
					</div>
				</CardContent>
				<CardFooter className="flex flex-col gap-2">
					<CardDescription className="text-start">
						계속하면{" "}
						<Link
							href={`https://${process.env.NEXT_PUBLIC_BASE_URL}/privacypolicy`}
						>
							<span className="underline">개인정보 처리방침</span>
						</Link>
						에 동의하는 것으로 간주됩니다.
					</CardDescription>
				</CardFooter>
			</Card>
		</>
	);
}
