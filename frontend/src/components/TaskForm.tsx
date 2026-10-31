import { useState, type FormEvent } from "react";
import type { Task, TaskInput } from "../types/task";
import { TaskApiError } from "../services/taskService";

type TaskFormProps = {
  task?: Task;
  onSubmit: (input: TaskInput) => Promise<void>;
  onCancel?: () => void;
};

export default function TaskForm({ task, onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [dueDate, setDueDate] = useState(task?.dueDate?.slice(0, 10) ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Enter a task title.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({
        title: trimmedTitle,
        description: description.trim() || null,
        dueDate: dueDate || null,
      });
      if (!task) {
        setTitle("");
        setDescription("");
        setDueDate("");
      }
    } catch (cause) {
      setError(cause instanceof TaskApiError ? cause.message : "Could not save this task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor={task ? `edit-title-${task.id}` : "new-task-title"}>
        Task title
      </label>
      <input
        autoFocus={Boolean(task)}
        id={task ? `edit-title-${task.id}` : "new-task-title"}
        maxLength={200}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="What needs to get done?"
        required
        value={title}
      />
      <label className="sr-only" htmlFor={task ? `edit-description-${task.id}` : "new-task-description"}>
        Description (optional)
      </label>
      <textarea
        id={task ? `edit-description-${task.id}` : "new-task-description"}
        maxLength={2000}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Add a few details (optional)"
        rows={2}
        value={description}
      />
      <label className="task-date-label" htmlFor={task ? `edit-due-date-${task.id}` : "new-task-due-date"}>
        Due date <span>(optional)</span>
      </label>
      <input
        id={task ? `edit-due-date-${task.id}` : "new-task-due-date"}
        onChange={(event) => setDueDate(event.target.value)}
        type="date"
        value={dueDate}
      />
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="task-form-actions">
        {onCancel && (
          <button className="secondary-button" disabled={isSubmitting} onClick={onCancel} type="button">
            Cancel
          </button>
        )}
        <button className="primary-button task-submit" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Saving…" : task ? "Save changes" : "Add task"}
        </button>
      </div>
    </form>
  );
}
