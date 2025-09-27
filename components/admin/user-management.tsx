"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Shield, Ban, CheckCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { de } from "date-fns/locale"

interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  company_name: string | null
  user_type: string
  trade_category: string | null
  location_city: string | null
  phone: string | null
  is_verified: boolean
  created_at: string
  last_sign_in_at: string | null
  admin_role: {
    role: string
    is_active: boolean
  } | null
}

interface UserManagementProps {
  currentUser: any
}

export function UserManagement({ currentUser }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)

  const supabase = createClient()
  const usersPerPage = 10

  useEffect(() => {
    fetchUsers()
  }, [currentPage, searchTerm, filterType])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from("profiles")
        .select(
          `
          id,
          email,
          first_name,
          last_name,
          company_name,
          user_type,
          trade_category,
          location_city,
          phone,
          is_verified,
          created_at,
          last_sign_in_at,
          admin_roles!admin_roles_user_id_fkey (
            role,
            is_active
          )
        `,
          { count: "exact" },
        )
        .order("created_at", { ascending: false })
        .range((currentPage - 1) * usersPerPage, currentPage * usersPerPage - 1)

      // Apply filters
      if (searchTerm) {
        query = query.or(
          `first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,company_name.ilike.%${searchTerm}%`,
        )
      }

      if (filterType !== "all") {
        query = query.eq("user_type", filterType)
      }

      const { data, error, count } = await query

      if (error) throw error

      setUsers(
        (data || []).map((user) => ({
          ...user,
          admin_role: user.admin_roles?.[0] || null,
        })),
      )
      setTotalUsers(count || 0)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleVerification = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from("profiles").update({ is_verified: !currentStatus }).eq("id", userId)

      if (error) throw error

      // Log admin activity
      await supabase.rpc("log_admin_activity", {
        p_admin_id: currentUser.id,
        p_action: currentStatus ? "unverify_user" : "verify_user",
        p_resource_type: "user",
        p_resource_id: userId,
      })

      fetchUsers()
    } catch (error) {
      console.error("Error toggling user verification:", error)
    }
  }

  const handleGrantAdminRole = async (userId: string, role: string) => {
    try {
      const { error } = await supabase.from("admin_roles").upsert(
        {
          user_id: userId,
          role: role,
          granted_by: currentUser.id,
          is_active: true,
        },
        {
          onConflict: "user_id,role",
        },
      )

      if (error) throw error

      // Log admin activity
      await supabase.rpc("log_admin_activity", {
        p_admin_id: currentUser.id,
        p_action: "grant_admin_role",
        p_resource_type: "user",
        p_resource_id: userId,
        p_details: { role },
      })

      fetchUsers()
    } catch (error) {
      console.error("Error granting admin role:", error)
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getUserTypeLabel = (userType: string) => {
    return userType === "handwerker" ? "Handwerker" : "Kunde"
  }

  const getUserTypeBadgeVariant = (userType: string) => {
    return userType === "handwerker" ? "default" : "secondary"
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Benutzerverwaltung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="w-10 h-10 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
                <div className="w-20 h-8 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Benutzerverwaltung</CardTitle>
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Benutzer suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Benutzer</SelectItem>
              <SelectItem value="handwerker">Handwerker</SelectItem>
              <SelectItem value="kunde">Kunden</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <Avatar className="w-10 h-10">
                  <AvatarFallback>{getInitials(user.first_name, user.last_name)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{user.company_name || `${user.first_name} ${user.last_name}`}</h4>
                    <Badge variant={getUserTypeBadgeVariant(user.user_type)}>{getUserTypeLabel(user.user_type)}</Badge>
                    {user.admin_role && (
                      <Badge variant="outline" className="text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        {user.admin_role.role}
                      </Badge>
                    )}
                    {user.is_verified && <CheckCircle className="h-4 w-4 text-green-600" />}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>{user.email}</p>
                    <p>
                      Registriert{" "}
                      {formatDistanceToNow(new Date(user.created_at), {
                        addSuffix: true,
                        locale: de,
                      })}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={user.is_verified ? "outline" : "default"}
                  size="sm"
                  onClick={() => handleToggleVerification(user.id, user.is_verified)}
                >
                  {user.is_verified ? (
                    <>
                      <Ban className="h-4 w-4 mr-1" />
                      Entverifizieren
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Verifizieren
                    </>
                  )}
                </Button>
                {currentUser.adminRole.role === "super_admin" && !user.admin_role && (
                  <Button variant="outline" size="sm" onClick={() => handleGrantAdminRole(user.id, "moderator")}>
                    <Shield className="h-4 w-4 mr-1" />
                    Admin machen
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-muted-foreground">
            Zeige {(currentPage - 1) * usersPerPage + 1} bis {Math.min(currentPage * usersPerPage, totalUsers)} von{" "}
            {totalUsers} Benutzern
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Zurück
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage * usersPerPage >= totalUsers}
            >
              Weiter
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
