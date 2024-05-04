"use client"

import * as React from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { useTheme } from "next-themes"
import { useEffect } from "react"
import { User } from "lucide-react"
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button"
export function TopMenuDesktop() {
  const [user, setUser] = React.useState(null)
  const router = useRouter()
  const pathname = usePathname();
  const isSticky = pathname === '/';
  const { theme, setTheme } = useTheme()

  React.useEffect(() => {
    if (theme !== 'system') {
      setTheme('system')
    }
  }, [theme])

  return (
    <div className={cn("bg-background py-1 border-none", {
      "sticky top-0 z-50": isSticky,
    })}>
      <NavigationMenu className="px-6 xl:px-96">
        <NavigationMenuList>
          <NavigationMenuItem className="bg-transparent">
            <Link href="/" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Kite
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/booth" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                부스
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, href, onClick, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          href={href}
          onClick={onClick}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          {children && (
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {children}
            </p>
          )}
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"