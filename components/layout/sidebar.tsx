"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Inbox,
  FileText,
  Calculator,
  Send,
  FileSignature,
  Package,
  FolderOpen,
  Settings,
  Menu,
  X,
  Building2,
  Database,
  MessageCircle,
  Briefcase,
  Sparkles,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Inbox },
  { name: "Aufträge", href: "/jobs", icon: Briefcase },
  { name: "Nachrichten", href: "/messages", icon: MessageCircle },
  { name: "LV-Analyse", href: "/lv-analysis", icon: FileText },
  { name: "KI-Angebots-Generator", href: "/ai-angebots-generator", icon: Sparkles },
  { name: "Angebots-Builder", href: "/offer-builder", icon: Calculator },
  { name: "Preisdatenbank", href: "/price-database", icon: Database },
  { name: "Versand & Follow-up", href: "/follow-up", icon: Send },
  { name: "Verträge", href: "/contracts", icon: FileSignature },
  { name: "Material", href: "/materials", icon: Package },
  { name: "Dokumente", href: "/documents", icon: FolderOpen },
  { name: "Einstellungen", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-2 px-6 border-b border-sidebar-border">
            <Building2 className="h-8 w-8 text-accent" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-sidebar-foreground">Angebots- &</span>
              <span className="text-sm font-semibold text-sidebar-foreground">Prozessmeister</span>
            </div>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </ScrollArea>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}
