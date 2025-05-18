// // components/LineChartComponent.jsx
// import { transformData, formatLabel } from "@/lib/chartHelpers";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardContent,
// } from "@/components/ui/card";

// function LineChartComponent({ transactions }) {
//   const { chartData, interval, showYear } = transformData(transactions);

//   return (
//     <Card className="w-full max-w-full h-auto">
//       <CardHeader>
//         <CardTitle className="text-base sm:text-lg md:text-xl">
//           Transaction Overview
//         </CardTitle>
//         <CardDescription className="text-sm sm:text-base">
//           {interval === "day"
//             ? "Daily"
//             : interval === "week"
//             ? "Weekly"
//             : "Monthly"}{" "}
//           trends
//         </CardDescription>
//       </CardHeader>

//       <CardContent className="h-full space-y-4 pb-6">
//         <div className="w-full h-[250px] sm:h-[350px]">
//           <ResponsiveContainer width="100%" height="100%">
//             <LineChart
//               data={chartData}
//               margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
//             >
//               <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
//               <XAxis
//                 dataKey="timestamp"
//                 type="number"
//                 scale="time"
//                 domain={["dataMin", "dataMax"]}
//                 tickFormatter={(ts) =>
//                   formatLabel(new Date(ts), interval, showYear)
//                 }
//                 tick={{ fontSize: 12, fill: "#6b7280" }}
//                 angle={interval === "day" ? -45 : 0}
//                 interval="preserveStartEnd"
//               />
//               <YAxis
//                 tickFormatter={(value) =>
//                   new Intl.NumberFormat("en-IN", {
//                     style: "currency",
//                     currency: "INR",
//                     notation: "compact",
//                   }).format(value)
//                 }
//                 tick={{ fontSize: 12, fill: "#6b7280" }}
//               />
//               <Tooltip
//                 content={({ payload }) => (
//                   <div className="bg-white p-3 rounded-lg shadow-lg border">
//                     <p className="font-semibold">
//                       {payload?.[0]?.payload.label}
//                     </p>
//                     <p>
//                       Total:{" "}
//                       {new Intl.NumberFormat("en-IN", {
//                         style: "currency",
//                         currency: "INR",
//                       }).format(payload?.[0]?.value)}
//                     </p>
//                   </div>
//                 )}
//               />
//               <Line
//                 type="monotone"
//                 dataKey="value"
//                 stroke="#3b82f6"
//                 strokeWidth={2}
//                 dot={{ r: 4 }}
//               />
//             </LineChart>
//           </ResponsiveContainer>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// export default LineChartComponent;

import { transformData, formatLabel } from "@/lib/chartHelpers";
import {
  BarChart,
  Bar,
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

function LineChartComponent({ transactions }) {
  const { chartData, interval, showYear } = transformData(transactions);

  return (
    <Card className="w-full h-full overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg md:text-xl">
          Transaction Overview
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">
          {interval === "day"
            ? "Daily"
            : interval === "week"
            ? "Weekly"
            : "Monthly"}{" "}
          breakdown
        </CardDescription>
      </CardHeader>{" "}
      <CardContent className="pt-2 h-[calc(100%-80px)]">
        <div className="w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
              barGap={8}
              barSize={interval === "day" ? 10 : interval === "week" ? 15 : 24}
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
                tickFormatter={(value) =>
                  new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    notation: "compact",
                  }).format(value)
                }
                tick={{ fontSize: 11, fill: "#6b7280" }}
                width={60}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(79, 70, 229, 0.1)" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                        <p className="font-semibold text-sm mb-1">
                          {payload[0].payload.label}
                        </p>
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Total: </span>
                          {new Intl.NumberFormat("en-IN", {
                            style: "currency",
                            currency: "INR",
                          }).format(payload[0].value)}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="value"
                fill="#4f46e5"
                radius={[4, 4, 0, 0]}
                animationDuration={1500}
              />
              <Legend
                wrapperStyle={{ bottom: 0 }}
                content={() => (
                  <div className="flex items-center justify-center mt-2">
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <div className="w-3 h-3 bg-indigo-600 rounded-sm" />
                      <span>Transaction Amount</span>
                    </div>
                  </div>
                )}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default LineChartComponent;

// export default LineChartComponent;
