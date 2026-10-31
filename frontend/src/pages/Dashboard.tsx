import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";
import { useAuth } from "../context/useAuth";
import { taskService } from "../services/taskService";
import type { Task, TaskInput, TaskUpdateInput } from "../types/task";
import { isOverdue, isUpcoming, sortByDeadline } from "../utils/taskDeadline";

type DeadlineFilter = "all" | "overdue" | "upcoming";
type TaskSort = "deadline" | "newest";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [tasksError, setTasksError] = useState<string | null>(null);
  const [deadlineFilter, setDeadlineFilter] = useState<DeadlineFilter>("all");
  const [taskSort, setTaskSort] = useState<TaskSort>("deadline");
  const [error, setError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const fetchTasks = useCallback(() => taskService.getAll(), []);
  const overdueCount = tasks.filter((task) => isOverdue(task)).length;
  const upcomingCount = tasks.filter((task) => isUpcoming(task)).length;
  const visibleTasks = useMemo(() => {
    const filtered = tasks.filter((task) => {
      if (deadlineFilter === "overdue") return isOverdue(task);
      if (deadlineFilter === "upcoming") return isUpcoming(task);
      return true;
    });

    if (taskSort === "deadline") {
      return sortByDeadline(filtered);
    }
    return [...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [deadlineFilter, taskSort, tasks]);

  useEffect(() => {
    let active = true;
    fetchTasks()
      .then((result) => {
        if (active) {
          setTasks(result);
        }
      })
      .catch((cause: unknown) => {
        if (active) {
          setTasksError(cause instanceof Error ? cause.message : "Could not load your tasks.");
        }
      })
      .finally(() => {
        if (active) {
          setIsLoadingTasks(false);
        }
      });

    return () => {
      active = false;
    };
  }, [fetchTasks]);

  async function loadTasks() {
    setTasksError(null);
    setIsLoadingTasks(true);
    try {
      setTasks(await fetchTasks());
    } catch (cause) {
      setTasksError(cause instanceof Error ? cause.message : "Could not load your tasks.");
    } finally {
      setIsLoadingTasks(false);
    }
  }

  async function handleCreate(input: TaskInput) {
    const task = await taskService.create(input);
    setTasks((currentTasks) => [task, ...currentTasks]);
  }

  async function handleUpdate(id: string, input: TaskUpdateInput): Promise<Task> {
    const updatedTask = await taskService.update(id, input);
    setTasks((currentTasks) => currentTasks.map((task) => task.id === id ? updatedTask : task));
    return updatedTask;
  }

  async function handleDelete(id: string) {
    await taskService.remove(id);
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== id));
  }

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
          One step at a time. Keep track of what matters today.
        </p>
        {error && <p className="form-error" role="alert">{error}</p>}
        <section className="tasks-section" aria-labelledby="tasks-heading">
          <div className="tasks-heading-row">
            <div>
              <p className="eyebrow">YOUR TASKS</p>
              <h2 id="tasks-heading">Make room for what matters</h2>
            </div>
            <span className="task-count">{tasks.length} {tasks.length === 1 ? "task" : "tasks"}</span>
          </div>
          <div className="deadline-summary" aria-label="Deadline summary">
            <span><strong>{overdueCount}</strong> overdue</span>
            <span><strong>{upcomingCount}</strong> due in the next 7 days</span>
          </div>
          <div className="task-view-controls">
            <label>
              <span>Show</span>
              <select value={deadlineFilter} onChange={(event) => setDeadlineFilter(event.target.value as DeadlineFilter)}>
                <option value="all">All tasks</option>
                <option value="overdue">Overdue</option>
                <option value="upcoming">Upcoming</option>
              </select>
            </label>
            <label>
              <span>Sort by</span>
              <select value={taskSort} onChange={(event) => setTaskSort(event.target.value as TaskSort)}>
                <option value="deadline">Earliest deadline</option>
                <option value="newest">Recently added</option>
              </select>
            </label>
          </div>
          <TaskForm onSubmit={handleCreate} />
          {tasksError ? (
            <div className="task-load-error">
              <p className="form-error" role="alert">{tasksError}</p>
              <button className="text-button" onClick={() => void loadTasks()} type="button">
                Try again
              </button>
            </div>
          ) : (
            <TaskList
              emptyMessage={deadlineFilter === "all" ? undefined : `No ${deadlineFilter} tasks right now.`}
              emptyTitle={deadlineFilter === "all" ? undefined : "Nothing to show"}
              isLoading={isLoadingTasks}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
              tasks={visibleTasks}
            />
          )}
        </section>
      </section>
    </main>
  );
}
