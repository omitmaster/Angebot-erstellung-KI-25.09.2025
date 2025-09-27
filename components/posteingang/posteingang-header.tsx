"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function PosteingangHeader() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("Alle Status")

  return (
    <div className="mb-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Posteingang</h1>
        <p className="text-muted-foreground">Eingehende Anfragen und Nachrichten verwalten</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Nachrichten durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={selectedStatus === "Alle Status" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedStatus("Alle Status")}
          >
            Alle Status
          </Button>
          <Button
            variant={selectedStatus === "Neu" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedStatus("Neu")}
          >
            Neu
          </Button>
          <Button
            variant={selectedStatus === "Hoch" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedStatus("Hoch")}
          >
            Hoch
          </Button>
        </div>
      </div>
    </div>
  )
}
