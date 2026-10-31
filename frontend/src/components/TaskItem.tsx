import { useState } from "react";
import TaskForm from "./TaskForm";
import type { Task, TaskPriority, TaskStatus, TaskUpdateInput } from "../types/task";
import { formatDueDate, isOverdue, isUpcoming } from "../utils/taskDeadline";

type TaskItemProps = {
  task: Task;
  onUpdate: (id: string, input: TaskUpdateInput) => Promise<Task>;
  onDelete: (id: string) => Promise<void>;
};

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
];

const priorityOptions: { value: TaskPriority; label: string }[] = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
];

export default function TaskItem({ task, onUpdate, onDelete }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const overdue = isOverdue(task);
  const upcoming = isUpcoming(task);

  async function update(input: TaskUpdateInput) {
    setError(null);
    setIsSaving(true);
    try {
      await onUpdate(task.id, input);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to update task.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    setError(null);
    setIsDeleting(true);
    try {
      await onDelete(task.id);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete this task.");
      setIsDeleting(false);
    }
  }

  if (isEditing) {
    return (
      <li className="task-card task-card-editing">
        <TaskForm
          onCancel={() => setIsEditing(false)}
          onSubmit={async (input) => {
            await onUpdate(task.id, input);
            setIsEditing(false);
          }}
          task={task}
        />
      </li>
    );
  }

  return (
    <li className={`task-card${task.status === "COMPLETED" ? " task-card-completed" : ""}${task.priority === "HIGH" ? " task-card-high" : ""}`}>
      <div className="task-card-copy">
        <h3 className={task.status === "COMPLETED" ? "task-title-completed" : undefined}>{task.title}</h3>
        {task.description && <p>{task.description}</p>}
        <span className={`deadline-badge${overdue ? " deadline-overdue" : upcoming ? " deadline-upcoming" : ""}`}>
          {overdue ? "Overdue" : upcoming ? "Upcoming" : task.dueDate ? "Due" : "No deadline"}
          {task.dueDate && <time dateTime={task.dueDate.slice(0, 10)}>{formatDueDate(task.dueDate)}</time>}
        </span>
        <time dateTime={task.createdAt}>
          Added {new Date(task.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
        </time>
      </div>
      <div className="task-card-controls">
        <label className="task-control">
          <span>Status</span>
          <select
            aria-label={`Status for ${task.title}`}
            disabled={isSaving || isDeleting}
            onChange={(event) => {
              const status = statusOptions.find((option) => option.value === event.target.value)?.value;
              if (status) void update({ status });
            }}
            value={task.status}
          >
            {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label className="task-control">
          <span>Priority</span>
          <select
            aria-label={`Priority for ${task.title}`}
            className={`priority-select priority-${task.priority.toLowerCase()}`}
            disabled={isSaving || isDeleting}
            onChange={(event) => {
              const priority = priorityOptions.find((option) => option.value === event.target.value)?.value;
              if (priority) void update({ priority });
            }}
            value={task.priority}
          >
            {priorityOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <div className="task-card-actions">
          <button className="text-button" disabled={isSaving || isDeleting} onClick={() => setIsEditing(true)} type="button">
            Edit
          </button>
          <button className="text-button text-button-danger" disabled={isDeleting || isSaving} onClick={handleDelete} type="button">
            {isDeleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
      {error && <p className="form-error task-item-error" role="alert">{error}</p>}
    </li>
  );
}
