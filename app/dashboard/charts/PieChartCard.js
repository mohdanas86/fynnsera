// "use client";

// import React, { useEffect } from "react";
// import {
//   Bar,
//   BarChart,
//   CartesianGrid,
//   XAxis,
//   YAxis,
//   ResponsiveContainer,
//   Tooltip,
// } from "recharts";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";

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
//     // Get the abbreviated month name (e.g., "Jan")
//     const monthName = dateObj.toLocaleString("default", { month: "short" });
//     groups[monthName] = (groups[monthName] || 0) + transaction.amount;
//   });
//   // Define the proper month order with abbreviated month names
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

// export function BarCharts({ userTransaction = [] }) {
//   const chartData = transformData(userTransaction);

//   useEffect(() => {
//     console.log("userTransaction prop:", userTransaction);
//     console.log("Chart data:", chartData);
//   }, [userTransaction, chartData]);

//   return (
//     <Card className="w-full">
//       <CardHeader>
//         <CardTitle>Monthly Transaction Breakdown</CardTitle>
//         <CardDescription>
//           Comparing Transaction Data Month Over Month.
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         {chartData.length === 0 ? (
//           <div className="text-center text-gray-500">No data available</div>
//         ) : (
//           <div className="w-full h-[300px]">
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart
//                 data={chartData}
//                 layout="vertical"
//                 margin={{ left: 0, right: 20, top: 10, bottom: 10 }}
//               >
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis type="number" dataKey="value" hide />
//                 <YAxis
//                   dataKey="month"
//                   type="category"
//                   tickLine={false}
//                   tickMargin={10}
//                   axisLine={false}
//                 />
//                 <Tooltip
//                   formatter={(value) => `₹${Number(value).toFixed(2)}`}
//                 />
//                 <Bar dataKey="value" fill="rgb(59, 130, 246)" radius={5} />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }

"use client";

import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
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

// Colors for Pie slices
const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#6366F1",
  "#EC4899",
  "#8B5CF6",
  "#F97316",
  "#14B8A6",
  "#22D3EE",
  "#A855F7",
  "#4B5563",
];

// Format large numbers to k
const formatAmount = (amount) => {
  return Math.abs(amount) >= 1000
    ? `₹${(amount / 1000).toFixed(1)}k`
    : `₹${amount}`;
};

// Group by month
const transformData = (transactions) => {
  if (!Array.isArray(transactions)) return [];
  const groups = {};

  transactions.forEach((tx) => {
    if (!tx.date) return;
    const date = new Date(tx.date);
    const month = date.toLocaleString("default", { month: "short" });

    if (!groups[month]) groups[month] = 0;
    groups[month] += tx.amount;
  });

  const monthOrder = [
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

  return monthOrder
    .filter((m) => groups[m] !== undefined)
    .map((month) => ({
      name: month,
      value: Math.abs(groups[month]),
    }));
};

function PieChartCard({ userTransaction = [] }) {
  const data = useMemo(() => transformData(userTransaction), [userTransaction]);

  // Get current month name (e.g., "Apr")
  const currentMonth = new Date().toLocaleString("default", { month: "short" });

  return (
    <Card className="w-full bg-white shadow-md rounded-xl">
      <CardHeader>
        <CardTitle>Monthly Transaction Distribution</CardTitle>
        <CardDescription>
          A visual overview of transactions grouped by month.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center text-gray-500">No data available</div>
        ) : (
          <div className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart
                tabIndex={-1}
                style={{
                  outline: "none",
                  userSelect: "none",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  label={({ name, value }) => `${name}: ${formatAmount(value)}`}
                  labelLine
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke="#fff"
                      strokeWidth={entry.name === currentMonth ? 1 : 1}
                      style={{
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        outline: "none",
                        userSelect: "none",
                        WebkitTapHighlightColor: "transparent",
                        ...(entry.name === currentMonth && {
                          filter: "drop-shadow(0 0 6px rgba(0, 0, 0, 0.4))",
                          transform: "scale(1.03)",
                          transformOrigin: "center",
                        }),
                      }}
                    />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value) => `₹${Number(value).toFixed(2)}`}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #E5E7EB",
                    borderRadius: "0.5rem",
                    color: "#111827",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    fontSize: "14px",
                  }}
                  cursor={{ fill: "rgba(0, 0, 0, 0.03)" }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  formatter={(value) => (
                    <span className="text-sm text-gray-700">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PieChartCard;
