import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import { ArrowUpDown, Plus } from "lucide-react";
import { mockApplications } from "../data/mockApplications";
import Modal from "./Modal";
import ApplicationForm from "./ApplicationForm";

function ApplicationTable() {
  const [data, setData] = useState(mockApplications);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // modal state - tracks whether it's open, and which row (if any) we're editing
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);

  const handleStatusChange = (id, newStatus) => {
    setData((prevData) =>
      prevData.map((app) =>
        app.id === id ? { ...app, status: newStatus } : app
      )
    );
  };

  const openAddModal = () => {
    setEditingRow(null);
    setIsModalOpen(true);
  };

  const openEditModal = (row) => {
    setEditingRow(row);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRow(null);
  };

  const handleFormSubmit = (formData) => {
    if (editingRow) {
      // editing an existing row - match by id, replace its data
      setData((prevData) =>
        prevData.map((app) =>
          app.id === editingRow.id ? { ...formData, id: editingRow.id } : app
        )
      );
    } else {
      // adding a new row - generate a simple id off the current max
      const newId = Math.max(...data.map((app) => app.id), 0) + 1;
      setData((prevData) => [...prevData, { ...formData, id: newId }]);
    }
    closeModal();
  };

  const columns = useMemo(
    () => [
      { accessorKey: "company", header: "Company" },
      { accessorKey: "role", header: "Role" },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => {
          const row = info.row.original;
          return (
            <select
              value={row.status}
              onChange={(e) => handleStatusChange(row.id, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value="Bookmarked">Bookmarked</option>
              <option value="Applied">Applied</option>
              <option value="Interviewing">Interviewing</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
            </select>
          );
        },
      },
      { accessorKey: "appliedDate", header: "Applied Date" },
      {
        accessorKey: "salary",
        header: "Salary",
        cell: (info) => `$${info.getValue().toLocaleString()}`,
      },
      { accessorKey: "location", header: "Location" },
    ],
    []
  );

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
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search applications..."
          className="px-3 py-2 border border-gray-300 rounded-md text-sm w-64"
        />
        <button
          onClick={openAddModal}
          className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
        >
          <Plus size={16} />
          Add Application
        </button>
      </div>

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
            <tr
              key={row.id}
              onClick={() => openEditModal(row.original)}
              className="border-t hover:bg-gray-50 cursor-pointer"
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-2 text-sm text-gray-800">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingRow ? "Edit Application" : "Add Application"}
      >
        <ApplicationForm
          initialData={editingRow}
          onSubmit={handleFormSubmit}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
}

export default ApplicationTable;