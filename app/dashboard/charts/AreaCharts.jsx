// components/AreaCharts.jsx
import { transformData, formatLabel } from "@/lib/chartHelpers";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

function AreaCharts({ transactions }) {
  const { chartData, interval, showYear } = transformData(transactions);

  // Function to format currency values
  const formatCurrency = (value) => {
    if (value >= 1000000) return `₹${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
    return `₹${value}`;
  };

  return (
    <Card className="w-full h-full overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg md:text-xl font-semibold">
          Transaction Trends
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">
          {interval === "day"
            ? "Daily"
            : interval === "week"
            ? "Weekly"
            : "Monthly"}{" "}
          transaction overview
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2 h-[calc(100%-80px)]">
        <div className="w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                opacity={0.6}
              />
              <XAxis
                dataKey="timestamp"
                type="number"
                scale="time"
                domain={["dataMin", "dataMax"]}
                tickFormatter={(ts) =>
                  formatLabel(new Date(ts), interval, showYear)
                }
                tick={{ fontSize: 11, fill: "#6b7280" }}
                angle={interval === "day" ? -45 : 0}
                tickMargin={interval === "day" ? 10 : 5}
                height={50}
                minTickGap={15}
              />
              <YAxis
                tickFormatter={formatCurrency}
                tick={{ fontSize: 11, fill: "#6b7280" }}
                width={60}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                        <p className="font-semibold text-sm mb-1">
                          {payload[0].payload.label}
                        </p>
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Total: </span>
                          {formatCurrency(payload[0].value)}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke="#2563eb"
                fill="url(#colorValue)"
                strokeWidth={2}
                activeDot={{ r: 6, strokeWidth: 1, stroke: "#fff" }}
              />
              <Legend
                wrapperStyle={{ bottom: 0 }}
                content={() => (
                  <div className="flex items-center justify-center mt-2">
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <div className="w-3 h-3 bg-blue-600 rounded-sm" />
                      <span>Transaction Amount</span>
                    </div>
                  </div>
                )}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default AreaCharts;
