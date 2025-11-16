import { supabase } from "./supabase";

const TASK_SCHEMA = "tasks";
const BASE_SELECTED_FIELDS = "id, name, description, assigned_to, schedule, priority, duration, completed, due_date, weight";

export interface Task {
  id: string;
  name: string;
  description: string;
  assignedTo: string;
  schedule: string;
  priority: string;
  duration: number;
  completed: boolean;
  dueDate: Date;
  weight: number;
}

export interface TaskFromDB {
  id: string;
  name: string;
  description: string;
  assigned_to: string;
  schedule: string;
  priority: string;
  duration: number;
  completed: boolean;
  due_date: string | null;
  weight: number;
}

// Convert database task to component task
function dbTaskToTask(dbTask: TaskFromDB): Task {
  return {
    id: dbTask.id,
    name: dbTask.name,
    description: dbTask.description,
    assignedTo: dbTask.assigned_to,
    schedule: dbTask.schedule,
    priority: dbTask.priority,
    duration: dbTask.duration,
    completed: dbTask.completed,
    dueDate: dbTask.due_date ? new Date(dbTask.due_date) : new Date(),
    weight: dbTask.weight,
  };
}

// Convert component task to database task
function taskToDbTask(task: Task): Omit<TaskFromDB, 'id'> {
  return {
    name: task.name,
    description: task.description,
    assigned_to: task.assignedTo,
    schedule: task.schedule,
    priority: task.priority,
    duration: task.duration,
    completed: task.completed,
    due_date: task.dueDate.toISOString(),
    weight: task.weight,
  };
}

export async function fetchTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from(TASK_SCHEMA)
    .select(BASE_SELECTED_FIELDS)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data.map(dbTaskToTask);
}

export async function addTask(task: Omit<Task, "id">): Promise<Task> {
  const dbTask = taskToDbTask(task as Task);
  const { data, error } = await supabase
    .from(TASK_SCHEMA)
    .insert([dbTask])
    .select(BASE_SELECTED_FIELDS)
    .single();

  if (error) throw error;
  return dbTaskToTask(data);
}

export async function updateTask(
  id: string,
  updates: Partial<Task>
): Promise<Task> {
  const dbUpdates: Partial<TaskFromDB> = {};

  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.assignedTo !== undefined) dbUpdates.assigned_to = updates.assignedTo;
  if (updates.schedule !== undefined) dbUpdates.schedule = updates.schedule;
  if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
  if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
  if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
  if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate.toISOString();
  if (updates.weight !== undefined) dbUpdates.weight = updates.weight;

  const { data, error } = await supabase
    .from(TASK_SCHEMA)
    .update(dbUpdates)
    .eq("id", id)
    .select(BASE_SELECTED_FIELDS)
    .single();

  if (error) throw error;
  return dbTaskToTask(data);
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from(TASK_SCHEMA).delete().eq("id", id);
  if (error) throw error;
}
