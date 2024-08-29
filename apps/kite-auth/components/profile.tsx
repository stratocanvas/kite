import { auth } from "@/lib/auth/auth";
import { DeleteAccount, Unlink, SignOut } from "./destructive";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import GoogleLogo from "@/public/google.svg";
import XLogo from "@/public/x.svg";
import Image from "next/image";
import { Label } from "@radix-ui/react-label";
import { Link } from "./signin";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "./ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export default async function Profile() {
	const session = await auth();

	if (!session?.user) return null;

	return (
		<div className="flex flex-col gap-4">
			<div className="flex justify-between">
				<div className="flex flex-row gap-4 items-center">
					<Avatar>
						<AvatarImage src={session.user.image} />
						<AvatarFallback>{session.user.name[0]}</AvatarFallback>
					</Avatar>
					<p>{session.user.name}</p>
				</div>
			</div>
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">연결된 계정</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-3">
					<ConnectedAccounts provider="google" />
					<ConnectedAccounts provider="twitter" />
				</CardContent>
			</Card>
			<SignOut />
			<Accordion type="single" collapsible>
				<AccordionItem value="item-1" className="border-none">
					<AccordionTrigger>위험 구역</AccordionTrigger>
					<AccordionContent className="w-full">
						<DeleteAccount id={session.user.id} />
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		</div>
	);
}

const ConnectedAccounts = async ({ provider }: { provider: string }) => {
	const session = await auth();
	if (!session?.user) return null;
	const size = provider === "google" ? 24 : 20;
	return (
		<div className="flex justify-between items-center w-full">
			<div className="flex flex-row gap-3 items-center">
				<Image
					src={provider === "google" ? GoogleLogo : XLogo}
					alt={`연결된 ${provider}계정`}
					className={provider === "twitter" ? "dark:invert mr-1" : ""}
					width={size}
					height={size}
				/>
				<Label
					className={session.user?.[provider] ? "" : "text-muted-foreground"}
				>
					{session.user?.[provider]
						? session.user?.[provider].name
						: "연결 안 됨"}
				</Label>
			</div>
			{session.user?.google && session.user?.twitter && (
				<Unlink
					id={session.user.id}
					provider={provider}
					providerId={session.user?.[provider].id}
				/>
			)}
			{!session.user?.[provider] && <Link provider={provider} />}
		</div>
	);
};
