"use client";
import React, { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  Download,
  MoreHorizontal,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DatePickerWithRange } from "@/components/ui/DatePickerWithRange";
import { useMyContext } from "@/context/MyContext";

// Helper functions
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatAmount = (amount) => {
  return `₹${Math.abs(amount).toFixed(2)}`;
};

// Table columns definition
const columns = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => <div>{formatDate(row.getValue("date"))}</div>,
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Description <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("description")}</div>,
  },
  {
    id: "transactionId",
    header: "Transaction ID / UTR",
    cell: ({ row }) => {
      const transactionId = row.original.transactionId;
      const shortId = transactionId ? `${transactionId.slice(0, 8)}...` : "N/A";
      return transactionId ? (
        <div className="relative group inline-block">
          <span className="cursor-pointer">{shortId}</span>
          <div className="absolute z-10 hidden group-hover:block bg-slate-800 text-white text-xs px-3 py-1 rounded-lg shadow-lg -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
            {transactionId}
          </div>
        </div>
      ) : (
        <span className="text-gray-400">N/A</span>
      );
    },
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const value = row.getValue("amount");
      return (
        <div className="text-right font-medium">{formatAmount(value)}</div>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => <div>{row.getValue("category") || "Uncategorized"}</div>,
  },
  {
    accessorKey: "transactionType",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("transactionType");
      return type === "CREDIT" ? (
        <span className="inline-flex items-center text-green-600 text-sm font-semibold">
          <ArrowDownCircle className="w-4 h-4 mr-1" />
          Credit
        </span>
      ) : (
        <span className="inline-flex items-center text-red-600 text-sm font-semibold">
          <ArrowUpCircle className="w-4 h-4 mr-1" />
          Debit
        </span>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const transaction = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() =>
                navigator.clipboard.writeText(transaction.transactionId)
              }
            >
              Copy Transaction ID
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function TransactionsTable({ transactions }) {
  const {
    userTransaction,
    fileList,
    selectedProvider,
    selectedFileData,
    handleSelect,
  } = useMyContext();

  // Date picker state
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Set default date range based on transactions (if available)
  React.useEffect(() => {
    if (userTransaction && userTransaction.length) {
      const validDates = userTransaction
        .map((tx) => new Date(tx.date))
        .filter((d) => !isNaN(d));
      if (validDates.length > 0) {
        const min = new Date(Math.min(...validDates));
        const max = new Date(Math.max(...validDates));
        const formatDate = (d) => d.toISOString().slice(0, 10);
        setDateFrom(formatDate(min));
        setDateTo(formatDate(max));
      }
    }
  }, [userTransaction]);

  // Filter transactions based on selected date range.
  const filteredTransactions = useMemo(() => {
    if (!userTransaction || !userTransaction.length) return [];
    return userTransaction.filter((tx) => {
      const txDate = new Date(tx.date);
      if (dateFrom && new Date(dateFrom) > txDate) return false;
      if (dateTo && new Date(dateTo) < txDate) return false;
      return true;
    });
  }, [userTransaction, dateFrom, dateTo]);

  const hasOriginalData = useMemo(
    () => userTransaction && userTransaction.length > 0,
    [userTransaction]
  );
  const hasFilteredData = useMemo(
    () => filteredTransactions && filteredTransactions.length > 0,
    [filteredTransactions]
  );

  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data: transactions, // use the transactions prop passed down (from context)
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
    getRowId: (row, index) => row._id || `row-${index}`,
  });

  const handleExport = (format) => {
    const selectedRowIds = Object.keys(rowSelection);
    const exportData =
      selectedRowIds.length > 0
        ? userTransaction.filter((tx) => rowSelection[tx._id])
        : userTransaction;
    const exportObjects = exportData.map((tx) => ({
      Date: formatDate(tx.date),
      Description: tx.description,
      Amount: formatAmount(tx.amount),
      Category: tx.category || "Uncategorized",
      "Transaction ID": tx._id,
      Type: tx.transactionType === "DEBIT" ? "Credit" : "Debit",
    }));
    if (format === "csv") {
      const headers = Object.keys(exportObjects[0]).join(",");
      const rows = exportObjects
        .map((obj) =>
          Object.values(obj)
            .map((v) => `"${v}"`)
            .join(",")
        )
        .join("\n");
      const blob = new Blob([headers + "\n" + rows], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "transactions_export.csv";
      link.click();
      URL.revokeObjectURL(url);
    } else if (format === "xlsx") {
      const ws = XLSX.utils.json_to_sheet(exportObjects);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Transactions");
      XLSX.writeFile(wb, "transactions_export.xlsx");
    }
  };

  return (
    <div className="rounded-lg">
      <div className="flex items-center justify-between py-4 flex-wrap gap-4">
        <Input
          placeholder="Filter descriptions..."
          value={table.getColumn("description")?.getFilterValue() || ""}
          onChange={(e) =>
            table.getColumn("description")?.setFilterValue(e.target.value)
          }
          className="max-w-sm"
        />
        <div className="flex gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-white text-black border shadow-sm">
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("csv")}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("xlsx")}>
                Export as XLSX
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* File/Provider selection dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="w-[220px] flex justify-between items-center rounded-[4px] border border-gray-300 shadow-sm px-4 py-2 bg-white hover:bg-gray-50 transition-colors"
                variant="outline"
              >
                <span className="text-sm font-medium text-gray-700">
                  {selectedProvider || "Select Provider"}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[220px] rounded-[4px] shadow-md border border-gray-200 bg-white z-50">
              <DropdownMenuLabel className="text-xs font-semibold text-gray-500 px-3 py-2">
                Files
              </DropdownMenuLabel>
              {fileList.length > 0 ? (
                fileList.map((file, index) => (
                  <DropdownMenuItem
                    key={index}
                    onSelect={() => handleSelect(file)}
                    className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    {file.filename}
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-gray-400">
                  No files found
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {!header.isPlaceholder &&
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
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
                  className="text-center h-24"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
