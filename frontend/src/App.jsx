import { useState, useRef, useCallback } from "react";
import ApplicationTable from "./components/ApplicationTable";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";

function App() {
  // read any saved session once, on first load (null if nothing saved or it's corrupted)
const saved = (() => {
  try {
    return JSON.parse(localStorage.getItem("jobtrack_session"));
  } catch {
    return null;
  }
})();

const [view, setView] = useState(saved ? "app" : "login");
const [user, setUser] = useState(saved?.user ?? null);
const tokensRef = useRef(saved?.tokens ?? null);
// if a refresh is already running, other requests wait on it instead of starting another
const refreshPromise = useRef(null);

// one place that updates state AND saves it, so login/register can't drift apart
const startSession = (user, tokens) => {
  setUser(user);
  setView("app");
  localStorage.setItem("jobtrack_session", JSON.stringify({ user, tokens }));
  tokensRef.current = tokens;
};

  const handleLogin = async (formData) => {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
  const data = await res.json();

  // fetch doesn't throw on a 400, so check it ourselves
  if (!res.ok) throw new Error(data.error.message);

  startSession(data.user, { accessToken: data.accessToken, refreshToken: data.refreshToken });
};
  const handleLogout = useCallback(() => {
  localStorage.removeItem("jobtrack_session");
  tokensRef.current = null;
  setUser(null);
  setView("login");
}, []);

const authFetch = useCallback(async (url, options = {}) => {
  const send = () =>
    fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${tokensRef.current.accessToken}`,
      },
    });

  const res = await send();
  if (res.status !== 401) return res;

  // probably an expired access token - get a new pair, but only one refresh at a time
  if (!refreshPromise.current) {
    refreshPromise.current = fetch("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: tokensRef.current.refreshToken }),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error("refresh failed");
        const newTokens = await r.json();
        tokensRef.current = newTokens;
        const session = JSON.parse(localStorage.getItem("jobtrack_session"));
        localStorage.setItem("jobtrack_session", JSON.stringify({ ...session, tokens: newTokens }));
      })
      .finally(() => {
        refreshPromise.current = null;
      });
  }

  try {
    await refreshPromise.current;
  } catch {
    handleLogout(); // refresh token is dead too, so back to the login screen
    return res;
  }
  return send(); // retry the original request with the new token
}, [handleLogout]);

  const handleRegister = async (formData) => {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
  const data = await res.json();

  // fetch doesn't throw on a 400, so check it ourselves
  if (!res.ok) throw new Error(data.error.message);

  startSession(data.user, { accessToken: data.accessToken, refreshToken: data.refreshToken });
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
    <div className="flex justify-between items-center px-6 pt-6">
      <h1 className="text-2xl font-bold">JobTrack</h1>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">Welcome, {user?.displayName}</span>
        <button
          onClick={handleLogout}
          className="px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50"
        >
          Log out
        </button>
      </div>
    </div>
    <ApplicationTable authFetch={authFetch} />
  </div>
);
}

export default App;