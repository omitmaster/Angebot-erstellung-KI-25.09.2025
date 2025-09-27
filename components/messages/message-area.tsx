"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Send, ArrowLeft } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { de } from "date-fns/locale"
import Link from "next/link"

interface Message {
  id: string
  content: string
  sender_id: string
  created_at: string
  message_type: string
  sender_profile: {
    first_name: string
    last_name: string
    company_name: string | null
  }
}

interface ConversationDetails {
  id: string
  job_id: string | null
  customer_id: string
  handwerker_id: string
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
}

interface MessageAreaProps {
  conversationId: string
  userId: string
  userType?: string
}

export function MessageArea({ conversationId, userId, userType }: MessageAreaProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [conversation, setConversation] = useState<ConversationDetails | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    if (conversationId) {
      fetchConversation()
      fetchMessages()
      markMessagesAsRead()
    }
  }, [conversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchConversation = async () => {
    try {
      const { data, error } = await supabase
        .from("conversations")
        .select(
          `
          id,
          job_id,
          customer_id,
          handwerker_id,
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
        .eq("id", conversationId)
        .single()

      if (error) throw error
      setConversation(data)
    } catch (error) {
      console.error("Error fetching conversation:", error)
    }
  }

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("conversation_messages")
        .select(
          `
          id,
          content,
          sender_id,
          created_at,
          message_type,
          sender_profile:sender_id (
            first_name,
            last_name,
            company_name
          )
        `,
        )
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const markMessagesAsRead = async () => {
    try {
      await supabase.rpc("mark_messages_as_read", {
        p_conversation_id: conversationId,
        p_user_id: userId,
      })
    } catch (error) {
      console.error("Error marking messages as read:", error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      const { error } = await supabase.from("conversation_messages").insert([
        {
          conversation_id: conversationId,
          sender_id: userId,
          content: newMessage.trim(),
          message_type: "text",
        },
      ])

      if (error) throw error

      setNewMessage("")
      fetchMessages() // Refresh messages
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getOtherParticipant = () => {
    if (!conversation) return null
    if (conversation.customer_id === userId) {
      return conversation.handwerker_profile
    }
    return conversation.customer_profile
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const otherParticipant = getOtherParticipant()

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!conversation || !otherParticipant) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <p>Unterhaltung nicht gefunden</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <Link href="/messages" className="md:hidden">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Avatar className="w-10 h-10">
            <AvatarFallback>{getInitials(otherParticipant.first_name, otherParticipant.last_name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="font-semibold">
              {otherParticipant.company_name || `${otherParticipant.first_name} ${otherParticipant.last_name}`}
            </h2>
            {conversation.jobs && <p className="text-sm text-muted-foreground">{conversation.jobs.title}</p>}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>Noch keine Nachrichten</p>
            <p className="text-sm mt-1">Schreiben Sie die erste Nachricht!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.sender_id === userId
            return (
              <div key={message.id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] ${isOwnMessage ? "order-2" : "order-1"}`}>
                  <Card
                    className={`p-3 ${
                      isOwnMessage ? "bg-primary text-primary-foreground ml-auto" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwnMessage ? "text-primary-foreground/70" : "text-muted-foreground/70"
                      }`}
                    >
                      {formatDistanceToNow(new Date(message.created_at), {
                        addSuffix: true,
                        locale: de,
                      })}
                    </p>
                  </Card>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nachricht schreiben..."
            className="flex-1"
            disabled={sending}
          />
          <Button onClick={sendMessage} disabled={sending || !newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
