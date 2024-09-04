'use client'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Bookmark,
  PencilLine,
  User,
  LogOut,
  LogIn,
  Settings,
  UserRoundX,
  Menu,
  Store,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import KiteLogo from '@/public/kite.svg'
import Image from 'next/image'
import {
  SignInButton,
  SignOutButton,
  SettingsButton,
  BookmarksButton,
  WriteButton,
} from './buttons'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useMediaQuery } from 'react-responsive'
import React from 'react'
import { motion } from 'framer-motion'

export function NavBar({ session }: { session: any }) {
  const [isMounted, setIsMounted] = React.useState(false)
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' })
  React.useEffect(() => {
    setIsMounted(true)
  }, [])
  return (
    <div
      className={cn(
        'bg-background/80 backdrop-blur-md py-1 border-none relative top-0 z-40 sticky top-0',
      )}
    >
      <div className="flex justify-between mx-6 xl:mx-96">
        <div className="flex gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <Image
                src={KiteLogo}
                alt="Kite 로그인"
                className="dark:invert"
                width={20}
                height={20}
              />
            </Button>
          </Link>
          {isMounted && !isMobile && (
            <Link href="/booth">
              <Button variant="ghost">부스</Button>
            </Link>
          )}
        </div>
        <div className="flex gap-2">
          {isMobile ? (
            <MobileMenu session={session} />
          ) : (
            <DesktopMenu session={session} />
          )}
        </div>
      </div>
    </div>
  )
}

const MobileMenu = ({ session }: { session: any }) => {
  const [isOpen, setIsOpen] = React.useState(false)

  const menuItems = [
    { href: '/booth', label: '부스' },
    { href: '/write', label: '부스 등록' },
  ]
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button size="icon" variant="ghost">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col">
        <div className="flex flex-col h-full">
          <nav className="grid gap-4 text-2xl font-bold mt-8">
            {menuItems.map((item) => (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className="flex justify-between items-center"
                  onClick={() => setIsOpen(false)}
                >
                  <span>{item.label}</span>
                </Link>
              </div>
            ))}
          </nav>
          <div className="flex-grow" />
          <div className="pb-4">
            {session ? (
              <div className="flex flex-col gap-2 justify-between">
                <p className="font-bold">{session?.user?.name}</p>
                <p className="text-muted-foreground text-sm -mt-1 mb-4">
                  {session?.user?.email}
                </p>
                <BookmarksButton mobile />
                <SettingsButton mobile />
                <SignOutButton mobile />
              </div>
            ) : (
              <SignInButton mobile />
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

const DesktopMenu = ({ session }: { session: any }) => {
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost">
            <Menu />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-auto" align="end">
          {session && (
            <>
              <DropdownMenuLabel>
                <p>{session?.user?.name}</p>
                <p className="text-muted-foreground">{session?.user?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <BookmarksButton />
              <SettingsButton />
              <WriteButton />
              <SignOutButton />
            </>
          )}
          {!session && (
            <>
              <WriteButton />
              <SignInButton />
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
