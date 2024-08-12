import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Intro() {
	return (
		<Card className="sm:w-full lg:w-[600px] mx-auto border-none shadow-none">
			<CardHeader>
				<div className="flex items-center gap-2 h-10">
					<CardTitle>부스 등록</CardTitle>
				</div>
			</CardHeader>
			<CardContent>
				<Link href="/write/add">
					<Button
						asChild
						type="button"
						className="w-full h-auto justify-start"
						variant="outline"
					>
						<Card>
							<CardHeader>
								<CardTitle>직접 등록하기</CardTitle>
								<CardDescription>부스 정보를 직접 입력합니다</CardDescription>
							</CardHeader>
						</Card>
					</Button>
				</Link>
			</CardContent>
			<CardContent>
				<Link href="/write/request">
					<Button
						asChild
						type="button"
						className="w-full h-auto justify-start"
						variant="outline"
					>
						<Card className="w-full">
							<CardHeader>
								<CardTitle>추가 요청하기</CardTitle>
								<CardDescription>
									부스 추가를 요청하면 Kite 팀에서 대신 등록합니다.
								</CardDescription>
							</CardHeader>
						</Card>
					</Button>
				</Link>
			</CardContent>
			<div className="w-full px-10" />
		</Card>
	);
}
