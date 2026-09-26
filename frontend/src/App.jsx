import { useState } from "react";
import ApplicationTable from "./components/ApplicationTable";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";

function App() {
  // "login" | "register" | "app" - simple manual routing until we add React Router
  const [view, setView] = useState("login");

  const handleLogin = (formData) => {
    console.log("Login submitted:", formData);
    // later: call James's /api/login endpoint here, store the JWT, then:
    setView("app");
  };

  const handleRegister = (formData) => {
    console.log("Register submitted:", formData);
    // later: call James's /api/register endpoint here
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