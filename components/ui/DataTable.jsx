"use client";

import React from "react";

export const DataTable = ({ columns, data, className }) => {
  return (
    <table className={`min-w-full ${className}`}>
      <thead>
        <tr>
          {columns.map((col) => (
            <th
              key={col.accessorKey}
              className="px-4 py-2 text-left text-sm font-semibold text-gray-600"
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={rowIndex} className="hover:bg-gray-50">
            {columns.map((col) => (
              <td
                key={col.accessorKey}
                className="px-4 py-2 text-sm text-gray-700"
              >
                {col.cell
                  ? col.cell({ getValue: () => row[col.accessorKey] })
                  : row[col.accessorKey]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
