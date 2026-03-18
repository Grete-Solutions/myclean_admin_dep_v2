import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Page() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Live Tracking Map</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Live Tracking Map</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Real-time map view of drivers.</p>
        </CardContent>
      </Card>
    </div>
  )
}
