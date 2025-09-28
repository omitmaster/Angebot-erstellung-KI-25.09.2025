"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, User, LogOut, Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"

interface UserProfile {
  first_name?: string
  last_name?: string
  email?: string
}

export function Header() {
  const router = useRouter()
  const [userProfile] = useState<UserProfile | null>({
    first_name: "Demo",
    last_name: "User",
    email: "demo@example.com",
  })
  const [loading] = useState(false)

  const handleLogout = async () => {
    router.push("/auth/login")
    router.refresh()
  }

  const displayName =
    userProfile?.first_name && userProfile?.last_name
      ? `${userProfile.first_name} ${userProfile.last_name}`
      : userProfile?.email?.split("@")[0] || "Benutzer"

  const initials =
    userProfile?.first_name && userProfile?.last_name
      ? `${userProfile.first_name[0]}${userProfile.last_name[0]}`.toUpperCase()
      : userProfile?.email?.[0]?.toUpperCase() || "U"

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative hover:bg-accent">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Benachrichtigungen</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/placeholder.svg" alt={displayName} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {loading ? "..." : initials}
                  </AvatarFallback>
                </Avatar>
                <span className="sr-only">Benutzermenü öffnen</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 z-[100]" align="end" forceMount sideOffset={8}>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{loading ? "Lädt..." : displayName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{loading ? "" : userProfile?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profil bearbeiten</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Einstellungen</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Abmelden</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
