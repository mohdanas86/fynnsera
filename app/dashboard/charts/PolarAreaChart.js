// "use client";

// import React, { useEffect } from "react";
// import {
//   Bar,
//   BarChart,
//   CartesianGrid,
//   LabelList,
//   XAxis,
//   YAxis,
//   ResponsiveContainer,
//   Tooltip,
// } from "recharts";
// import { TrendingUp } from "lucide-react";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   ChartContainer,
//   ChartTooltip,
//   ChartTooltipContent,
// } from "@/components/ui/chart";

// // Helper function to aggregate transactions by month
// const transformData = (transactions) => {
//   if (!Array.isArray(transactions) || transactions.length === 0) {
//     console.log("No transactions provided");
//     return [];
//   }
//   const groups = {};
//   transactions.forEach((transaction) => {
//     if (!transaction.date) return;
//     const dateObj = new Date(transaction.date);
//     // Use abbreviated month name (e.g., "Jan")
//     const monthName = dateObj.toLocaleString("default", { month: "short" });
//     groups[monthName] = (groups[monthName] || 0) + transaction.amount;
//   });
//   // Define proper month order for abbreviated names
//   const monthOrder = [
//     "Jan",
//     "Feb",
//     "Mar",
//     "Apr",
//     "May",
//     "Jun",
//     "Jul",
//     "Aug",
//     "Sep",
//     "Oct",
//     "Nov",
//     "Dec",
//   ];
//   const data = monthOrder
//     .filter((month) => groups[month] !== undefined)
//     .map((month) => ({ month, value: groups[month] }));
//   console.log("Transformed chart data:", data);
//   return data;
// };

// export function VerticalBarChart({ userTransaction = [] }) {
//   const chartData = transformData(userTransaction);

//   useEffect(() => {
//     console.log("userTransaction prop:", userTransaction);
//     console.log("Chart data:", chartData);
//   }, [userTransaction, chartData]);

//   return (
//     <Card className="w-full">
//       <CardHeader>
//         <CardTitle>Labeled Monthly Transactions</CardTitle>
//         <CardDescription>
//           Detailed Transaction Data for Each Month.
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         <ChartContainer
//           config={{ value: { label: "Value", color: "#00C853" } }}
//         >
//           <ResponsiveContainer width="100%" height={300}>
//             <BarChart
//               data={chartData}
//               margin={{ top: 20, left: 0, right: 20, bottom: 10 }}
//             >
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis
//                 dataKey="month"
//                 tickLine={false}
//                 tickMargin={10}
//                 axisLine={false}
//               />
//               <YAxis hide />
//               <Tooltip
//                 cursor={false}
//                 content={<ChartTooltipContent hideLabel />}
//               />
//               <Bar dataKey="value" fill="rgb(0, 200, 83)" radius={8}>
//                 <LabelList
//                   position="top"
//                   offset={12}
//                   fontSize={12}
//                   formatter={(value) => `₹${Number(value).toFixed(2)}`}
//                   className="fill-foreground"
//                 />
//               </Bar>
//             </BarChart>
//           </ResponsiveContainer>
//         </ChartContainer>
//       </CardContent>
//     </Card>
//   );
// }

"use client";

import React, { useMemo } from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

// Month order for consistent sorting
const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const transformData = (transactions = []) => {
  const grouped = {};

  transactions.forEach((tx) => {
    if (!tx.date || typeof tx.amount !== "number") return;
    const month = new Date(tx.date).toLocaleString("default", {
      month: "short",
    });
    if (!grouped[month]) grouped[month] = 0;
    grouped[month] += tx.amount;
  });

  return monthNames.map((month) => ({
    month,
    value: grouped[month] || 0,
  }));
};

function PolarAreaChart({ userTransaction = [] }) {
  const chartData = useMemo(
    () => transformData(userTransaction),
    [userTransaction]
  );

  return (
    <Card className="w-full rounded-2xl border border-gray-100 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Polar Monthly Spending
        </CardTitle>
        <CardDescription className="text-sm text-gray-500">
          Radial representation of monthly transactions.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[350px] flex justify-center items-center">
        <ChartContainer
          config={{ value: { label: "Total", color: "#3B82F6" } }}
          className="w-full h-[350px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#374151" }}
              />
              <Tooltip
                formatter={(value) => `₹${Number(value).toLocaleString()}`}
                content={<ChartTooltipContent />}
              />
              <Radar
                name="Amount"
                dataKey="value"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export default PolarAreaChart;
