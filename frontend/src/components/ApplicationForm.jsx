import { useState, useEffect } from "react";

const emptyForm = {
  company: "",
  jobTitle: "",
  status: "WISHLIST",
  appliedDate: "",
  salary: "",
  location: "",
};

function ApplicationForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(emptyForm);

  // if we're editing an existing row, pre-fill the form with its data
  useEffect(() => {
    if (initialData) {
      setFormData({
        company: initialData.company || "",
        jobTitle: initialData.jobTitle || "",
        status: initialData.status || "WISHLIST",
        // the date input needs YYYY-MM-DD, but the server sends a full timestamp
        appliedDate: initialData.appliedDate ? initialData.appliedDate.slice(0, 10) : "",
        salary: initialData.salary || "",
        location: initialData.location || "",
      });
    } else {
      setFormData(emptyForm);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
  e.preventDefault();
  onSubmit({
    ...formData,
    // the date input gives back YYYY-MM-DD, but the server needs a full ISO timestamp
    appliedDate: formData.appliedDate
      ? new Date(formData.appliedDate).toISOString()
      : undefined,
  });
};

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div>
        <label className="block text-sm font-medium text-gray-700">Company</label>
        <input
          name="company"
          value={formData.company}
          onChange={handleChange}
          required
          className="mt-1 w-full border border-gray-300 rounded px-2 py-1 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Role</label>
        <input
          name="jobTitle"
          value={formData.jobTitle}
          onChange={handleChange}
          required
          className="mt-1 w-full border border-gray-300 rounded px-2 py-1 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="mt-1 w-full border border-gray-300 rounded px-2 py-1 text-sm"
        >
          <option value="WISHLIST">Bookmarked</option>
          <option value="APPLIED">Applied</option>
          <option value="INTERVIEWING">Interviewing</option>
          <option value="OFFERED">Offer</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Applied Date</label>
        <input
          type="date"
          name="appliedDate"
          value={formData.appliedDate}
          onChange={handleChange}
          required
          className="mt-1 w-full border border-gray-300 rounded px-2 py-1 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Salary</label>
        <input
          type="number"
          name="salary"
          value={formData.salary}
          onChange={handleChange}
          className="mt-1 w-full border border-gray-300 rounded px-2 py-1 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Location</label>
        <input
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="mt-1 w-full border border-gray-300 rounded px-2 py-1 text-sm"
        />
      </div>

      <div className="flex justify-end gap-2 mt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Save
        </button>
      </div>
    </form>
  );
}

export default ApplicationForm;