import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { Project, Task, Category, Tag, User, ThemeType, ViewMode } from '../types';

export function useTimelineTodo() {
  const [currentProjectId, setCurrentProjectId] = useState<string>(() => {
    return localStorage.getItem('timeline_current_project') || 'proj_moving';
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem('timeline_current_user') || 'user_taro';
  });

  const [currentTheme, setCurrentTheme] = useState<ThemeType>(() => {
    return (localStorage.getItem('timeline_todo_theme') as ThemeType) || 'indigo';
  });

  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [isApiConnected, setIsApiConnected] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // フィルター状態
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');
  const [selectedViewMode, setSelectedViewMode] = useState<ViewMode>('all');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // テーマ適用
  const applyTheme = useCallback(async (themeName: ThemeType, persistToDb: boolean = true) => {
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('timeline_todo_theme', themeName);
    setCurrentTheme(themeName);

    if (persistToDb && currentProjectId) {
      try {
        await api.updateProjectTheme(currentProjectId, themeName);
      } catch (e) {
        console.error('Failed to persist theme to db', e);
      }
    }
  }, [currentProjectId]);

  // プロジェクト詳細とタスク取得
  const loadProjectData = useCallback(async (projId: string) => {
    try {
      setIsLoading(true);
      const data = await api.getProjectDetail(projId);
      setIsApiConnected(true);
      setCurrentProject(data.project);
      setTasks(data.tasks);
      setCategories(data.categories);
      setTags(data.tags);
      setMembers(data.members);

      // プロジェクト固有テーマを復元
      if (data.project.theme) {
        applyTheme(data.project.theme, false);
      }
    } catch (err) {
      console.warn('API error, falling back:', err);
      setIsApiConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [applyTheme]);

  // プロジェクト一覧取得
  const loadProjects = useCallback(async () => {
    try {
      const list = await api.getProjects();
      setProjects(list);
    } catch (err) {
      console.warn('Failed to load project list', err);
    }
  }, []);

  // 初期ロード
  useEffect(() => {
    loadProjects();
    loadProjectData(currentProjectId);
  }, [currentProjectId, loadProjectData, loadProjects]);

  // プロジェクト切り替え
  const switchProject = (projId: string) => {
    setCurrentProjectId(projId);
    localStorage.setItem('timeline_current_project', projId);
  };

  // 操作ユーザー切り替え
  const changeCurrentUser = (userId: string) => {
    setCurrentUserId(userId);
    localStorage.setItem('timeline_current_user', userId);
    const user = members.find((m) => m.id === userId);
    showToast(`操作ユーザーを「${user?.name || userId}」に切り替えました`);
  };

  // タスク完了トグル
  const toggleTask = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const previousStatus = task.is_completed;
    const currentUser = members.find((m) => m.id === currentUserId) || { name: 'あなた' };
    const now = new Date();
    const formattedDate = `${now.getMonth() + 1}/${now.getDate()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // 楽観的更新
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const newStatus = !t.is_completed;
        return {
          ...t,
          is_completed: newStatus,
          completed_at: newStatus ? formattedDate : null,
          completed_by_name: newStatus ? currentUser.name : null,
        };
      })
    );

    if (isApiConnected) {
      try {
        await api.toggleTask(taskId, currentUserId);
        showToast(previousStatus ? 'タスクを未完了に戻しました' : '🎉 タスクを完了（実績記録）しました！');
        loadProjects(); // 進捗率を更新
      } catch (e) {
        console.error(e);
        // ロールバック
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, is_completed: previousStatus } : t))
        );
      }
    }
  };

  // タスク期限更新（リスケジュール）
  const updateTaskDueDate = async (taskId: string, newDate: string | null) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.is_completed) return;

    const previousDueDate = task.due_date;

    // 楽観的更新
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, due_date: newDate, dueDate: newDate } : t))
    );

    if (isApiConnected) {
      try {
        await api.updateTaskDueDate(taskId, newDate);
        showToast(`期限を ${newDate || '未設定'} にリスケジュールしました`);
      } catch (e) {
        console.error(e);
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, due_date: previousDueDate, dueDate: previousDueDate } : t))
        );
        alert('期限の更新に失敗しました');
      }
    }
  };

  // タスク担当者変更
  const updateTaskAssignee = async (taskId: string, newAssigneeId: string | null) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.is_completed) return;

    const targetMember = members.find((m) => m.id === newAssigneeId);
    const previousAssigneeId = task.assignee_id;
    const previousAssigneeName = task.assignee_name;

    // 楽観的更新
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          assignee_id: newAssigneeId || null,
          assignee_name: targetMember ? targetMember.name : '未定',
          assignee_color: targetMember?.avatar_color || '#64748b',
        };
      })
    );

    if (isApiConnected) {
      try {
        await api.updateTaskAssignee(taskId, newAssigneeId);
        showToast(`担当者を「${targetMember ? targetMember.name : '未定'}」に変更しました`);
      } catch (e) {
        console.error(e);
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? { ...t, assignee_id: previousAssigneeId, assignee_name: previousAssigneeName }
              : t
          )
        );
        alert('担当者の更新に失敗しました');
      }
    }
  };

  // タスク削除
  const deleteTask = async (taskId: string) => {
    const previousTasks = [...tasks];
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    if (isApiConnected) {
      try {
        await api.deleteTask(taskId);
        showToast('タスクを削除しました');
        loadProjects();
      } catch (e) {
        console.error(e);
        setTasks(previousTasks);
        alert('タスクの削除に失敗しました');
      }
    }
  };

  // タスク新規追加
  const addTask = async (params: {
    title: string;
    categoryId?: string;
    assigneeId?: string;
    dueDate?: string;
    tags?: string[];
  }) => {
    if (isApiConnected) {
      await api.createTask({
        ...params,
        projectId: currentProjectId,
      });
      showToast('新しいタスクを追加しました！');
      await loadProjectData(currentProjectId);
      await loadProjects();
    }
  };

  // 新規プロジェクト作成
  const createProject = async (title: string, description: string, theme: ThemeType) => {
    const res = await api.createProject(title, description, theme, currentUserId);
    showToast(`プロジェクト「${title}」を作成しました`);
    await loadProjects();
    switchProject(res.projectId);
  };

  // プロジェクト編集
  const updateProject = async (projectId: string, params: { title: string; description: string; theme: ThemeType }) => {
    await api.updateProject(projectId, params);
    showToast(`プロジェクト「${params.title}」の情報を更新しました`);
    if (params.theme && params.theme !== currentTheme) {
      applyTheme(params.theme);
    }
    await loadProjects();
    await loadProjectData(projectId);
  };

  // メンバー追加
  const addMember = async (params: { name: string; role: string; avatarColor: string }) => {
    await api.addMember(currentProjectId, params);
    showToast(`メンバー「${params.name}」を追加しました`);
    await loadProjectData(currentProjectId);
  };

  // メンバー編集
  const updateMember = async (params: { name: string; role: string; avatarColor: string; userId?: string }) => {
    if (!params.userId) return;
    await api.updateMember(params.userId, currentProjectId, params);
    showToast(`メンバー「${params.name}」の情報を更新しました`);
    await loadProjectData(currentProjectId);
  };

  // フィルタリング後のタスク一覧
  const filteredTasks = tasks.filter((t) => {
    const cat = categories.find((c) => c.id === t.category_id);
    const catName = cat?.name || t.category_name;
    const assignee = members.find((m) => m.id === t.assignee_id);
    const assignName = assignee?.name || t.assignee_name;

    if (selectedCategory !== 'all' && catName !== selectedCategory) return false;
    if (selectedAssignee !== 'all' && assignName !== selectedAssignee && assignName !== '全員') return false;
    if (selectedViewMode === 'active-only' && t.is_completed) return false;
    if (selectedViewMode === 'completed-only' && !t.is_completed) return false;
    return true;
  });

  return {
    currentProject,
    projects,
    tasks: filteredTasks,
    allTasks: tasks,
    categories,
    tags,
    members,
    currentUserId,
    currentTheme,
    isApiConnected,
    isLoading,
    toastMessage,
    selectedCategory,
    selectedAssignee,
    selectedViewMode,
    setSelectedCategory,
    setSelectedAssignee,
    setSelectedViewMode,
    switchProject,
    changeCurrentUser,
    applyTheme,
    toggleTask,
    updateTaskDueDate,
    updateTaskAssignee,
    deleteTask,
    addTask,
    createProject,
    updateProject,
    addMember,
    updateMember,
  };
}
