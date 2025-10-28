import { Hammer, Lightbulb } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAgents } from "@/hooks/use-opencode"
import { useMemo } from "react"

export type AgentModeToggleProps = {
  selectedAgent?: string
  onAgentChange: (agent: string) => void
  className?: string
}

export function AgentModeToggle({ selectedAgent, onAgentChange, className }: AgentModeToggleProps) {
  const { data: agentsData } = useAgents()

  // Filter to only primary agents (those that can be used directly)
  const primaryAgents = useMemo(() => {
    if (!agentsData) return []
    return agentsData.filter((agent) => agent.mode === "primary" || agent.mode === "all")
  }, [agentsData])

  const cycleAgent = () => {
    if (primaryAgents.length === 0) return

    const currentIndex = selectedAgent 
      ? primaryAgents.findIndex((a) => a.name === selectedAgent)
      : -1
    
    const nextIndex = (currentIndex + 1) % primaryAgents.length
    onAgentChange(primaryAgents[nextIndex].name)
  }

  const getIcon = () => {
    const currentAgent = primaryAgents.find((a) => a.name === selectedAgent)
    
    // Use icon based on agent name or description
    if (currentAgent?.name.toLowerCase().includes("build")) {
      return <Hammer className="size-5 transition-transform" />
    }
    if (currentAgent?.name.toLowerCase().includes("plan")) {
      return <Lightbulb className="size-5 transition-transform" />
    }
    
    // Default icon
    return <Hammer className="size-5 transition-transform" />
  }

  const getCurrentAgentLabel = () => {
    const currentAgent = primaryAgents.find((a) => a.name === selectedAgent)
    return currentAgent?.name || "Agent"
  }

  if (primaryAgents.length === 0) {
    return null
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className={className}
      onClick={cycleAgent}
    >
      {getIcon()}
      <span className="sr-only">Toggle agent mode (current: {getCurrentAgentLabel()})</span>
    </Button>
  )
}
