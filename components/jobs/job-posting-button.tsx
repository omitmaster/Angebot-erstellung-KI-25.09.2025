"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { JobPostingDialog } from "./job-posting-dialog"

export function JobPostingButton() {
  const [showDialog, setShowDialog] = useState(false)

  return (
    <>
      <Button onClick={() => setShowDialog(true)} className="gap-2">
        <Plus className="h-4 w-4" />
        Auftrag posten
      </Button>
      <JobPostingDialog open={showDialog} onOpenChange={setShowDialog} />
    </>
  )
}
