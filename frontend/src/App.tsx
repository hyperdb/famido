import React, { useState } from 'react';
import { useTimelineTodo } from './hooks/useTimelineTodo';
import { Header } from './components/Header';
import { TaskForm } from './components/TaskForm';
import { FilterBar } from './components/FilterBar';
import { Timeline } from './components/Timeline';
import { ProjectModal } from './components/ProjectModal';
import { MemberModal } from './components/MemberModal';
import { User, Project } from './types';

export const App: React.FC = () => {
  const {
    currentProject,
    projects,
    tasks,
    allTasks,
    categories,
    members,
    currentUserId,
    currentTheme,
    isApiConnected,
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
  } = useTimelineTodo();

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<User | null>(null);

  const completedCount = allTasks.filter((t) => t.is_completed).length;

  const handleOpenEditMember = (user: User) => {
    setEditingMember(user);
    setIsMemberModalOpen(true);
  };

  const handleOpenAddMember = () => {
    setEditingMember(null);
    setIsMemberModalOpen(true);
  };

  const handleOpenNewProject = () => {
    setEditingProject(null);
    setIsProjectModalOpen(true);
  };

  const handleOpenEditProject = (project: Project) => {
    setEditingProject(project);
    setIsProjectModalOpen(true);
  };

  return (
    <div className="min-h-screen transition-colors">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <Header
          currentProject={currentProject}
          projects={projects}
          members={members}
          currentUserId={currentUserId}
          currentTheme={currentTheme}
          isApiConnected={isApiConnected}
          totalTasksCount={allTasks.length}
          completedTasksCount={completedCount}
          onSwitchProject={switchProject}
          onOpenNewProjectModal={handleOpenNewProject}
          onOpenEditProjectModal={handleOpenEditProject}
          onOpenAddMemberModal={handleOpenAddMember}
          onOpenEditMemberModal={handleOpenEditMember}
          onChangeCurrentUser={changeCurrentUser}
          onChangeTheme={(t) => applyTheme(t, true)}
        />

        {/* タスク新規追加フォーム */}
        <TaskForm categories={categories} members={members} onAddTask={addTask} />

        {/* フィルターツールバー */}
        <FilterBar
          categories={categories}
          members={members}
          selectedCategory={selectedCategory}
          selectedAssignee={selectedAssignee}
          selectedViewMode={selectedViewMode}
          onSelectCategory={setSelectedCategory}
          onSelectAssignee={setSelectedAssignee}
          onSelectViewMode={setSelectedViewMode}
        />

        {/* タイムライン表示（スマート日付グルーピング付き） */}
        <Timeline
          tasks={tasks}
          members={members}
          categories={categories}
          onToggle={toggleTask}
          onUpdateDueDate={updateTaskDueDate}
          onUpdateAssignee={updateTaskAssignee}
          onDelete={deleteTask}
        />

        {/* プロジェクト作成・編集モーダル */}
        <ProjectModal
          isOpen={isProjectModalOpen}
          initialProject={editingProject}
          onClose={() => {
            setIsProjectModalOpen(false);
            setEditingProject(null);
          }}
          onSubmit={async (title, description, theme) => {
            if (editingProject) {
              await updateProject(editingProject.id, { title, description, theme });
            } else {
              await createProject(title, description, theme);
            }
          }}
        />

        {/* メンバー追加・編集モーダル */}
        <MemberModal
          isOpen={isMemberModalOpen}
          onClose={() => setIsMemberModalOpen(false)}
          editUser={editingMember}
          onSubmit={async (params) => {
            if (params.userId) {
              await updateMember(params);
            } else {
              await addMember(params);
            }
          }}
        />

        {/* トースト通知 */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 dark:border-slate-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
