"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { de } from "date-fns/locale"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Conversation {
  id: string
  job_id: string | null
  customer_id: string
  handwerker_id: string
  last_message_at: string
  status: string
  jobs: {
    title: string
  } | null
  customer_profile: {
    first_name: string
    last_name: string
    company_name: string | null
  }
  handwerker_profile: {
    first_name: string
    last_name: string
    company_name: string | null
  }
  last_message: {
    content: string
    sender_id: string
    created_at: string
  } | null
  unread_count: number
}

interface ConversationListProps {
  userId: string
  selectedConversationId?: string
}

export function ConversationList({ userId, selectedConversationId }: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchConversations()
  }, [userId])

  const fetchConversations = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("conversations")
        .select(
          `
          id,
          job_id,
          customer_id,
          handwerker_id,
          last_message_at,
          status,
          jobs:job_id (
            title
          ),
          customer_profile:customer_id (
            first_name,
            last_name,
            company_name
          ),
          handwerker_profile:handwerker_id (
            first_name,
            last_name,
            company_name
          )
        `,
        )
        .or(`customer_id.eq.${userId},handwerker_id.eq.${userId}`)
        .eq("status", "active")
        .order("last_message_at", { ascending: false })

      if (error) throw error

      // Get last message and unread count for each conversation
      const conversationsWithDetails = await Promise.all(
        (data || []).map(async (conv) => {
          // Get last message
          const { data: lastMessage } = await supabase
            .from("conversation_messages")
            .select("content, sender_id, created_at")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single()

          // Get unread count
          const { count: unreadCount } = await supabase
            .from("conversation_messages")
            .select("id", { count: "exact" })
            .eq("conversation_id", conv.id)
            .neq("sender_id", userId)
            .not(
              "id",
              "in",
              `(${await supabase
                .from("message_read_status")
                .select("message_id")
                .eq("user_id", userId)
                .then((res) => res.data?.map((r) => r.message_id).join(",") || "")})`,
            )

          return {
            ...conv,
            last_message: lastMessage,
            unread_count: unreadCount || 0,
          }
        }),
      )

      setConversations(conversationsWithDetails)
    } catch (error) {
      console.error("Error fetching conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  const getOtherParticipant = (conversation: Conversation) => {
    if (conversation.customer_id === userId) {
      return conversation.handwerker_profile
    }
    return conversation.customer_profile
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const truncateMessage = (content: string, maxLength = 50) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + "..."
  }

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="p-3 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="overflow-y-auto">
      {conversations.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          <p>Keine Unterhaltungen vorhanden</p>
          <p className="text-sm mt-1">Bewerben Sie sich auf Aufträge, um Nachrichten zu erhalten</p>
        </div>
      ) : (
        <div className="p-2 space-y-1">
          {conversations.map((conversation) => {
            const otherParticipant = getOtherParticipant(conversation)
            const isSelected = conversation.id === selectedConversationId

            return (
              <Link key={conversation.id} href={`/messages?conversation=${conversation.id}`}>
                <Card
                  className={`p-3 cursor-pointer transition-colors hover:bg-accent/50 ${isSelected ? "bg-accent" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="text-sm">
                        {getInitials(otherParticipant.first_name, otherParticipant.last_name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-sm truncate">
                          {otherParticipant.company_name ||
                            `${otherParticipant.first_name} ${otherParticipant.last_name}`}
                        </h3>
                        {conversation.unread_count > 0 && (
                          <Badge variant="destructive" className="text-xs px-1.5 py-0.5 min-w-[1.25rem] h-5">
                            {conversation.unread_count}
                          </Badge>
                        )}
                      </div>

                      {conversation.jobs && (
                        <p className="text-xs text-muted-foreground mb-1 truncate">{conversation.jobs.title}</p>
                      )}

                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground truncate flex-1">
                          {conversation.last_message
                            ? truncateMessage(conversation.last_message.content)
                            : "Keine Nachrichten"}
                        </p>
                        <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                          {formatDistanceToNow(new Date(conversation.last_message_at), {
                            addSuffix: true,
                            locale: de,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
