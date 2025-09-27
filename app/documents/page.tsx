"use client"

import type React from "react"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  FolderOpen,
  FileText,
  Image,
  Download,
  Upload,
  Search,
  Plus,
  Trash2,
  Edit,
  Share,
  Eye,
  Tag,
} from "lucide-react"

interface DocumentFile {
  id: string
  name: string
  type: "pdf" | "image" | "document" | "spreadsheet" | "other"
  size: number
  uploadDate: string
  lastModified: string
  category: string
  tags: string[]
  projectId?: string
  projectName?: string
  uploadedBy: string
  isShared: boolean
  url: string
  description?: string
}

interface DocumentFolder {
  id: string
  name: string
  parentId?: string
  createdDate: string
  fileCount: number
  description?: string
}

const mockFolders: DocumentFolder[] = [
  {
    id: "1",
    name: "Projekte",
    createdDate: "2024-01-01",
    fileCount: 45,
    description: "Alle projektbezogenen Dokumente",
  },
  {
    id: "2",
    name: "Angebote",
    parentId: "1",
    createdDate: "2024-01-01",
    fileCount: 23,
    description: "Angebotsdokumente und PDFs",
  },
  {
    id: "3",
    name: "Verträge",
    parentId: "1",
    createdDate: "2024-01-01",
    fileCount: 12,
    description: "Unterschriebene Verträge",
  },
  {
    id: "4",
    name: "Fotos",
    createdDate: "2024-01-01",
    fileCount: 156,
    description: "Projektfotos und Dokumentation",
  },
  {
    id: "5",
    name: "Vorher/Nachher",
    parentId: "4",
    createdDate: "2024-01-01",
    fileCount: 89,
    description: "Vorher/Nachher Aufnahmen",
  },
  {
    id: "6",
    name: "Materialien",
    createdDate: "2024-01-01",
    fileCount: 34,
    description: "Materialdatenblätter und Zertifikate",
  },
]

const mockFiles: DocumentFile[] = [
  {
    id: "1",
    name: "Angebot_Müller_WDVS_2024-001.pdf",
    type: "pdf",
    size: 2456789,
    uploadDate: "2024-01-15",
    lastModified: "2024-01-15",
    category: "Angebote",
    tags: ["WDVS", "Müller", "2024"],
    projectId: "proj-001",
    projectName: "WDVS Sanierung Müller",
    uploadedBy: "Max Mustermann",
    isShared: true,
    url: "/documents/angebot-mueller-001.pdf",
    description: "Detailliertes Angebot für WDVS-Sanierung",
  },
  {
    id: "2",
    name: "Vertrag_Schmidt_Fassade_VTG-2024-002.pdf",
    type: "pdf",
    size: 1234567,
    uploadDate: "2024-01-20",
    lastModified: "2024-01-22",
    category: "Verträge",
    tags: ["Vertrag", "Schmidt", "Fassade"],
    projectId: "proj-002",
    projectName: "Fassadensanierung Schmidt",
    uploadedBy: "Anna Schmidt",
    isShared: false,
    url: "/documents/vertrag-schmidt-002.pdf",
    description: "Unterschriebener Werkvertrag",
  },
  {
    id: "3",
    name: "Baustelle_Vorher_20240115.jpg",
    type: "image",
    size: 3456789,
    uploadDate: "2024-01-15",
    lastModified: "2024-01-15",
    category: "Fotos",
    tags: ["Vorher", "Baustelle", "Dokumentation"],
    projectId: "proj-001",
    projectName: "WDVS Sanierung Müller",
    uploadedBy: "Tom Weber",
    isShared: true,
    url: "/images/baustelle-vorher-001.jpg",
    description: "Zustand vor Sanierungsbeginn",
  },
  {
    id: "4",
    name: "EPS_Daemmplatten_Datenblatt.pdf",
    type: "pdf",
    size: 987654,
    uploadDate: "2024-01-10",
    lastModified: "2024-01-10",
    category: "Materialien",
    tags: ["EPS", "Dämmung", "Datenblatt"],
    uploadedBy: "Max Mustermann",
    isShared: true,
    url: "/documents/eps-datenblatt.pdf",
    description: "Technisches Datenblatt EPS-Dämmplatten",
  },
  {
    id: "5",
    name: "Materialbestellung_MAT-2024-001.xlsx",
    type: "spreadsheet",
    size: 456789,
    uploadDate: "2024-01-22",
    lastModified: "2024-01-22",
    category: "Materialien",
    tags: ["Bestellung", "Material", "Excel"],
    uploadedBy: "Anna Schmidt",
    isShared: false,
    url: "/documents/materialbestellung-001.xlsx",
    description: "Materialbestellung für Januar 2024",
  },
]

export default function DocumentsPage() {
  const [files, setFiles] = useState<DocumentFile[]>(mockFiles)
  const [folders, setFolders] = useState<DocumentFolder[]>(mockFolders)
  const [selectedFile, setSelectedFile] = useState<DocumentFile | null>(null)
  const [currentFolder, setCurrentFolder] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterType, setFilterType] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-8 w-8 text-red-500" />
      case "image":
        return <Image className="h-8 w-8 text-blue-500" />
      case "document":
        return <FileText className="h-8 w-8 text-blue-600" />
      case "spreadsheet":
        return <FileText className="h-8 w-8 text-green-600" />
      default:
        return <FileText className="h-8 w-8 text-gray-500" />
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "pdf":
        return "PDF"
      case "image":
        return "Bild"
      case "document":
        return "Dokument"
      case "spreadsheet":
        return "Tabelle"
      default:
        return "Datei"
    }
  }

  const filteredFiles = files.filter((file) => {
    const categoryMatch = filterCategory === "all" || file.category === filterCategory
    const typeMatch = filterType === "all" || file.type === filterType
    const searchMatch =
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (file.description && file.description.toLowerCase().includes(searchTerm.toLowerCase()))
    return categoryMatch && typeMatch && searchMatch
  })

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files
    if (!uploadedFiles) return

    console.log("[v0] Uploading files:", uploadedFiles.length)

    Array.from(uploadedFiles).forEach((file) => {
      const newFile: DocumentFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type.includes("image") ? "image" : file.type.includes("pdf") ? "pdf" : "document",
        size: file.size,
        uploadDate: new Date().toISOString().split("T")[0],
        lastModified: new Date().toISOString().split("T")[0],
        category: "Sonstige",
        tags: [],
        uploadedBy: "Aktueller Benutzer",
        isShared: false,
        url: URL.createObjectURL(file),
        description: "",
      }

      setFiles((prev) => [newFile, ...prev])
    })
  }

  const handleDeleteFile = (fileId: string) => {
    setFiles(files.filter((f) => f.id !== fileId))
    if (selectedFile?.id === fileId) {
      setSelectedFile(null)
    }
  }

  const handleShareToggle = (fileId: string) => {
    setFiles(files.map((f) => (f.id === fileId ? { ...f, isShared: !f.isShared } : f)))
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 md:ml-64">
        <Header />

        <main className="p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Dokumentenverwaltung</h1>
                <p className="text-muted-foreground">Dateien organisieren und verwalten</p>
              </div>
              <div className="flex gap-2">
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                />
                <Button variant="outline" asChild>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Hochladen
                  </label>
                </Button>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Ordner erstellen
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Panel - Folders */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FolderOpen className="h-5 w-5" />
                    Ordner
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-1">
                      {folders
                        .filter((folder) => !folder.parentId)
                        .map((folder) => (
                          <div key={folder.id}>
                            <div
                              className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted/50 ${
                                currentFolder === folder.id ? "bg-accent text-accent-foreground" : ""
                              }`}
                              onClick={() => setCurrentFolder(folder.id)}
                            >
                              <FolderOpen className="h-4 w-4" />
                              <span className="text-sm font-medium">{folder.name}</span>
                              <Badge variant="secondary" className="ml-auto text-xs">
                                {folder.fileCount}
                              </Badge>
                            </div>
                            {/* Subfolders */}
                            {folders
                              .filter((subfolder) => subfolder.parentId === folder.id)
                              .map((subfolder) => (
                                <div
                                  key={subfolder.id}
                                  className={`flex items-center gap-2 p-2 pl-6 rounded cursor-pointer hover:bg-muted/50 ${
                                    currentFolder === subfolder.id ? "bg-accent text-accent-foreground" : ""
                                  }`}
                                  onClick={() => setCurrentFolder(subfolder.id)}
                                >
                                  <FolderOpen className="h-3 w-3" />
                                  <span className="text-xs">{subfolder.name}</span>
                                  <Badge variant="secondary" className="ml-auto text-xs">
                                    {subfolder.fileCount}
                                  </Badge>
                                </div>
                              ))}
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Speicher</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Verwendet:</span>
                      <span>2.4 GB</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-accent h-2 rounded-full" style={{ width: "48%" }} />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>2.4 GB von 5 GB</span>
                      <span>52% frei</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Panel - Files */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Dateien ({filteredFiles.length})</span>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Suchen..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-8 w-40"
                        />
                      </div>
                      <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Kategorie" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Alle</SelectItem>
                          <SelectItem value="Angebote">Angebote</SelectItem>
                          <SelectItem value="Verträge">Verträge</SelectItem>
                          <SelectItem value="Fotos">Fotos</SelectItem>
                          <SelectItem value="Materialien">Materialien</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-24">
                          <SelectValue placeholder="Typ" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Alle</SelectItem>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="image">Bilder</SelectItem>
                          <SelectItem value="document">Dokumente</SelectItem>
                          <SelectItem value="spreadsheet">Tabellen</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-2">
                      {filteredFiles.map((file) => (
                        <div
                          key={file.id}
                          className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedFile?.id === file.id ? "border-accent bg-accent/5" : "hover:bg-muted/50"
                          }`}
                          onClick={() => setSelectedFile(file)}
                        >
                          <div className="flex-shrink-0">{getFileIcon(file.type)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm truncate">{file.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {getTypeLabel(file.type)}
                              </Badge>
                              {file.isShared && (
                                <Badge variant="secondary" className="text-xs">
                                  <Share className="h-3 w-3 mr-1" />
                                  Geteilt
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{formatFileSize(file.size)}</span>
                              <span>{file.uploadDate}</span>
                              <span>{file.uploadedBy}</span>
                            </div>
                            {file.tags.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {file.tags.slice(0, 3).map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {file.tags.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{file.tags.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={(e) => e.stopPropagation()}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={(e) => e.stopPropagation()}>
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Right Panel - File Details */}
            <div className="lg:col-span-1 space-y-6">
              {selectedFile ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Dateidetails
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-center mb-4">{getFileIcon(selectedFile.type)}</div>

                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Name</label>
                        <p className="text-sm font-medium break-words">{selectedFile.name}</p>
                      </div>

                      {selectedFile.description && (
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Beschreibung</label>
                          <p className="text-sm">{selectedFile.description}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Typ</label>
                          <p className="text-sm">{getTypeLabel(selectedFile.type)}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Größe</label>
                          <p className="text-sm">{formatFileSize(selectedFile.size)}</p>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Kategorie</label>
                        <p className="text-sm">{selectedFile.category}</p>
                      </div>

                      {selectedFile.projectName && (
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Projekt</label>
                          <p className="text-sm">{selectedFile.projectName}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Hochgeladen</label>
                          <p className="text-sm">{selectedFile.uploadDate}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Geändert</label>
                          <p className="text-sm">{selectedFile.lastModified}</p>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Hochgeladen von</label>
                        <p className="text-sm">{selectedFile.uploadedBy}</p>
                      </div>

                      {selectedFile.tags.length > 0 && (
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-2 block">Tags</label>
                          <div className="flex flex-wrap gap-1">
                            {selectedFile.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <Separator />

                      <div className="space-y-2">
                        <Button size="sm" className="w-full">
                          <Download className="h-4 w-4 mr-2" />
                          Herunterladen
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full bg-transparent"
                          onClick={() => handleShareToggle(selectedFile.id)}
                        >
                          <Share className="h-4 w-4 mr-2" />
                          {selectedFile.isShared ? "Freigabe entfernen" : "Teilen"}
                        </Button>
                        <Button size="sm" variant="outline" className="w-full bg-transparent">
                          <Edit className="h-4 w-4 mr-2" />
                          Bearbeiten
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="w-full"
                          onClick={() => handleDeleteFile(selectedFile.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Löschen
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Wählen Sie eine Datei aus der Liste</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
