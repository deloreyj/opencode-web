"use client"

import * as React from "react"
import {
  Aperture,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

export interface SidebarItem {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
}

export interface TwoColumnLayoutProps {
  children?: React.ReactNode
  sidebarItems: SidebarItem[]
}

function SidebarHeaderContent() {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"
  const [isFullyCollapsed, setIsFullyCollapsed] = React.useState(isCollapsed)
  const headerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (isCollapsed) {
      // Wait for the sidebar transition to complete
      const sidebar = headerRef.current?.closest('[data-sidebar="sidebar"]')
      if (sidebar) {
        const handleTransitionEnd = () => {
          setIsFullyCollapsed(true)
        }
        sidebar.addEventListener('transitionend', handleTransitionEnd)
        return () => sidebar.removeEventListener('transitionend', handleTransitionEnd)
      } else {
        // Fallback if we can't find the sidebar element
        setIsFullyCollapsed(true)
      }
    } else {
      setIsFullyCollapsed(false)
    }
  }, [isCollapsed])

  return (
    <SidebarHeader
      ref={headerRef}
      className={`flex flex-row items-center justify-between p-2 ${isFullyCollapsed ? "hover:[&>div>button:first-child]:invisible hover:[&>div>button:last-child]:visible" : ""}`}
    >
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="visible transition-none size-8"
          onClick={() => {}}
        >
          <Aperture className="h-5 w-5" />
        </Button>
        {isCollapsed && (
          <SidebarTrigger className="absolute inset-0 size-8 invisible transition-none" />
        )}
      </div>
      {!isCollapsed && <SidebarTrigger className="transition-none size-8" />}
    </SidebarHeader>
  )
}

export function TwoColumnLayout({ children, sidebarItems }: TwoColumnLayoutProps) {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeaderContent />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Application</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {sidebarItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <main className="flex-1 p-4">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
