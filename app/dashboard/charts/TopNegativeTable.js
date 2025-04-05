// "use client";
// import React, { useMemo, useState, useEffect } from "react";
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

// // Helper: Format amount with currency (keeping negative sign)
// const formatAmount = (amount) => {
//   return `${amount.toFixed(2)}`;
// };

// // Helper Component to conditionally truncate the description
// const ResponsiveDescription = ({ text }) => {
//   const [isMobile, setIsMobile] = useState(false);

//   useEffect(() => {
//     const handleResize = () => {
//       setIsMobile(window.innerWidth < 640);
//     };
//     handleResize();
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   // If mobile, show only first 10 characters (adjustable as needed)
//   const truncated =
//     text && text.length > 30 ? text.substring(0, 10) + "..." : text;

//   return <div>{isMobile ? truncated : text}</div>;
// };

// // Define columns for the table: Description and Amount only.
// const columns = [
//   {
//     accessorKey: "description",
//     header: "Description",
//     cell: ({ row }) => (
//       <ResponsiveDescription text={row.getValue("description")} />
//     ),
//   },
//   {
//     accessorKey: "amount",
//     header: "Amount | ₹",
//     cell: ({ row }) => {
//       const value = row.getValue("amount");
//       return (
//         <div className="text-right font-medium">{formatAmount(value)}</div>
//       );
//     },
//   },
// ];

// export default function TopNegativeTable({ transactions = [] }) {
//   // Ensure transactions is an array; if empty, use an empty array.
//   const data = Array.isArray(transactions) ? transactions : [];

//   // Filter to only negative amounts, sort by absolute value descending, then take top 5.
//   const sortedData = useMemo(() => {
//     return data
//       .filter((tx) => tx.amount < 0)
//       .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
//       .slice(0, 5);
//   }, [data]);

//   const table = useReactTable({
//     data: sortedData,
//     columns,
//     getCoreRowModel: getCoreRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//   });

//   return (
//     <div className="rounded-lg">
//       <h2 className="lg:text-2xl font-bold mb-4">Top 5 Transactions Sent</h2>
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
//             {table.getRowModel().rows?.length ? (
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

import React, { useMemo, useState, useEffect } from "react";
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

// Helper: Format to k
const formatToK = (value) => {
  return value <= -1000 || value >= 1000
    ? `${(value / 1000).toFixed(0)}k`
    : value;
};

// Responsive description truncator
const ResponsiveDescription = ({ text }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const truncated =
    text && text.length > 30 ? text.substring(0, 10) + "..." : text;
  return isMobile ? truncated : text;
};

function TopNegativeChart({ transactions = [] }) {
  const data = Array.isArray(transactions) ? transactions : [];

  // Get top 5 negative transactions
  const topNegatives = useMemo(() => {
    return data
      .filter((tx) => tx.amount < 0)
      .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
      .slice(0, 5);
  }, [data]);

  const chartColors = [
    "#EF4444", // Red
    "#F97316", // Orange
    "#EAB308", // Yellow
    "#14B8A6", // Teal
    "#6366F1", // Indigo
  ];

  const chartData = {
    labels: topNegatives.map((tx) => {
      const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
      const desc = tx.description || "";
      return isMobile && desc.length > 30
        ? desc.substring(0, 10) + "..."
        : desc;
    }),

    datasets: [
      {
        label: "Amount Sent (₹)",
        data: topNegatives.map((tx) => Math.abs(tx.amount)),
        backgroundColor: chartColors.slice(0, topNegatives.length),
        borderRadius: 8,
        barThickness: 36,
        borderSkipped: false,
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
          color: "#1F2937",
          font: { size: 12, weight: "600" },
        },
      },
      title: {
        display: true,
        text: "Top 5 Transactions Sent",
        color: "#111827",
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
          color: "#4B5563",
          font: { size: 13 },
        },
      },
      y: {
        grid: {
          color: "#E5E7EB",
          borderDash: [4, 4],
        },
        ticks: {
          color: "#6B7280",
          font: { size: 12 },
          callback: (value) => `₹${formatToK(value)}`,
        },
      },
    },
  };

  return (
    <div className="p-4 sm:p-6 bg-white rounded-xl shadow-md max-w-4xl w-full h-[400px] mx-auto">
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
}

export default TopNegativeChart;
