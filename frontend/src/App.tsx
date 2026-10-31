import { useEffect, useState } from "react";

type HealthResponse = {
  ok: boolean;
  service: string;
  database: string;
  timestamp: string;
};

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then(async (response) => {
        const data = (await response.json()) as HealthResponse;
        if (!response.ok) {
          throw new Error(data.database === "disconnected" ? "Database disconnected" : "Health check failed");
        }
        setHealth(data);
      })
      .catch((err: Error) => {
        setError(err.message);
      });
  }, []);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      <p className="text-sm font-semibold tracking-wide text-amber-800">Feature 1 · Project setup</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">TaskFlow</h1>
      <p className="mt-3 text-stone-600">
        AI-powered task management. React, Express, TypeScript, Prisma, and PostgreSQL are wired up.
      </p>

      <section className="mt-10 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium">System status</h2>
        <dl className="mt-4 grid gap-3 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-stone-500">Frontend</dt>
            <dd className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-800">
              localhost:5173
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-stone-500">API health</dt>
            <dd>
              {error ? (
                <span className="rounded-full bg-red-50 px-3 py-1 font-medium text-red-800">{error}</span>
              ) : health ? (
                <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-800">
                  {health.service} · {health.database}
                </span>
              ) : (
                <span className="text-stone-400">Checking…</span>
              )}
            </dd>
          </div>
        </dl>
      </section>
    </main>
  );
}

export default App;
