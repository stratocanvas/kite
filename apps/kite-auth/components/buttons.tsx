'use client'
import {
  deleteAccount,
  handleSignOut,
  unlinkProfile,
  editProfile,
} from '@/lib/auth/accountActions'
import { Button } from './ui/button'
import { useRouter } from 'next/navigation'
import { useMediaQuery } from 'react-responsive'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './ui/drawer'
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
} from './ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import React from 'react'
import { Input } from './ui/input'
import { LogOut, UserRoundX, X, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Label } from './ui/label'
import { debounce } from 'es-toolkit'
import { checkUID } from '@/app/api/checkUID/query'

export function Unlink({ provider }: { provider: string }) {
  const router = useRouter()
  const unlink = async () => {
    const res = await unlinkProfile(provider)
    if (res) {
      router.refresh()
    }
  }
  return (
    <Button
      variant="secondary"
      onClick={() => {
        toast.promise(unlink(), {
          loading: '연결 해제중...',
          success: '연결 해제됨',
          error: '연결 해제 실패',
        })
      }}
    >
      해제
    </Button>
  )
}

export function DeleteAccount() {
  const [input, setInput] = React.useState('')
  const challenge = '회원 탈퇴'
  const isDesktop: boolean = useMediaQuery({
    query: '(min-width:768px)',
  })
  const router = useRouter()
  const goodbye = async () => {
    const success = await deleteAccount()
    if (!success) {
      throw new Error()
    }
    router.refresh()
  }

  const openButton = (
    <Button variant="destructive" size="lg" className="w-full">
      <UserRoundX className="h-4 w-4 mr-2" />
      회원 탈퇴
    </Button>
  )

  const description = (
    <>
      탈퇴 즉시 사용자의 계정 정보가 완전히 삭제되며 되돌릴 수 없어요.
      <br />
      사용자가 등록한 부스와 게시글은 자동으로 삭제되지 않아요.
    </>
  )

  const highlightText = (input: string, challenge: string) => {
    return challenge.split('').map((char, index) => {
      let colorClass = 'currentColor'
      if (index < input.length) {
        colorClass = input[index] === char ? 'text-cyan-500' : 'text-red-500'
      }
      return (
        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
        <span key={index} className={colorClass}>
          {char}
        </span>
      )
    })
  }

  const confirmation = (
    <>
      <p className="mb-1 md:-mb-2">
        계속하려면{' '}
        <span className="font-bold">{highlightText(input, challenge)}</span> 를
        입력하세요.
      </p>
      <Input
        className="text-[16px]"
        onChange={(e) => setInput(e.target.value)}
        placeholder="회원 탈퇴"
        value={input}
      />
    </>
  )

  const confirmButton = (
    <Button
      variant="destructive"
      onClick={() => {
        toast.promise(goodbye(), {
          loading: '탈퇴중...',
          success: '탈퇴 완료',
          error: '탈퇴 실패',
        })
      }}
      disabled={input !== challenge}
      className="w-full"
    >
      회원 탈퇴
    </Button>
  )
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
              setInput('')
            }}
          >
            취소
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={input !== challenge}
            className="bg-transparent hover:bg-transparent px-0"
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
                setInput('')
              }}
            >
              취소
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export function SignOut() {
  const signOut = () =>
    new Promise<void>((resolve, reject) => {
      handleSignOut().then(resolve).catch(reject)
    })

  return (
    <Button
      type="submit"
      className="w-full"
      variant="secondary"
      size="lg"
      onClick={() => {
        toast.promise(signOut(), {
          loading: '로그아웃 중...',
          success: '로그아웃 완료',
          error: '로그아웃 실패',
        })
      }}
    >
      <LogOut className="h-4 w-4 mr-2" />
      로그아웃
    </Button>
  )
}

export function EditProfile() {
  const router = useRouter()
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [input, setInput] = React.useState('')
  const [open, setOpen] = React.useState(false)

  const isDesktop = useMediaQuery({ query: '(min-width:768px)' })

  const edit = async () => {
    const success = await editProfile(name)
    if (!success) {
      throw new Error()
    }
    router.refresh()
  }
  const debouncedSetEmail = React.useCallback(debounce(setEmail, 500), [])
  const { data } = checkUID(email)
  const formContent = (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        toast.promise(edit(), {
          loading: '변경중...',
          success: '변경 완료',
          error: '변경 실패',
        })
        setOpen(false)
        setName('')
      }}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="username">닉네임</Label>
        <Input
          id="username"
          className="text-[16px]"
          onChange={(e) => setName(e.target.value)}
          value={name}
        />
        <Label htmlFor="email">아이디</Label>
        <Input
          id="email"
          className="text-[16px]"
          onChange={(e) => {
            setInput(e.target.value)
            debouncedSetEmail(e.target.value)
          }}
          value={input}
        />
        {email &&
          (data?.available ? (
            <div className="flex gap-2 text-sm items-center">
              <Check className="h-4 w-4 text-green-500" strokeWidth={4} />
              <p>사용 가능한 아이디입니다.</p>
            </div>
          ) : (
            <div className="flex gap-2 text-sm items-center">
              <X className="h-4 w-4 text-red-500" strokeWidth={4} />
              <p>{data?.cause}</p>
            </div>
          ))}
      </div>
      <Button type="submit" disabled={!data?.available}>
        변경
      </Button>
    </form>
  )

  return isDesktop ? (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">변경</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>프로필 변경</DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  ) : (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="secondary">변경</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>프로필 변경</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 mb-4">{formContent}</div>
      </DrawerContent>
    </Drawer>
  )
}
