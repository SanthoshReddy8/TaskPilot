import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { AuthApiError } from "../services/authService";

type RedirectState = {
  from?: {
    pathname?: string;
  };
};

export default function Login() {
  const { user, isLoading, authError, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) {
    return <main className="page-shell"><p className="loading-message">Checking your session…</p></main>;
  }
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      const state = location.state as RedirectState | null;
      navigate(state?.from?.pathname || "/dashboard", { replace: true });
    } catch (cause) {
      setError(cause instanceof AuthApiError ? cause.message : "Unable to connect. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="auth-card" aria-labelledby="login-title">
        <Link className="brand" to="/" aria-label="TaskFlow home">
          <span className="brand-mark" aria-hidden="true">T</span>
          <span>taskflow</span>
        </Link>
        <p className="eyebrow">WELCOME BACK</p>
        <h1 id="login-title">Sign in to your account</h1>
        <p className="auth-description">Pick up where you left off and keep your day moving.</p>

        {(error || authError) && (
          <p className="form-error" role="alert">{error || authError}</p>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email address</label>
          <input
            autoComplete="email"
            id="email"
            maxLength={254}
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
          <label htmlFor="password">Password</label>
          <input
            autoComplete="current-password"
            id="password"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
          <button className="primary-button" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="auth-footer">
          New to TaskFlow? <Link to="/register">Create an account</Link>
        </p>
      </section>
    </main>
  );
}
