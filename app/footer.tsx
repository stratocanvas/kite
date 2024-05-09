import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Mail, Twitter } from "lucide-react";

export default function Footer() {
    return (
        <footer>
            <Card className="border-none shadow-none bg-muted rounded-t-lg rounded-b-none">
                <CardHeader>
                    <div className="flex justify-between items-center xl:px-96">
                        <CardTitle className="text-md">
                            Kite
                        </CardTitle>
                        <CardDescription className="flex gap-4 items-center">
                            <Link href="mailto:admin@kitebooth.com"><Mail /></Link>
                            <Link href="https://twitter.com/kitebooth"><Twitter /></Link>
                        </CardDescription>
                    </div>
                </CardHeader>
            </Card>
        </footer>
    )
}