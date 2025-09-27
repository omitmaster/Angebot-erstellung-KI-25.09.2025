import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { ConversationList } from "@/components/messages/conversation-list"
import { MessageArea } from "@/components/messages/message-area"

interface PageProps {
  searchParams: { conversation?: string }
}

export default async function MessagesPage({ searchParams }: PageProps) {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type, first_name, last_name")
    .eq("id", user.id)
    .single()

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 md:ml-64">
        <Header />

        <main className="h-[calc(100vh-4rem)] flex">
          {/* Conversation List */}
          <div className="w-80 border-r border-border bg-card">
            <div className="p-4 border-b border-border">
              <h1 className="text-xl font-semibold">Nachrichten</h1>
            </div>
            <ConversationList userId={user.id} selectedConversationId={searchParams.conversation} />
          </div>

          {/* Message Area */}
          <div className="flex-1">
            {searchParams.conversation ? (
              <MessageArea conversationId={searchParams.conversation} userId={user.id} userType={profile?.user_type} />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <div className="text-4xl mb-4">💬</div>
                  <h2 className="text-xl font-medium mb-2">Wählen Sie eine Unterhaltung</h2>
                  <p className="text-sm">Klicken Sie auf eine Unterhaltung links, um zu beginnen</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
