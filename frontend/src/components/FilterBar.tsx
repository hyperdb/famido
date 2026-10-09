import React from 'react';
import { Filter } from 'lucide-react';
import { Category, User, ViewMode } from '../types';

interface FilterBarProps {
  categories: Category[];
  members: User[];
  selectedCategory: string;
  selectedAssignee: string;
  selectedViewMode: ViewMode;
  onSelectCategory: (catName: string) => void;
  onSelectAssignee: (assigneeName: string) => void;
  onSelectViewMode: (mode: ViewMode) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  categories,
  members,
  selectedCategory,
  selectedAssignee,
  selectedViewMode,
  onSelectCategory,
  onSelectAssignee,
  onSelectViewMode,
}) => {
  return (
    <div className="theme-card flex flex-wrap items-center justify-between gap-3 mb-6 p-3 rounded-xl border text-xs transition-colors">
      {/* カテゴリー絞り込みボタン群 */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold theme-muted-text mr-1 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> 絞り込み:
        </span>
        <button
          onClick={() => onSelectCategory('all')}
          className={`filter-cat-btn px-2.5 py-1 rounded-lg transition ${
            selectedCategory === 'all'
              ? 'theme-primary-badge font-semibold border'
              : 'theme-muted-text hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          すべて
        </button>
        {categories.map((c) => {
          const isActive = selectedCategory === c.name;
          return (
            <button
              key={c.id}
              onClick={() => onSelectCategory(c.name)}
              className={`filter-cat-btn px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
                isActive
                  ? 'theme-primary-badge font-semibold border'
                  : 'theme-muted-text hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{c.icon}</span>
              <span>{c.name}</span>
            </button>
          );
        })}
      </div>

      {/* 担当者 & 表示モード ドロップダウン */}
      <div className="flex items-center gap-2">
        {/* 担当者フィルター */}
        <select
          value={selectedAssignee}
          onChange={(e) => onSelectAssignee(e.target.value)}
          className="theme-input px-2.5 py-1 rounded-lg border font-medium text-xs"
        >
          <option value="all">担当者: 全員</option>
          {members.map((m) => (
            <option key={m.id} value={m.name}>
              {m.name}
            </option>
          ))}
        </select>

        {/* 表示切替 */}
        <select
          value={selectedViewMode}
          onChange={(e) => onSelectViewMode(e.target.value as ViewMode)}
          className="theme-input px-2.5 py-1 rounded-lg border font-medium text-xs"
        >
          <option value="all">表示: タイムライン (完了履歴含む)</option>
          <option value="active-only">未完了タスクのみ</option>
          <option value="completed-only">完了実績ログのみ</option>
        </select>
      </div>
    </div>
  );
};
