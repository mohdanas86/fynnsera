// "use client";

// import React from "react";
// import {
//   Area,
//   AreaChart,
//   CartesianGrid,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";

// // Helper function to aggregate transactions by month.
// // The output keys are renamed to "name" (month) and "value" (total amount)
// // to match the LChart style.
// const transformData = (transactions) => {
//   if (!Array.isArray(transactions)) {
//     transactions = [];
//   }
//   const groups = {};
//   transactions.forEach((transaction) => {
//     if (!transaction.date) return;
//     const dateObj = new Date(transaction.date);
//     // Get abbreviated month name (e.g., "jan")
//     const monthName = dateObj
//       .toLocaleString("default", { month: "short" })
//       .toLowerCase();
//     groups[monthName] = (groups[monthName] || 0) + transaction.amount;
//   });
//   // Define month order for sorting using abbreviated month names
//   const monthOrder = [
//     "jan",
//     "feb",
//     "mar",
//     "apr",
//     "may",
//     "jun",
//     "jul",
//     "aug",
//     "sep",
//     "oct",
//     "nov",
//     "dec",
//   ];
//   return monthOrder
//     .filter((month) => groups[month] !== undefined)
//     .map((month) => ({ name: month, value: groups[month] }));
// };

// function AreaCharts({ userTransaction }) {
//   const chartData = transformData(userTransaction);
//   console.log("userTransaction", userTransaction, "chartData", chartData);

//   return (
//     <Card className="w-full h-[430px]">
//       <CardHeader>
//         <CardTitle>Monthly Transaction Trends</CardTitle>
//         <CardDescription>
//           Visualizing Total Amounts Across Each Month at a Glance.
//         </CardDescription>
//       </CardHeader>
//       <CardContent className="h-full">
//         <div className="w-full h-[300px]">
//           <ResponsiveContainer width="100%" height="100%">
//             <AreaChart
//               data={chartData}
//               margin={{ top: 0, right: 0, left: 20, bottom: 0 }}
//             >
//               <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
//               <XAxis
//                 dataKey="name"
//                 tick={{ fontSize: 14, fill: "#6b7280" }}
//                 axisLine={{ stroke: "#d1d5db" }}
//                 tickLine={false}
//               />
//               <YAxis
//                 tickFormatter={(value) => {
//                   if (value >= 1000000) {
//                     return (value / 1000000).toFixed(0) + "M";
//                   } else if (value >= 1000) {
//                     return (value / 1000).toFixed(0) + "K";
//                   } else {
//                     return value.toFixed(0);
//                   }
//                 }}
//                 tick={{ fontSize: 14, fill: "#6b7280" }}
//                 axisLine={{ stroke: "#d1d5db" }}
//                 tickLine={false}
//                 width={35}
//               />
//               <Tooltip
//                 contentStyle={{
//                   fontSize: "14px",
//                   backgroundColor: "#ffffff",
//                   color: "#333333",
//                   border: "1px solid #d1d5db",
//                   borderRadius: "8px",
//                   boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
//                 }}
//                 formatter={(value) => {
//                   return `₹${value.toLocaleString()}`;
//                 }}
//               />
//               <defs>
//                 <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
//                   <stop
//                     offset="5%"
//                     stopColor="rgb(38, 98, 217)"
//                     stopOpacity={0.3}
//                   />
//                   <stop
//                     offset="95%"
//                     stopColor="rgb(38, 98, 217)"
//                     stopOpacity={0}
//                   />
//                 </linearGradient>
//               </defs>
//               <Area
//                 type="monotoneX"
//                 dataKey="value"
//                 stroke="rgb(38, 98, 217)"
//                 fill="url(#colorValue)"
//                 strokeWidth={2}
//               />
//             </AreaChart>
//           </ResponsiveContainer>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// export default AreaCharts;

"use client";
import React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Groups transactions by month AND year.
 * Each transaction's `date` is used to generate a key like "Jan 2023".
 * The amounts for transactions in the same month/year are summed.
 * The data is sorted chronologically.
 *
 * @param {Array} transactions - Array of transaction objects.
 * @returns {Array} Array of objects with:
 *   - name: Month-year (e.g., "Jan 2023")
 *   - value: Sum of amounts for that period.
 */
const transformData = (transactions) => {
  if (!Array.isArray(transactions)) return [];

  // Group transactions by month-year key (e.g., "Apr 2025")
  const groups = {};

  transactions.forEach((transaction) => {
    if (!transaction.date) return;
    const dateObj = new Date(transaction.date);
    if (isNaN(dateObj)) return; // Skip invalid dates

    // Create a key with both month and year (e.g., "Apr 2025")
    const key = dateObj.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    groups[key] = (groups[key] || 0) + transaction.amount;
  });

  // Convert groups to an array with a helper Date for sorting
  const dataWithSort = Object.keys(groups).map((key) => {
    // Create a Date object from the key assuming the 1st day of the month.
    const sortDate = new Date(`1 ${key}`);
    return { name: key, value: groups[key], sortDate };
  });

  // Sort chronologically by sortDate then remove the helper field
  const sortedData = dataWithSort
    .sort((a, b) => a.sortDate - b.sortDate)
    .map(({ name, value }) => ({ name, value }));

  return sortedData;
};

function AreaCharts({ userTransaction }) {
  const chartData = transformData(userTransaction);
  console.log("Transformed chart data:", chartData);

  return (
    <Card className="w-full h-[430px]">
      <CardHeader>
        <CardTitle>Monthly Transaction Trends</CardTitle>
        <CardDescription>
          Visualizing total transaction amounts per month.
        </CardDescription>
      </CardHeader>
      <CardContent className="h-full">
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 0, right: 0, left: 20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 14, fill: "#6b7280" }}
                axisLine={{ stroke: "#d1d5db" }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(value) => {
                  if (value >= 1000000) {
                    return (value / 1000000).toFixed(0) + "M";
                  } else if (value >= 1000) {
                    return (value / 1000).toFixed(0) + "K";
                  } else {
                    return value.toFixed(0);
                  }
                }}
                tick={{ fontSize: 14, fill: "#6b7280" }}
                axisLine={{ stroke: "#d1d5db" }}
                tickLine={false}
                width={35}
              />
              <Tooltip
                contentStyle={{
                  fontSize: "14px",
                  backgroundColor: "#ffffff",
                  color: "#333333",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                }}
                formatter={(value) => `₹${value.toLocaleString()}`}
              />
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="rgb(38, 98, 217)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="rgb(38, 98, 217)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <Area
                type="monotoneX"
                dataKey="value"
                stroke="rgb(38, 98, 217)"
                fill="url(#colorValue)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default AreaCharts;
