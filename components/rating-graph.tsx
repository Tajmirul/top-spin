"use client";

import { Card } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

interface RatingDataPoint {
  rating: number;
  createdAt: Date | string;
  change?: number;
}

interface RatingGraphProps {
  data: RatingDataPoint[];
  currentRating: number;
}

export function RatingGraph({ data, currentRating }: RatingGraphProps) {
  // Filter data to last 3 months
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const allFormattedData = data.map((point) => ({
    rating: point.rating,
    date: new Date(point.createdAt),
    displayDate: format(new Date(point.createdAt), "MMM d"),
  }));

  // Get data from last 3 months, but ensure we have at least 2 points for the chart
  const recentData = allFormattedData.filter(
    (point) => point.date >= threeMonthsAgo,
  );
  let formattedData = recentData.length >= 2 ? recentData : allFormattedData;

  // If we have less than 2 points, create a straight line with the current rating
  if (formattedData.length < 2) {
    const now = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3);

    formattedData = [
      {
        rating: currentRating,
        date: startDate,
        displayDate: format(startDate, "MMM d"),
      },
      {
        rating: currentRating,
        date: now,
        displayDate: format(now, "MMM d"),
      },
    ];
  }

  const minRating = Math.min(...formattedData.map((d) => d.rating));
  const maxRating = Math.max(...formattedData.map((d) => d.rating));
  const padding = 50;
  const yDomain = [
    Math.floor((minRating - padding) / 100) * 100,
    Math.ceil((maxRating + padding) / 100) * 100,
  ];

  return (
    <Card className="border-zinc-800 bg-zinc-900 p-4 h-full">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-serif text-xl font-semibold">
          Rating History
        </h2>
        <div className="text-right">
          <div className="text-sm text-zinc-400">Current Rating</div>
          <div className="text-2xl font-bold text-primary">{currentRating}</div>
        </div>
      </div>

      <div className="h-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData}>
            <defs>
              <linearGradient id="ratingGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00ffa5" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00ffa5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="displayDate"
              stroke="#52525b"
              style={{ fontSize: "11px" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={yDomain}
              stroke="#52525b"
              style={{ fontSize: "11px" }}
              tickLine={false}
              axisLine={false}
              width={45}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: "6px",
                padding: "8px 12px",
              }}
              labelStyle={{ color: "#a1a1aa", fontSize: "12px" }}
              itemStyle={{
                color: "#00ffa5",
                fontSize: "14px",
                fontWeight: "600",
              }}
              formatter={(value: number | undefined) => [value || 0, "Rating"]}
              cursor={{ stroke: "#3f3f46", strokeWidth: 1 }}
            />
            <Area
              type="monotone"
              dataKey="rating"
              stroke="#00ffa5"
              strokeWidth={2}
              fill="url(#ratingGradient)"
              dot={false}
              activeDot={{
                r: 4,
                fill: "#00ffa5",
                stroke: "#18181b",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
