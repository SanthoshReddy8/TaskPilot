import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setError(null);
    setIsLoggingOut(true);
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch {
      setError("Could not log out. Check your connection and try again.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <Link className="brand" to="/dashboard">
          <span className="brand-mark" aria-hidden="true">T</span>
          <span>taskflow</span>
        </Link>
        <button className="secondary-button" disabled={isLoggingOut} onClick={handleLogout} type="button">
          {isLoggingOut ? "Signing out…" : "Sign out"}
        </button>
      </header>
      <section className="dashboard-content">
        <p className="eyebrow">YOUR WORKSPACE</p>
        <h1>Good to have you here, {user?.name}.</h1>
        <p className="auth-description">
          Your account is ready. Task management features are coming next.
        </p>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="placeholder-card">
          <span className="placeholder-icon" aria-hidden="true">✦</span>
          <div>
            <h2>A clear path starts here</h2>
            <p>Your tasks and plans will live here. For now, your workspace is ready to go.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
