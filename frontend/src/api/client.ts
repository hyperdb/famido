import { Project, ProjectData, Task, User, ThemeType } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8787/api';

export const api = {
  // プロジェクト一覧取得
  async getProjects(): Promise<Project[]> {
    const res = await fetch(`${API_BASE}/projects`);
    if (!res.ok) throw new Error('Failed to fetch projects');
    return res.json();
  },

  // プロジェクト詳細（タスク、メンバー、カテゴリー含む）取得
  async getProjectDetail(projectId: string): Promise<ProjectData> {
    const res = await fetch(`${API_BASE}/projects/${projectId}`);
    if (!res.ok) throw new Error('Failed to fetch project detail');
    return res.json();
  },

  // 新規プロジェクト作成
  async createProject(title: string, description: string, theme: ThemeType, userId: string): Promise<{ success: boolean; projectId: string }> {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, theme, userId }),
    });
    if (!res.ok) throw new Error('Failed to create project');
    return res.json();
  },

  // プロジェクトテーマ更新
  async updateProjectTheme(projectId: string, theme: ThemeType): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/theme`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme }),
    });
    if (!res.ok) throw new Error('Failed to update project theme');
    return res.json();
  },

  // タスク新規作成
  async createTask(params: {
    projectId: string;
    title: string;
    categoryId?: string;
    assigneeId?: string;
    dueDate?: string;
    tags?: string[];
  }): Promise<{ success: boolean; taskId: string }> {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to create task');
    return res.json();
  },

  // タスク完了トグル
  async toggleTask(taskId: string, userId: string): Promise<{
    success: boolean;
    is_completed: boolean;
    completed_at: string | null;
    completed_by_id: string | null;
  }> {
    const res = await fetch(`${API_BASE}/tasks/${taskId}/toggle`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) throw new Error('Failed to toggle task');
    return res.json();
  },

  // タスク期限更新（リスケジュール）
  async updateTaskDueDate(taskId: string, dueDate: string | null): Promise<{ success: boolean; due_date: string | null }> {
    const res = await fetch(`${API_BASE}/tasks/${taskId}/due-date`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dueDate }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update due date');
    }
    return res.json();
  },

  // タスク担当者変更
  async updateTaskAssignee(taskId: string, assigneeId: string | null): Promise<{ success: boolean; assignee_id: string | null }> {
    const res = await fetch(`${API_BASE}/tasks/${taskId}/assignee`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assigneeId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update assignee');
    }
    return res.json();
  },

  // タスク削除
  async deleteTask(taskId: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete task');
    return res.json();
  },

  // メンバー追加
  async addMember(projectId: string, params: { name: string; role: string; avatarColor: string }): Promise<{ success: boolean; user: User }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to add member');
    return res.json();
  },

  // メンバー編集
  async updateMember(userId: string, projectId: string, params: { name: string; role: string; avatarColor: string }): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...params, projectId }),
    });
    if (!res.ok) throw new Error('Failed to update member');
    return res.json();
  },
};
