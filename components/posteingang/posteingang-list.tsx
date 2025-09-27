"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mail, MessageSquare, Phone, Building, User, Clock, Eye, UserCheck } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { de } from "date-fns/locale"

interface Customer {
  id: string
  name: string
  person?: string
  phone?: string
  email?: string
  address?: string
}

interface Intake {
  id: string
  status: string
  branch: string
  transcript?: string
  email_raw?: string
  channel: string
  created_at: string
  customer?: Customer
}

interface PosteingangListProps {
  intakes: Intake[]
}

export function PosteingangList({ intakes }: PosteingangListProps) {
  const getPriorityBadge = (status: string, branch: string) => {
    if (status === "urgent" || branch === "Notfall") {
      return <Badge variant="destructive">Hoch</Badge>
    }
    if (status === "new") {
      return <Badge variant="secondary">Neu</Badge>
    }
    return <Badge variant="outline">Mittel</Badge>
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "email":
        return <Mail className="h-4 w-4 text-blue-500" />
      case "whatsapp":
      case "sms":
        return <MessageSquare className="h-4 w-4 text-green-500" />
      case "phone":
        return <Phone className="h-4 w-4 text-orange-500" />
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-50 border-blue-200"
      case "urgent":
        return "bg-red-50 border-red-200"
      case "in_progress":
        return "bg-yellow-50 border-yellow-200"
      case "completed":
        return "bg-green-50 border-green-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  if (!intakes || intakes.length === 0) {
    return (
      <div className="text-center py-12">
        <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Keine Nachrichten vorhanden</h3>
        <p className="text-muted-foreground">Neue Anfragen werden hier angezeigt, sobald sie eingehen.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {intakes.map((intake) => (
        <Card key={intake.id} className={`p-6 hover:shadow-md transition-shadow ${getStatusColor(intake.status)}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 flex-1">
              <div className="flex-shrink-0">{getChannelIcon(intake.channel)}</div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-foreground truncate">
                    Anfrage {intake.branch || "Allgemein"}
                  </h3>
                  {getPriorityBadge(intake.status, intake.branch)}
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  {intake.customer?.person && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{intake.customer.person}</span>
                    </div>
                  )}
                  {intake.customer?.name && (
                    <div className="flex items-center gap-1">
                      <Building className="h-3 w-3" />
                      <span>{intake.customer.name}</span>
                    </div>
                  )}
                  {intake.customer?.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      <span>{intake.customer.phone}</span>
                    </div>
                  )}
                </div>

                <p className="text-sm text-foreground line-clamp-2 mb-3">
                  {intake.transcript || intake.email_raw || "Keine Nachrichtenvorschau verfügbar"}
                </p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      vor{" "}
                      {formatDistanceToNow(new Date(intake.created_at), {
                        locale: de,
                        addSuffix: false,
                      })}
                    </span>
                  </div>

                  {intake.status === "new" && (
                    <Badge variant="secondary" className="text-xs">
                      Neu
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              <Button variant="outline" size="sm" className="text-xs bg-transparent">
                <UserCheck className="h-3 w-3 mr-1" />
                Zum Agent
              </Button>
              <Button variant="ghost" size="sm" className="text-xs">
                <Eye className="h-3 w-3 mr-1" />
                Öffnen
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
