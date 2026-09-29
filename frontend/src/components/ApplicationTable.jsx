import { useState, useMemo, useEffect} from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import { ArrowUpDown, Plus } from "lucide-react";
import Modal from "./Modal";
import ApplicationForm from "./ApplicationForm";

function ApplicationTable({ accessToken }) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState([true]);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // modal state - tracks whether it's open, and which row (if any) we're editing
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  useEffect(() => {
  const fetchApplications = async () => {
    const res = await fetch("/api/applications", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const result = await res.json();

    if (!res.ok) {
      console.error(result.error?.message || "Failed to load applications");
      setIsLoading(false);
      return;
    }

    setData(result);
    setIsLoading(false);
  };

  fetchApplications();
}, [accessToken]);

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

  const handleFormSubmit = async (formData) => {
    const isEditing = Boolean(editingRow);
    const url = isEditing ? `/api/applications/${editingRow.id}` : "/api/applications";
    const method = isEditing ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(formData),
      });
      const result = await res.json();

      if (!res.ok) {
        alert(result.error?.message || `Failed to ${isEditing ? "update" : "create"} application.`);
        return;
      }

      if (isEditing) {
        setData((prevData) =>
          prevData.map((app) => (app.id === editingRow.id ? result : app))
        );
      } else {
        setData((prevData) => [...prevData, result]);
      }
    }  catch (err) {
      alert("Something went wrong reaching the server.");
      return;
    }

    closeModal();
  };

  const columns = useMemo(
    () => [
      { accessorKey: "company", header: "Company" },
      { accessorKey: "jobTitle", header: "Role" },
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
              <option value="WISHLIST">Bookmarked</option>
              <option value="APPLIED">Applied</option>
              <option value="INTERVIEWING">Interviewing</option>
              <option value="OFFERED">Offer</option>
              <option value="REJECTED">Rejected</option>
            </select>
          );
        },
      },
      {
        accessorKey: "appliedDate",
        header: "Applied Date",
        cell: (info) => {
          const value = info.getValue();
          return value ? new Date(value).toLocaleDateString() : "";
        },
      },
      {
        accessorKey: "salary",
        header: "Salary",
        cell: (info) => {
          const value = info.getValue();
          const num = Number(value);
          // if it's a real number, format it with commas; otherwise just show whatever's there
          return !isNaN(num) && value !== "" ? `$${num.toLocaleString()}` : value;
        },
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

  if (isLoading) {
    return <p className="p-6 text-gray-500">Loading applications...</p>;
  }

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