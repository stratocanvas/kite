'use client'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { User, ChevronLeft } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { SubmitContact } from "./submit"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
export default function Contact({ contactDialogOpen, setContactDialogOpen, boothId }: { contactDialogOpen: any, setContactDialogOpen: any, boothId: string }) {
    const [type, setType] = useState<'error' | 'delete' | 'abuse'>('')
    const [page, setPage] = useState<1 | 2>(1)
    const [description, setDescription] = useState('')

    const { toast } = useToast()
    const handleSubmit = async () => {
        try {
            await SubmitContact(type, description, boothId)
            setContactDialogOpen(false)
            toast({
                title: '문의가 제출되었습니다.',
                description: type === 'error' ? '오류 제보' : type === 'delete' ? '게시 중단 요청' : '악용 신고',
            })
        } catch (error) {
            toast({
                variant: 'destructive',
                title: '문의 제출에 실패했습니다.',
                description: '잠시 후 다시 시도해 주세요.',
            })

        }

    }

    return (
        <>
            <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>
                            {page === 1 ? (
                                <p className="text-center">
                                    문의
                                </p>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="w-auto h-auto"
                                        onClick={() => setPage(1)}
                                    >
                                        <ChevronLeft />
                                    </Button>
                                    <p className="text-center flex-grow">
                                        {type === 'error' ? '오류 제보' : type === 'delete' ? '게시 중단 요청' : '악용 신고'}
                                    </p>
                                    <div className="w-10" />
                                </div>
                            )}
                        </DialogTitle>
                    </DialogHeader>
                    {page === 1 ? (
                        <div className="w-full flex flex-col gap-2">
                            <Button variant="secondary" className="text-left justify-start h-auto" onClick={() => { setType('error'); setPage(2) }}>
                                <div>
                                    <p className="text-lg">
                                        오류 제보
                                    </p>
                                    <p className="text-muted-foreground">
                                        수정이 필요한 내용이 있습니다.
                                    </p>
                                </div>
                            </Button>
                            <Button variant="secondary" className="text-left justify-start h-auto" onClick={() => { setType('delete'); setPage(2) }}>
                                <div>
                                    <p className="text-lg">
                                        게시 중단 요청
                                    </p>
                                    <p className="text-muted-foreground">
                                        이 부스를 Kite에서 삭제합니다.
                                    </p>
                                </div>
                            </Button>
                            <Button variant="secondary" className="text-left justify-start h-auto" onClick={() => { setType('abuse'); setPage(2) }}>
                                <div>
                                    <p className="text-lg">
                                        악용 신고
                                    </p>
                                    <p className="text-muted-foreground">
                                        AI 생성물, 도용, 또는 부적절한 컨텐츠가 있습니다.
                                    </p>
                                </div>
                            </Button>
                        </div>
                    ) : (
                        <div>
                            <p className="mb-2">
                                문의 내용을 입력해 주세요
                            </p>
                            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
                            {type === 'delete' && (
                                <Alert className="mt-2">
                                    <User className="w-4 h-4" />
                                    <AlertTitle>
                                        본인 확인
                                    </AlertTitle>
                                    <AlertDescription>
                                        본인 확인을 위해 작가님의 X 계정으로 DM이 전송됩니다. DM을 수신할 수 있도록 DM을 열어두거나 <Link className="text-muted-foreground" href="https://x.com/@KiteBooth">@KiteBooth</Link>를 팔로우 해주세요
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        {page === 2 && (
                            <Button onClick={handleSubmit}>
                                문의 제출
                            </Button>
                        )}

                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
