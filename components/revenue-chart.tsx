"use client"

import { useState } from "react"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const sampleData = [
  { month: "Jan", revenue: 850000, bookings: 45 },
  { month: "Feb", revenue: 920000, bookings: 52 },
  { month: "Mar", revenue: 1100000, bookings: 61 },
  { month: "Apr", revenue: 980000, bookings: 48 },
  { month: "May", revenue: 1250000, bookings: 67 },
  { month: "Jun", revenue: 1400000, bookings: 78 },
]

export function RevenueChart() {
  const [timeRange, setTimeRange] = useState("6months")
  const [data, setData] = useState(sampleData)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("sw-TZ", {
      style: "currency",
      currency: "TZS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Revenue Overview</CardTitle>
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
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                labelStyle={{ color: "#374151" }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#059669"
                strokeWidth={3}
                dot={{ fill: "#059669", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#059669", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
