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
                            <svg width="620" height="175" viewBox="0 0 620 175" fill="currentcolor" xmlns="http://www.w3.org/2000/svg" className="w-auto h-5">
                                <path d="M199.2 172V1.59999H219.36V113.2L281.28 44.8H308.16L258 98.8L310.32 172H285.84L244.32 112.48L219.36 138.88V172H199.2ZM327.469 172V44.8H347.629V172H327.469ZM326.989 24.88V1.35999H348.109V24.88H326.989ZM415.813 172C392.773 172 381.973 161.92 381.973 139.36V62.56H363.253V44.8H381.973V15.04H402.133V44.8H435.973V62.56H402.133V138.88C402.133 150.4 407.173 154.24 417.733 154.24H435.973V172H415.813ZM503.625 174.88C467.625 174.88 445.305 148.72 445.305 108.4C445.305 68.08 467.625 41.92 502.665 41.92C535.785 41.92 558.825 65.92 558.825 108.64V114.64H466.425C467.865 142 481.545 155.68 503.625 155.68C520.185 155.68 530.985 147.28 535.305 134.32L556.905 136C550.185 158.8 530.505 174.88 503.625 174.88ZM536.745 96.88C534.825 72.4 521.385 61.12 502.665 61.12C482.985 61.12 469.785 73.36 466.425 96.88H536.745Z"/>
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M170 2H0V150.753L74.3734 76.3794L74.3765 76.3763L74.3796 76.3794L95.5725 76.4334L95.6265 97.6263L95.6304 97.6302L21.2606 172H170V2Z" />
                            </svg>

                        </CardTitle>
                        <CardDescription className="flex gap-4 items-center">
                            <Link href="/privacypolicy">개인정보처리방침</Link>
                            <Link href="mailto:admin@kitebooth.com"><Mail /></Link>
                            <Link href="https://twitter.com/kitebooth"><Twitter /></Link>
                        </CardDescription>
                    </div>
                </CardHeader>
            </Card>
        </footer>
    )
}