"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface StartConversationButtonProps {
  jobId: string
  customerId: string
  handwerkerId?: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
  className?: string
}

export function StartConversationButton({
  jobId,
  customerId,
  handwerkerId,
  variant = "default",
  size = "default",
  className,
}: StartConversationButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    getCurrentUser()
  }, [])

  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      setCurrentUserId(user.id)
    }
  }

  const startConversation = async () => {
    if (!currentUserId) return

    setIsLoading(true)
    try {
      const actualHandwerkerId = handwerkerId || currentUserId

      // Use the get_or_create_conversation function
      const { data, error } = await supabase.rpc("get_or_create_conversation", {
        p_job_id: jobId,
        p_customer_id: customerId,
        p_handwerker_id: actualHandwerkerId,
      })

      if (error) throw error

      // Redirect to messages with the conversation
      router.push(`/messages?conversation=${data}`)
    } catch (error) {
      console.error("Error starting conversation:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={startConversation}
      disabled={isLoading || !currentUserId}
      variant={variant}
      size={size}
      className={className}
    >
      <MessageCircle className="h-4 w-4 mr-2" />
      {isLoading ? "Wird geöffnet..." : "Nachricht senden"}
    </Button>
  )
}
