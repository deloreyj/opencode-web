import { Moon, Sun, Monitor } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  const cycleTheme = () => {
    const themeOrder: Array<"light" | "dark" | "system"> = ["light", "dark", "system"]
    const currentIndex = themeOrder.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themeOrder.length
    setTheme(themeOrder[nextIndex])
  }

  const getIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="size-5 transition-transform" />
      case "dark":
        return <Moon className="size-5 transition-transform" />
      case "system":
        return <Monitor className="size-5 transition-transform" />
    }
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="h-9 w-9 shrink-0 sm:h-10 sm:w-10"
      onClick={cycleTheme}
    >
      {getIcon()}
      <span className="sr-only">Toggle theme (current: {theme})</span>
    </Button>
  )
}
