"use client";
import React, { useMemo, useState, useEffect } from "react";
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

// Helper: Format amount with currency (only positive amounts)
const formatAmount = (amount) => {
  return `${Math.abs(amount).toFixed(2)}`;
};

// Helper Component to conditionally truncate the description
const ResponsiveDescription = ({ text }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const truncated =
    text && text.length > 30 ? text.substring(0, 10) + "..." : text;

  return <div>{isMobile ? truncated : text}</div>;
};

// Define columns for the table (only Description and Amount)
const columns = [
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <ResponsiveDescription text={row.getValue("description")} />
    ),
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
      <h2 className="lg:text-2xl font-bold mb-4">
        Top 5 Transactions Received
      </h2>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50 sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
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
                    <TableCell key={cell.id} className="px-4 py-2">
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
