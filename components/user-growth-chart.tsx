"use client"

import { useState } from "react"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const sampleData = [
  { month: "Jan", clients: 25, creatives: 15 },
  { month: "Feb", clients: 32, creatives: 18 },
  { month: "Mar", clients: 45, creatives: 22 },
  { month: "Apr", clients: 38, creatives: 19 },
  { month: "May", clients: 52, creatives: 28 },
  { month: "Jun", clients: 61, creatives: 34 },
]

export function UserGrowthChart() {
  const [timeRange, setTimeRange] = useState("6months")

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>User Growth</CardTitle>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="6months">6 Months</SelectItem>
            <SelectItem value="1year">1 Year</SelectItem>
            <SelectItem value="2years">2 Years</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sampleData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="clients" fill="#059669" name="Clients" />
              <Bar dataKey="creatives" fill="#0891b2" name="Creatives" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
