export interface Task {
  id: string;
  title: string;
  description: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskInput {
  title: string;
  description?: string | null;
}
