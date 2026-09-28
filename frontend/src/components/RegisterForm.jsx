import { useState } from "react";

function RegisterForm({ onSubmit, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  if (!formData.email || !formData.displayName || !formData.password || !formData.confirmPassword) {
    setError("Please fill in all fields.");
    return;
  }

  // James's backend rejects anything under 8, so catch it here first
  if (formData.password.length < 8) {
    setError("Password must be at least 8 characters.");
    return;
  }

  if (formData.password !== formData.confirmPassword) {
    setError("Passwords do not match.");
    return;
  }

  try {
    await onSubmit({
      email: formData.email,
      displayName: formData.displayName,
      password: formData.password,
    });
  } catch (err) {
    setError(err.message); // shows the backend's message, like "This email is already registered."
  }
};

  return (
    <div
  className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
  style={{ backgroundImage: "url('/quad.jpg')" }}
>
  <div className="absolute inset-0 bg-black/40"></div>
  <div className="bg-white rounded-lg shadow-md w-full max-w-sm p-6 relative z-10">
        <h1 className="text-xl font-semibold mb-4">Create your JobTrack account</h1>

        {error && (
          <p className="text-sm text-red-600 mb-3">{error}</p>
        )}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Display Name</label>
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
            />
        </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
            />
          </div>

          <button
            type="submit"
            className="mt-2 bg-blue-600 text-white rounded px-3 py-2 text-sm hover:bg-blue-700"
          >
            Create Account
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-4 text-center">
          Already have an account?{" "}
          <button
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:underline"
          >
            Log In
          </button>
        </p>
      </div>
    </div>
  );
}

export default RegisterForm;