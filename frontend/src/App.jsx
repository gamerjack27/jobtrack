import { useState } from "react";
import ApplicationTable from "./components/ApplicationTable";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";

function App() {
  // "login" | "register" | "app" - simple manual routing until we add React Router
  const [view, setView] = useState("login");
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState(null);

  const handleLogin = async (formData) => {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
  const data = await res.json();

  // fetch doesn't throw on a 400, so check it ourselves
  if (!res.ok) throw new Error(data.error.message);

  setUser(data.user);
  setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  setView("app");
};

  const handleRegister = async (formData) => {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
  const data = await res.json();

  // fetch doesn't throw on a 400, so check it ourselves
  if (!res.ok) throw new Error(data.error.message);

  setUser(data.user);
  setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  setView("app");
};

  if (view === "login") {
    return (
      <LoginForm
        onSubmit={handleLogin}
        onSwitchToRegister={() => setView("register")}
      />
    );
  }

  if (view === "register") {
    return (
      <RegisterForm
        onSubmit={handleRegister}
        onSwitchToLogin={() => setView("login")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <h1 className="text-2xl font-bold px-6 pt-6">JobTrack</h1>
      <ApplicationTable />
    </div>
  );
}

export default App;