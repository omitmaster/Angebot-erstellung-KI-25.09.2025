"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Settings, Clock, Mail, Phone, MessageSquare, Smartphone, Plus, Edit, Trash2 } from "lucide-react"
import { FollowUpService, type FollowUpRule } from "@/lib/follow-up-service"

interface FollowUpAutomationDialogProps {
  trigger?: React.ReactNode
}

export function FollowUpAutomationDialog({ trigger }: FollowUpAutomationDialogProps) {
  const [rules, setRules] = useState<FollowUpRule[]>(FollowUpService.getFollowUpRules())
  const [selectedRule, setSelectedRule] = useState<FollowUpRule | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "email":
        return <Mail className="h-4 w-4" />
      case "phone":
        return <Phone className="h-4 w-4" />
      case "sms":
        return <Smartphone className="h-4 w-4" />
      case "whatsapp":
        return <MessageSquare className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getMethodLabel = (method: string) => {
    switch (method) {
      case "email":
        return "E-Mail"
      case "phone":
        return "Telefon"
      case "sms":
        return "SMS"
      case "whatsapp":
        return "WhatsApp"
      default:
        return method
    }
  }

  const handleRuleUpdate = (updatedRule: FollowUpRule) => {
    setRules(rules.map((rule) => (rule.id === updatedRule.id ? updatedRule : rule)))
    setSelectedRule(updatedRule)
  }

  const handleAddRule = () => {
    const newRule: FollowUpRule = {
      id: Date.now().toString(),
      name: "Neue Regel",
      triggerDays: 1,
      method: "email",
      template: "",
      isActive: true,
    }
    setRules([...rules, newRule])
    setSelectedRule(newRule)
    setIsEditing(true)
  }

  const handleDeleteRule = (ruleId: string) => {
    setRules(rules.filter((rule) => rule.id !== ruleId))
    if (selectedRule?.id === ruleId) {
      setSelectedRule(null)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Automation
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Follow-up Automation
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Rules List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Automation Regeln</h3>
              <Button size="sm" onClick={handleAddRule}>
                <Plus className="h-4 w-4 mr-1" />
                Regel
              </Button>
            </div>

            <ScrollArea className="h-96">
              <div className="space-y-2">
                {rules.map((rule) => (
                  <Card
                    key={rule.id}
                    className={`cursor-pointer transition-colors ${
                      selectedRule?.id === rule.id ? "border-accent bg-accent/5" : "hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedRule(rule)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="flex items-center gap-1">
                              {getMethodIcon(rule.method)}
                              {getMethodLabel(rule.method)}
                            </Badge>
                            <Badge variant={rule.isActive ? "default" : "secondary"}>
                              {rule.isActive ? "Aktiv" : "Inaktiv"}
                            </Badge>
                          </div>
                          <h4 className="font-medium text-sm">{rule.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            Nach {rule.triggerDays} Tag{rule.triggerDays !== 1 ? "en" : ""}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteRule(rule.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Right Panel - Rule Editor */}
          <div className="space-y-4">
            {selectedRule ? (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Regel bearbeiten</h3>
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(!isEditing)}>
                    <Edit className="h-4 w-4 mr-1" />
                    {isEditing ? "Speichern" : "Bearbeiten"}
                  </Button>
                </div>

                <Card>
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Regelname</label>
                      <Input
                        value={selectedRule.name}
                        onChange={(e) => handleRuleUpdate({ ...selectedRule, name: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Auslöser (Tage)</label>
                        <Input
                          type="number"
                          min="1"
                          value={selectedRule.triggerDays}
                          onChange={(e) =>
                            handleRuleUpdate({
                              ...selectedRule,
                              triggerDays: Number.parseInt(e.target.value) || 1,
                            })
                          }
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Methode</label>
                        <Select
                          value={selectedRule.method}
                          onValueChange={(value) =>
                            handleRuleUpdate({
                              ...selectedRule,
                              method: value as any,
                            })
                          }
                          disabled={!isEditing}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="email">E-Mail</SelectItem>
                            <SelectItem value="phone">Telefon</SelectItem>
                            <SelectItem value="sms">SMS</SelectItem>
                            <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">Vorlage</label>
                      <Textarea
                        value={selectedRule.template}
                        onChange={(e) => handleRuleUpdate({ ...selectedRule, template: e.target.value })}
                        disabled={!isEditing}
                        rows={6}
                        placeholder="Nachrichtenvorlage..."
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Regel aktiv</label>
                      <Switch
                        checked={selectedRule.isActive}
                        onCheckedChange={(checked) =>
                          handleRuleUpdate({
                            ...selectedRule,
                            isActive: checked,
                          })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Vorschau</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getMethodIcon(selectedRule.method)}
                        <span className="text-sm font-medium">
                          {getMethodLabel(selectedRule.method)} nach {selectedRule.triggerDays} Tag
                          {selectedRule.triggerDays !== 1 ? "en" : ""}
                        </span>
                      </div>
                      <div className="bg-muted/50 p-3 rounded text-sm whitespace-pre-wrap">
                        {selectedRule.template || "Keine Vorlage definiert"}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Wählen Sie eine Regel zum Bearbeiten</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
