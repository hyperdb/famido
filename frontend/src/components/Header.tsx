import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, Palette, Moon, User as UserIcon, FolderOpen, CheckCircle2, Edit2 } from 'lucide-react';
import { Project, User, ThemeType } from '../types';

interface HeaderProps {
  currentProject: Project | null;
  projects: Project[];
  members: User[];
  currentUserId: string;
  currentTheme: ThemeType;
  isApiConnected: boolean;
  totalTasksCount: number;
  completedTasksCount: number;
  onSwitchProject: (projectId: string) => void;
  onOpenNewProjectModal: () => void;
  onOpenEditProjectModal: (project: Project) => void;
  onOpenAddMemberModal: () => void;
  onOpenEditMemberModal: (user: User) => void;
  onChangeCurrentUser: (userId: string) => void;
  onChangeTheme: (theme: ThemeType) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentProject,
  projects,
  members,
  currentUserId,
  currentTheme,
  isApiConnected,
  totalTasksCount,
  completedTasksCount,
  onSwitchProject,
  onOpenNewProjectModal,
  onOpenEditProjectModal,
  onOpenAddMemberModal,
  onOpenEditMemberModal,
  onChangeCurrentUser,
  onChangeTheme,
}) => {
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 外部クリックでドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsProjectDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const progressPercent =
    totalTasksCount === 0 ? 0 : Math.round((completedTasksCount / totalTasksCount) * 100);

  return (
    <header className="theme-card rounded-2xl p-6 shadow-sm border mb-6 transition-colors">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* プロジェクトタイトル & 切り替えドロップダウン */}
        <div className="relative" ref={dropdownRef}>
          <div className="flex items-center gap-2">
            <span className="theme-primary-badge px-2.5 py-0.5 rounded-full text-xs font-semibold border">
              プロジェクト
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                className="flex items-center gap-2 text-2xl font-bold hover:opacity-85 transition group text-left px-2 py-1 -ml-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60"
              >
                <span>{currentProject?.title || '読み込み中...'}</span>
                <ChevronDown
                  className={`w-5 h-5 opacity-50 group-hover:opacity-100 transition-transform duration-200 ${
                    isProjectDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {currentProject && (
                <button
                  onClick={() => onOpenEditProjectModal(currentProject)}
                  className="p-1.5 rounded-xl opacity-60 hover:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition text-slate-600 dark:text-slate-300"
                  title="プロジェクト名を編集"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 mt-1.5 text-xs">
            {isApiConnected ? (
              <span className="px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Cloudflare D1 接続済
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                ローカルスタンドアロン
              </span>
            )}
            <span className="theme-muted-text">完了タスクもタイムライン上に履歴として保持されます</span>
          </div>

          {/* プロジェクト切り替えドロップダウン */}
          {isProjectDropdownOpen && (
            <div className="absolute left-0 top-full mt-2 w-80 sm:w-96 theme-card rounded-2xl shadow-xl border theme-border z-50 p-2 transition-all animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 text-xs font-semibold theme-muted-text flex items-center justify-between border-b theme-border mb-1">
                <span className="flex items-center gap-1.5">
                  <FolderOpen className="w-3.5 h-3.5" /> プロジェクト一覧
                </span>
                <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px]">
                  {projects.length}件
                </span>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-1 py-1">
                {projects.map((p) => {
                  const isCurrent = p.id === currentProject?.id;
                  const total = p.task_count || 0;
                  const completed = p.completed_task_count || 0;
                  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        onSwitchProject(p.id);
                        setIsProjectDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl transition flex items-center justify-between gap-3 ${
                        isCurrent
                          ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 font-bold text-xs truncate">
                          <span>{p.title}</span>
                          {isCurrent && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-20 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[10px] theme-muted-text">
                            {completed}/{total} 完了 ({pct}%)
                          </span>
                        </div>
                      </div>
                      {isCurrent && (
                        <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60">
                          選択中
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t theme-border mt-1 space-y-1">
                {currentProject && (
                  <button
                    onClick={() => {
                      setIsProjectDropdownOpen(false);
                      onOpenEditProjectModal(currentProject);
                    }}
                    className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-2 theme-muted-text hover:text-slate-900 dark:hover:text-slate-100 transition"
                  >
                    <Edit2 className="w-4 h-4" /> プロジェクト設定・編集...
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsProjectDropdownOpen(false);
                    onOpenNewProjectModal();
                  }}
                  className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-2 text-indigo-600 dark:text-indigo-400 transition"
                >
                  <Plus className="w-4 h-4" /> 新規プロジェクトを作成...
                </button>
              </div>
            </div>
          )}
        </div>

        {/* コントロールエリア（操作者、テーマ、メンバー、進捗） */}
        <div className="flex flex-wrap items-center gap-4">
          {/* 操作者セレクター（ログイン擬似切り替え） */}
          <div
            className="flex items-center gap-1.5 bg-slate-100/70 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-xl border theme-border"
            title="現在操作しているユーザー（完了実績の記録者になります）"
          >
            <span className="text-xs theme-muted-text flex items-center gap-1 font-medium">
              <UserIcon className="w-3.5 h-3.5" /> あなた:
            </span>
            <select
              value={currentUserId}
              onChange={(e) => onChangeCurrentUser(e.target.value)}
              className="bg-transparent text-xs font-bold theme-input border-0 focus:ring-0 p-0 cursor-pointer"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* テーマセレクター */}
          <div className="flex items-center gap-2 bg-slate-100/70 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border theme-border">
            <span className="text-xs theme-muted-text flex items-center gap-1 font-medium">
              <Palette className="w-3.5 h-3.5" /> テーマ:
            </span>
            <div className="flex items-center gap-1.5">
              {[
                { id: 'indigo', title: 'モダンインディゴ', bg: 'bg-indigo-600' },
                { id: 'amber', title: 'ウォームアンバー', bg: 'bg-amber-500' },
                { id: 'emerald', title: 'フォレストグリーン', bg: 'bg-emerald-600' },
                { id: 'rose', title: 'ブロッサムローズ', bg: 'bg-rose-500' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => onChangeTheme(t.id as ThemeType)}
                  title={t.title}
                  className={`w-5 h-5 rounded-full ${t.bg} transition-transform hover:scale-110 ${
                    currentTheme === t.id ? 'ring-2 ring-offset-2 ring-indigo-400 scale-105' : ''
                  }`}
                />
              ))}
              <button
                onClick={() => onChangeTheme('dark')}
                title="ダークモード"
                className={`w-5 h-5 rounded-full bg-slate-900 border border-slate-600 hover:scale-110 transition-transform flex items-center justify-center text-[10px] text-yellow-400 ${
                  currentTheme === 'dark' ? 'ring-2 ring-offset-2 ring-indigo-400 scale-105' : ''
                }`}
              >
                <Moon className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* メンバーアバター一覧 */}
          <div className="flex items-center -space-x-2">
            {members.map((m) => (
              <button
                key={m.id}
                onClick={() => onOpenEditMemberModal(m)}
                className="w-9 h-9 rounded-full text-white flex items-center justify-center font-bold text-xs ring-2 ring-white dark:ring-slate-900 shadow-sm hover:scale-110 hover:ring-indigo-300 transition-all cursor-pointer"
                style={{ backgroundColor: m.avatar_color || '#4f46e5' }}
                title={`${m.name} (${m.role}) - クリックして編集`}
              >
                {m.name.slice(0, 2)}
              </button>
            ))}
            <button
              onClick={onOpenAddMemberModal}
              className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs ring-2 ring-white dark:ring-slate-900 hover:bg-indigo-600 hover:text-white transition shadow-sm"
              title="メンバーを追加"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* 進捗バー */}
          <div className="text-right">
            <div className="text-xs font-semibold theme-muted-text mb-1">
              進捗状況 ({completedTasksCount}/{totalTasksCount} 完了)
            </div>
            <div className="w-28 bg-slate-200/70 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
