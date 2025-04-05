// "use client";
// import React, { useMemo } from "react";
// import {
//   flexRender,
//   getCoreRowModel,
//   getSortedRowModel,
//   useReactTable,
// } from "@tanstack/react-table";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";

// // Helper: Format amount with currency
// const formatAmount = (amount) => {
//   return `₹${amount.toFixed(2)}`;
// };

// // Define columns for the aggregated category table
// const columns = [
//   {
//     accessorKey: "category",
//     header: "Category",
//     cell: ({ row }) => <div>{row.getValue("category")}</div>,
//   },
//   {
//     accessorKey: "total",
//     header: "Total Amount",
//     cell: ({ row }) => (
//       <div className="text-right font-medium">
//         {formatAmount(row.getValue("total"))}
//       </div>
//     ),
//   },
// ];

// export default function TopCategoriesTable({ transactions }) {
//   // Ensure transactions is an array; if not, fallback to an empty array.
//   const data = Array.isArray(transactions) ? transactions : [];

//   // Aggregate transactions by category.
//   const aggregatedData = useMemo(() => {
//     const totals = {};
//     data.forEach((tx) => {
//       const category = tx.category || "Uncategorized";
//       totals[category] = (totals[category] || 0) + tx.amount;
//     });
//     const dataArray = Object.entries(totals).map(([category, total]) => ({
//       category,
//       total,
//     }));
//     // Sort descending by total and take top 5 categories.
//     return dataArray.sort((a, b) => b.total - a.total).slice(0, 5);
//   }, [data]);

//   const table = useReactTable({
//     data: aggregatedData,
//     columns,
//     getCoreRowModel: getCoreRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//   });

//   return (
//     <div className="rounded-lg">
//       <h2 className="lg:text-2xl font-bold mb-4">Top 5 Categories</h2>
//       <div className="rounded-md border overflow-x-auto">
//         <Table>
//           <TableHeader className="bg-gray-50 sticky top-0 z-10">
//             {table.getHeaderGroups().map((headerGroup) => (
//               <TableRow key={headerGroup.id}>
//                 {headerGroup.headers.map((header) => (
//                   <TableHead
//                     key={header.id}
//                     className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                   >
//                     {header.isPlaceholder
//                       ? null
//                       : flexRender(
//                           header.column.columnDef.header,
//                           header.getContext()
//                         )}
//                   </TableHead>
//                 ))}
//               </TableRow>
//             ))}
//           </TableHeader>
//           <TableBody>
//             {table.getRowModel().rows.length ? (
//               table.getRowModel().rows.map((row) => (
//                 <TableRow key={row.id}>
//                   {row.getVisibleCells().map((cell) => (
//                     <TableCell key={cell.id} className="px-4 py-2">
//                       {flexRender(
//                         cell.column.columnDef.cell,
//                         cell.getContext()
//                       )}
//                     </TableCell>
//                   ))}
//                 </TableRow>
//               ))
//             ) : (
//               <TableRow>
//                 <TableCell
//                   colSpan={columns.length}
//                   className="h-24 text-center"
//                 >
//                   No results.
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </div>
//     </div>
//   );
// }
"use client";

import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function TopCategoriesBarChart({ transactions }) {
  const data = Array.isArray(transactions) ? transactions : [];

  // Aggregate and sort data
  const aggregatedData = useMemo(() => {
    const totals = {};
    data.forEach((tx) => {
      const category = tx.category || "Uncategorized";
      totals[category] = (totals[category] || 0) + tx.amount;
    });

    return Object.entries(totals)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [data]);

  const chartColors = [
    "#4F46E5", // Deep Indigo
    "#14B8A6", // Teal
    "#F59E0B", // Amber
    "#EF4444", // Rose
    "#3B82F6", // Sky
  ];

  const formatToK = (value) => {
    return value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value;
  };

  const chartData = {
    labels: aggregatedData.map((item) => item.category),
    datasets: [
      {
        label: "Amount (₹)",
        data: aggregatedData.map((item) => item.total),
        backgroundColor: chartColors.slice(0, aggregatedData.length),
        borderRadius: 8,
        borderSkipped: false,
        barThickness: 36,
      },
    ],
  };

  const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          color: "#1F2937", // Gray-800
          font: { size: 12, weight: "600" },
        },
      },
      title: {
        display: true,
        text: "Top 5 Spending Categories",
        color: "#111827", // Gray-900
        font: { size: 20, weight: "bold" },
        padding: { top: 10, bottom: 20 },
      },
      tooltip: {
        backgroundColor: "#111827",
        titleColor: "#FFF",
        bodyColor: "#FFF",
        callbacks: {
          label: (context) => `₹${formatToK(context.raw)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: "#4B5563", // Gray-600
          font: { size: 13 },
        },
      },
      y: {
        grid: {
          color: "#E5E7EB", // Gray-200
          borderDash: [4, 4],
        },
        ticks: {
          color: "#6B7280", // Gray-500
          font: { size: 12 },
          callback: (value) => `₹${formatToK(value)}`,
        },
      },
    },
  };

  return (
    <div className="p-4 sm:p-6 bg-white rounded-xl shadow-md max-w-4xl w-full h-[400px]">
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
}

export default TopCategoriesBarChart;
