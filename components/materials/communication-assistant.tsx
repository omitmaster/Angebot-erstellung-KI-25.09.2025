"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  MessageSquare,
  Send,
  Phone,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Package,
  Building2,
  Mail,
} from "lucide-react"
import { CommunicationService, type CommunicationMessage, type Contact } from "@/lib/communication-service"

interface CommunicationAssistantProps {
  trigger?: React.ReactNode
}

export function CommunicationAssistant({ trigger }: CommunicationAssistantProps) {
  const [messages, setMessages] = useState<CommunicationMessage[]>(CommunicationService.getMessageHistory())
  const [contacts, setContacts] = useState<Contact[]>(CommunicationService.getContacts())
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [messageSubject, setMessageSubject] = useState("")
  const [activeTab, setActiveTab] = useState<"messages" | "contacts">("messages")

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <Send className="h-3 w-3" />
      case "delivered":
        return <CheckCircle className="h-3 w-3" />
      case "read":
        return <CheckCircle className="h-3 w-3 text-blue-500" />
      case "failed":
        return <AlertCircle className="h-3 w-3 text-red-500" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "text-blue-600"
      case "delivered":
        return "text-green-600"
      case "read":
        return "text-blue-600"
      case "failed":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "email":
        return <Mail className="h-3 w-3" />
      case "whatsapp":
        return <MessageSquare className="h-3 w-3" />
      case "phone":
        return <Phone className="h-3 w-3" />
      default:
        return <MessageSquare className="h-3 w-3" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "material_order":
        return <Package className="h-4 w-4" />
      case "project_update":
        return <Building2 className="h-4 w-4" />
      case "follow_up":
        return <Phone className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "material_order":
        return "Materialbestellung"
      case "project_update":
        return "Projekt-Update"
      case "follow_up":
        return "Follow-up"
      default:
        return "Nachricht"
    }
  }

  const getContactIcon = (type: string) => {
    switch (type) {
      case "supplier":
        return <Package className="h-4 w-4" />
      case "customer":
        return <User className="h-4 w-4" />
      case "subcontractor":
        return <Building2 className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const handleSendMessage = async () => {
    if (!selectedContact || !newMessage.trim()) return

    console.log("[v0] Sending message to:", selectedContact.name)

    const message: CommunicationMessage = {
      id: Date.now().toString(),
      to:
        selectedContact.preferredChannel === "email"
          ? selectedContact.email || selectedContact.phone
          : selectedContact.phone,
      message: newMessage,
      timestamp: new Date().toISOString(),
      status: "pending",
      type: "general",
      channel: selectedContact.preferredChannel,
    }

    setMessages([message, ...messages])
    setNewMessage("")
    setMessageSubject("")

    // Simulate sending
    setTimeout(() => {
      setMessages((prev) => prev.map((msg) => (msg.id === message.id ? { ...msg, status: "sent" } : msg)))
    }, 1000)

    // Open communication channel
    CommunicationService.openCommunicationChannel(selectedContact, newMessage, messageSubject)
  }

  const handleOpenCommunication = (contact: Contact, message?: string, subject?: string) => {
    const defaultMessage = message || `Hallo ${contact.name},\n\n`
    CommunicationService.openCommunicationChannel(contact, defaultMessage, subject)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <MessageSquare className="h-4 w-4 mr-2" />
            Kommunikation
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Kommunikations-Assistent
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-4">
          {/* Sidebar */}
          <div className="w-48 space-y-2">
            <Button
              variant={activeTab === "messages" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("messages")}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Nachrichten
            </Button>
            <Button
              variant={activeTab === "contacts" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("contacts")}
            >
              <User className="h-4 w-4 mr-2" />
              Kontakte
            </Button>
          </div>

          <Separator orientation="vertical" className="h-96" />

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === "messages" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Nachrichtenverlauf</h3>
                  <Badge variant="secondary">{messages.length} Nachrichten</Badge>
                </div>

                <ScrollArea className="h-80">
                  <div className="space-y-3">
                    {messages.map((message) => (
                      <Card key={message.id}>
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="flex items-center gap-1">
                                {getTypeIcon(message.type)}
                                {getTypeLabel(message.type)}
                              </Badge>
                              <Badge variant="outline" className="flex items-center gap-1">
                                {getChannelIcon(message.channel)}
                                {message.channel}
                              </Badge>
                              <Badge
                                variant="secondary"
                                className={`flex items-center gap-1 ${getStatusColor(message.status)}`}
                              >
                                {getStatusIcon(message.status)}
                                {message.status}
                              </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(message.timestamp).toLocaleString("de-DE")}
                            </span>
                          </div>
                          <div className="text-sm">
                            <div className="font-medium mb-1">An: {message.to}</div>
                            <div className="bg-muted/50 p-2 rounded text-xs whitespace-pre-wrap">{message.message}</div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {activeTab === "contacts" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Contacts List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Kontakte</h3>
                    <Badge variant="secondary">{contacts.length} Kontakte</Badge>
                  </div>

                  <ScrollArea className="h-80">
                    <div className="space-y-2">
                      {contacts.map((contact) => (
                        <Card
                          key={contact.id}
                          className={`cursor-pointer transition-colors ${
                            selectedContact?.id === contact.id ? "border-accent bg-accent/5" : "hover:bg-muted/50"
                          }`}
                          onClick={() => setSelectedContact(contact)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {getContactIcon(contact.type)}
                                <div>
                                  <div className="font-medium text-sm">{contact.name}</div>
                                  <div className="text-xs text-muted-foreground">{contact.phone}</div>
                                  {contact.email && (
                                    <div className="text-xs text-muted-foreground">{contact.email}</div>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col gap-1">
                                <Badge variant="outline">
                                  {contact.type === "supplier"
                                    ? "Lieferant"
                                    : contact.type === "customer"
                                      ? "Kunde"
                                      : "Subunternehmer"}
                                </Badge>
                                <Badge variant="secondary" className="flex items-center gap-1">
                                  {getChannelIcon(contact.preferredChannel)}
                                  {contact.preferredChannel}
                                </Badge>
                              </div>
                            </div>
                            {contact.lastContact && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Letzter Kontakt: {contact.lastContact}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Message Composer */}
                <div className="space-y-4">
                  {selectedContact ? (
                    <>
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Nachricht senden</h3>
                        <Button size="sm" variant="outline" onClick={() => handleOpenCommunication(selectedContact)}>
                          {getChannelIcon(selectedContact.preferredChannel)}
                          <span className="ml-1">Öffnen</span>
                        </Button>
                      </div>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            {getContactIcon(selectedContact.type)}
                            {selectedContact.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-sm font-medium mb-1 block">Telefon</label>
                              <p className="text-sm">{selectedContact.phone}</p>
                            </div>
                            {selectedContact.email && (
                              <div>
                                <label className="text-sm font-medium mb-1 block">E-Mail</label>
                                <p className="text-sm">{selectedContact.email}</p>
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="text-sm font-medium mb-1 block">Bevorzugter Kanal</label>
                            <Badge className="flex items-center gap-1 w-fit">
                              {getChannelIcon(selectedContact.preferredChannel)}
                              {selectedContact.preferredChannel}
                            </Badge>
                          </div>

                          {selectedContact.preferredChannel === "email" && (
                            <div>
                              <label className="text-sm font-medium mb-1 block">Betreff</label>
                              <input
                                type="text"
                                value={messageSubject}
                                onChange={(e) => setMessageSubject(e.target.value)}
                                placeholder="Betreff eingeben..."
                                className="w-full px-3 py-2 border border-input rounded-md text-sm"
                              />
                            </div>
                          )}

                          <div>
                            <label className="text-sm font-medium mb-1 block">Nachricht</label>
                            <Textarea
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              placeholder="Nachricht eingeben..."
                              rows={6}
                            />
                          </div>

                          <Button onClick={handleSendMessage} disabled={!newMessage.trim()} className="w-full">
                            <Send className="h-4 w-4 mr-2" />
                            Senden
                          </Button>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Schnellnachrichten</label>
                            <div className="grid grid-cols-1 gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setNewMessage(
                                    `Hallo ${selectedContact.name},\n\nkönnen Sie mir bitte den aktuellen Status unserer Bestellung mitteilen?\n\nVielen Dank!`,
                                  )
                                }
                              >
                                Bestellstatus abfragen
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setNewMessage(
                                    `Hallo ${selectedContact.name},\n\nwann können Sie die bestellten Materialien liefern?\n\nBitte um kurze Rückmeldung.`,
                                  )
                                }
                              >
                                Liefertermin erfragen
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setNewMessage(
                                    `Hallo ${selectedContact.name},\n\nvielen Dank für die schnelle Lieferung!\n\nMit freundlichen Grüßen`,
                                  )
                                }
                              >
                                Dankesnachricht
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  ) : (
                    <Card>
                      <CardContent className="flex items-center justify-center h-64">
                        <div className="text-center">
                          <User className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                          <p className="text-muted-foreground">Wählen Sie einen Kontakt aus</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
