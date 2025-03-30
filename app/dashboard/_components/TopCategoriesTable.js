"use client";

import React, { useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Helper: Format amount with currency
const formatAmount = (amount) => {
  return `$${amount.toFixed(2)}`;
};

// Define columns for the aggregated category table
const columns = [
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => <div>{row.getValue("category")}</div>,
  },
  {
    accessorKey: "total",
    header: "Total Amount",
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {formatAmount(row.getValue("total"))}
      </div>
    ),
  },
];

export default function TopCategoriesTable({ transactions }) {
  // Ensure transactions is an array; if not, fallback to an empty array.
  const data = Array.isArray(transactions) ? transactions : [];

  // Aggregate transactions by category
  const aggregatedData = useMemo(() => {
    const totals = {};
    data.forEach((tx) => {
      const category = tx.category || "Uncategorized";
      totals[category] = (totals[category] || 0) + tx.amount;
    });
    const dataArray = Object.entries(totals).map(([category, total]) => ({
      category,
      total,
    }));
    // Sort descending by total and take top 5 categories
    return dataArray.sort((a, b) => b.total - a.total).slice(0, 5);
  }, [data]);

  const table = useReactTable({
    data: aggregatedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Top 5 Categories</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
