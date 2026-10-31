import { useState } from "react";
import TaskForm from "./TaskForm";
import type { Task, TaskInput } from "../types/task";

type TaskItemProps = {
  task: Task;
  onUpdate: (id: string, input: Partial<TaskInput>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export default function TaskItem({ task, onUpdate, onDelete }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <li className="task-card">
      <div className="task-card-copy">
        <h3>{task.title}</h3>
        {task.description && <p>{task.description}</p>}
        <time dateTime={task.createdAt}>
          Added {new Date(task.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
        </time>
      </div>
      <div className="task-card-actions">
        <button className="text-button" onClick={() => setIsEditing(true)} type="button">
          Edit
        </button>
        <button className="text-button text-button-danger" disabled={isDeleting} onClick={handleDelete} type="button">
          {isDeleting ? "Deleting…" : "Delete"}
        </button>
      </div>
      {error && <p className="form-error task-item-error" role="alert">{error}</p>}
    </li>
  );
}
