import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Minus, CheckCircle, AlertCircle, Info } from "lucide-react"

interface MarketAnalysisProps {
  marketAnalysis: {
    positionsAnalyzed: number
    totalPositions: number
    averageConfidence: number
    dataQuality: string
  }
  positions: Array<{
    title: string
    unitPrice: number
    marketData?: {
      confidence: number
      marketPrice: number
      priceVariance: number
      sources: string[]
    }
  }>
}

export function OfferMarketAnalysis({ marketAnalysis, positions }: MarketAnalysisProps) {
  const getVarianceIcon = (variance: number) => {
    if (variance > 10) return <TrendingUp className="h-4 w-4 text-red-500" />
    if (variance < -10) return <TrendingDown className="h-4 w-4 text-green-500" />
    return <Minus className="h-4 w-4 text-gray-500" />
  }

  const getVarianceBadge = (variance: number) => {
    if (variance > 10) return <Badge variant="destructive">+{variance}%</Badge>
    if (variance < -10) return <Badge variant="default">{variance}%</Badge>
    return <Badge variant="secondary">{variance}%</Badge>
  }

  const getQualityIcon = (quality: string) => {
    switch (quality) {
      case "Hoch":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "Mittel":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Marktanalyse
        </CardTitle>
        <CardDescription>Preisvergleich basierend auf analysierten Angeboten aus der Datenbank</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{marketAnalysis.positionsAnalyzed}</div>
            <div className="text-sm text-muted-foreground">Analysierte Positionen</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{marketAnalysis.averageConfidence}%</div>
            <div className="text-sm text-muted-foreground">Durchschn. Konfidenz</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              {getQualityIcon(marketAnalysis.dataQuality)}
              <span className="text-lg font-bold">{marketAnalysis.dataQuality}</span>
            </div>
            <div className="text-sm text-muted-foreground">Datenqualität</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round((marketAnalysis.positionsAnalyzed / marketAnalysis.totalPositions) * 100)}%
            </div>
            <div className="text-sm text-muted-foreground">Abdeckung</div>
          </div>
        </div>

        {/* Confidence Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Marktdaten-Konfidenz</span>
            <span>{marketAnalysis.averageConfidence}%</span>
          </div>
          <Progress value={marketAnalysis.averageConfidence} className="h-2" />
        </div>

        {/* Position Details */}
        <div className="space-y-3">
          <h4 className="font-medium">Positionsanalyse</h4>
          {positions
            .filter((pos) => pos.marketData)
            .slice(0, 5) // Show top 5 positions
            .map((position, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-sm">{position.title}</div>
                  <div className="text-xs text-muted-foreground">
                    Marktpreis: €{position.marketData!.marketPrice} | Konfidenz:{" "}
                    {Math.round(position.marketData!.confidence * 100)}% | Quellen:{" "}
                    {position.marketData!.sources.join(", ")}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getVarianceIcon(position.marketData!.priceVariance)}
                  {getVarianceBadge(position.marketData!.priceVariance)}
                </div>
              </div>
            ))}

          {positions.filter((pos) => pos.marketData).length > 5 && (
            <div className="text-center text-sm text-muted-foreground">
              ... und {positions.filter((pos) => pos.marketData).length - 5} weitere Positionen
            </div>
          )}
        </div>

        {/* Data Quality Info */}
        <div className="bg-muted/50 p-3 rounded-lg">
          <div className="text-sm">
            <strong>Datengrundlage:</strong> Diese Analyse basiert auf {marketAnalysis.positionsAnalyzed} Positionen aus
            analysierten Angeboten in der Datenbank. Preisabweichungen über ±10% werden hervorgehoben.
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
