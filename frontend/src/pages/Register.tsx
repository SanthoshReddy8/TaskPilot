import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { AuthApiError } from "../services/authService";

export default function Register() {
  const { user, isLoading, register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
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
      await register(name, email, password);
      navigate("/dashboard", { replace: true });
    } catch (cause) {
      setError(cause instanceof AuthApiError ? cause.message : "Unable to connect. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="auth-card" aria-labelledby="register-title">
        <Link className="brand" to="/" aria-label="TaskFlow home">
          <span className="brand-mark" aria-hidden="true">T</span>
          <span>taskflow</span>
        </Link>
        <p className="eyebrow">GET STARTED</p>
        <h1 id="register-title">Make space for your best work</h1>
        <p className="auth-description">Create an account to organize what matters, one task at a time.</p>

        {error && <p className="form-error" role="alert">{error}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="name">Your name</label>
          <input
            autoComplete="name"
            id="name"
            maxLength={80}
            onChange={(event) => setName(event.target.value)}
            required
            value={name}
          />
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
            autoComplete="new-password"
            id="password"
            maxLength={72}
            minLength={12}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
          <p className="field-hint">Use at least 12 characters.</p>
          <button className="primary-button" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
