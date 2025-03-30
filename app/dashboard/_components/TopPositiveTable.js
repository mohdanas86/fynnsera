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
  return `${Math.abs(amount).toFixed(2)}`;
};

// Define columns for the table (only Description and Amount)
const columns = [
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => <div>{row.getValue("description")}</div>,
  },
  {
    accessorKey: "amount",
    header: "Amount | $",
    cell: ({ row }) => {
      const value = row.getValue("amount");
      return (
        <div className="text-right font-medium">{formatAmount(value)}</div>
      );
    },
  },
];

export default function TopPositiveTable({ transactions = [] }) {
  // Ensure transactions is an array; if empty, use an empty array.
  const data = Array.isArray(transactions) ? transactions : [];

  // Filter to only positive amounts, sort descending, and take top 5.
  const sortedData = useMemo(() => {
    return data
      .filter((tx) => tx.amount > 0)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [data]);

  const table = useReactTable({
    data: sortedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Top 5 Transactions Received</h2>
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
