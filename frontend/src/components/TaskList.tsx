import TaskItem from "./TaskItem";
import type { Task, TaskUpdateInput } from "../types/task";

type TaskListProps = {
  tasks: Task[];
  isLoading: boolean;
  onUpdate: (id: string, input: TaskUpdateInput) => Promise<Task>;
  onDelete: (id: string) => Promise<void>;
};

export default function TaskList({ tasks, isLoading, onUpdate, onDelete }: TaskListProps) {
  if (isLoading) {
    return <p className="loading-message" role="status">Loading your tasks…</p>;
  }

  if (tasks.length === 0) {
    return (
      <div className="task-empty-state">
        <span aria-hidden="true">✦</span>
        <h3>Your list starts here</h3>
        <p>Add a task above to turn your plans into progress.</p>
      </div>
    );
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskItem key={task.id} onDelete={onDelete} onUpdate={onUpdate} task={task} />
      ))}
    </ul>
  );
}
