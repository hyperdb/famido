export type ThemeType = 'indigo' | 'amber' | 'emerald' | 'rose' | 'dark';

export interface User {
  id: string;
  name: string;
  email?: string | null;
  avatar_color: string;
  role?: string;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  theme: ThemeType;
  created_at?: string;
  task_count?: number;
  completed_task_count?: number;
}

export interface Category {
  id: string;
  project_id: string;
  name: string;
  icon: string;
  color_badge: string;
  sort_order: number;
}

export interface Tag {
  id: string;
  project_id: string;
  name: string;
}

export interface Task {
  id: string;
  project_id: string;
  category_id?: string | null;
  assignee_id?: string | null;
  title: string;
  description?: string | null;
  is_completed: boolean;
  completed_at?: string | null;
  completed_by_id?: string | null;
  completed_by_name?: string | null;
  due_date?: string | null;
  dueDate?: string | null; // 後方互換
  created_at?: string;
  category_name?: string;
  category_icon?: string;
  category_color?: string;
  assignee_name?: string;
  assignee_color?: string;
  tags: string[];
}

export interface ProjectData {
  project: Project;
  members: User[];
  categories: Category[];
  tags: Tag[];
  tasks: Task[];
}

export type ViewMode = 'all' | 'active-only' | 'completed-only';
