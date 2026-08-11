"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardData } from "@/types";

export function DismissalChart({ data }: { data: DashboardData["dismissalTrend"] }) {
  const chartData = data.map((point) => ({
    date: new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(point.visitDate)),
    rate: Math.round(point.rate * 100),
  }));

  return (
    <section className="card p-5">
      <div className="mb-5">
        <h2 className="font-display text-title">Dismissal Over Time</h2>
        <p className="text-sm text-muted">Lower is better. Each point represents one logged visit.</p>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
            <CartesianGrid stroke="#EDE8EB" strokeDasharray="4 4" />
            <XAxis dataKey="date" tick={{ fill: "#7A6B7E", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              tick={{ fill: "#7A6B7E", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip formatter={(value) => [`${value}%`, "Dismissal rate"]} />
            <Line
              type="monotone"
              dataKey="rate"
              stroke="#E8577A"
              strokeWidth={3}
              dot={{ r: 5, fill: "#fff", stroke: "#E8577A", strokeWidth: 2 }}
              activeDot={{ r: 7, fill: "#E8577A" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
