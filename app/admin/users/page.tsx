"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, Search, Filter, Plus, Edit, Trash2, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

interface User {
  id: string
  email: string
  name: string
  role: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface Profile {
  id: string
  first_name: string
  last_name: string
  company_name: string
  phone: string
  address: string
  city: string
  postal_code: string
  user_type: string
  is_verified: boolean
  created_at: string
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const router = useRouter()

  const supabase = createClient()

  useEffect(() => {
    fetchUsers()
    fetchProfiles()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Fehler",
        description: "Benutzer konnten nicht geladen werden.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase.from("profiles").select("*")

      if (error) throw error
      setProfiles(data || [])
    } catch (error) {
      console.error("Error fetching profiles:", error)
    }
  }

  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    try {
      const { error } = await supabase.from("users").update(updates).eq("id", userId)

      if (error) throw error

      await fetchUsers()
      setIsEditDialogOpen(false)
      toast({
        title: "Erfolg",
        description: "Benutzer wurde aktualisiert.",
      })
    } catch (error) {
      console.error("Error updating user:", error)
      toast({
        title: "Fehler",
        description: "Benutzer konnte nicht aktualisiert werden.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Sind Sie sicher, dass Sie diesen Benutzer löschen möchten?")) {
      return
    }

    try {
      const { error } = await supabase.from("users").delete().eq("id", userId)

      if (error) throw error

      await fetchUsers()
      toast({
        title: "Erfolg",
        description: "Benutzer wurde gelöscht.",
      })
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "Fehler",
        description: "Benutzer konnte nicht gelöscht werden.",
        variant: "destructive",
      })
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const getUserProfile = (userId: string) => {
    return profiles.find((profile) => profile.id === userId)
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive"
      case "handwerker":
        return "default"
      case "kunde":
        return "secondary"
      default:
        return "outline"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-6 py-4">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/4"></div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-6 py-8">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-card rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => router.push("/admin")} className="mr-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück
              </Button>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Benutzerverwaltung</h1>
                <p className="text-muted-foreground">{filteredUsers.length} Benutzer gefunden</p>
              </div>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Neuer Benutzer
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Neuen Benutzer erstellen</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-foreground">
                      E-Mail
                    </Label>
                    <Input id="email" type="email" className="bg-background border-border" />
                  </div>
                  <div>
                    <Label htmlFor="name" className="text-foreground">
                      Name
                    </Label>
                    <Input id="name" className="bg-background border-border" />
                  </div>
                  <div>
                    <Label htmlFor="role" className="text-foreground">
                      Rolle
                    </Label>
                    <Select>
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue placeholder="Rolle auswählen" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="kunde">Kunde</SelectItem>
                        <SelectItem value="handwerker">Handwerker</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Abbrechen
                    </Button>
                    <Button>Erstellen</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-6">
        {/* Filters */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Nach Name oder E-Mail suchen..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-background border-border"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-40 bg-background border-border">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="all">Alle Rollen</SelectItem>
                    <SelectItem value="kunde">Kunde</SelectItem>
                    <SelectItem value="handwerker">Handwerker</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Benutzer</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground">Benutzer</TableHead>
                  <TableHead className="text-muted-foreground">Rolle</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Erstellt</TableHead>
                  <TableHead className="text-muted-foreground">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const profile = getUserProfile(user.id)
                  return (
                    <TableRow key={user.id} className="border-border">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium text-foreground">
                              {user.name || profile?.first_name + " " + profile?.last_name || "Unbekannt"}
                            </div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                            {profile?.company_name && (
                              <div className="text-xs text-muted-foreground">{profile.company_name}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role === "admin"
                            ? "Administrator"
                            : user.role === "handwerker"
                              ? "Handwerker"
                              : user.role === "kunde"
                                ? "Kunde"
                                : user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.is_active ? "default" : "secondary"}>
                          {user.is_active ? "Aktiv" : "Inaktiv"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString("de-DE")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog
                            open={isEditDialogOpen && selectedUser?.id === user.id}
                            onOpenChange={(open) => {
                              setIsEditDialogOpen(open)
                              if (open) setSelectedUser(user)
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-card border-border">
                              <DialogHeader>
                                <DialogTitle className="text-foreground">Benutzer bearbeiten</DialogTitle>
                              </DialogHeader>
                              {selectedUser && (
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="edit-name" className="text-foreground">
                                      Name
                                    </Label>
                                    <Input
                                      id="edit-name"
                                      defaultValue={selectedUser.name}
                                      className="bg-background border-border"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-role" className="text-foreground">
                                      Rolle
                                    </Label>
                                    <Select defaultValue={selectedUser.role}>
                                      <SelectTrigger className="bg-background border-border">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent className="bg-card border-border">
                                        <SelectItem value="kunde">Kunde</SelectItem>
                                        <SelectItem value="handwerker">Handwerker</SelectItem>
                                        <SelectItem value="admin">Administrator</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      id="edit-active"
                                      defaultChecked={selectedUser.is_active}
                                      className="rounded border-border"
                                    />
                                    <Label htmlFor="edit-active" className="text-foreground">
                                      Aktiv
                                    </Label>
                                  </div>
                                  <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                      Abbrechen
                                    </Button>
                                    <Button
                                      onClick={() => handleUpdateUser(selectedUser.id, { name: selectedUser.name })}
                                    >
                                      Speichern
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
