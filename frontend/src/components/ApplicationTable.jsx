import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { mockApplications } from "../data/mockApplications";

// column setup - defines what fields show up and how they're labeled
const columns = [
  { accessorKey: "company", header: "Company" },
  { accessorKey: "role", header: "Role" },
  { accessorKey: "status", header: "Status" },
  { accessorKey: "appliedDate", header: "Applied Date" },
  {
    accessorKey: "salary",
    header: "Salary",
    cell: (info) => `$${info.getValue().toLocaleString()}`,
  },
  { accessorKey: "location", header: "Location" },
];

function ApplicationTable() {
  const [data] = useState(mockApplications);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="p-6">
      <input
        type="text"
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        placeholder="Search applications..."
        className="mb-4 px-3 py-2 border border-gray-300 rounded-md text-sm w-64"
      />
      <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className="px-4 py-2 text-left text-sm font-semibold text-gray-700 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-1">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    <ArrowUpDown size={14} className="text-gray-400" />
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-t hover:bg-gray-50">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-2 text-sm text-gray-800">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ApplicationTable;