import React from 'react';
import { Check, Calendar, CheckCheck, Trash2, Edit2 } from 'lucide-react';
import { Task, User, Category } from '../types';

interface TaskCardProps {
  task: Task;
  members: User[];
  categories: Category[];
  onToggle: (taskId: string) => void;
  onUpdateDueDate: (taskId: string, newDate: string | null) => void;
  onUpdateAssignee: (taskId: string, newAssigneeId: string | null) => void;
  onDelete: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  members,
  categories,
  onToggle,
  onUpdateDueDate,
  onUpdateAssignee,
  onDelete,
}) => {
  const category = categories.find((c) => c.id === task.category_id);
  const catName = category?.name || task.category_name || '一般';
  const catIcon = category?.icon || task.category_icon || '📌';

  const assignee = members.find((m) => m.id === task.assignee_id);
  const assigneeName = assignee?.name || task.assignee_name || '未定';
  const assigneeColor = assignee?.avatar_color || task.assignee_color || '#64748b';

  const currentDueDate = task.due_date || task.dueDate || '';

  const handleDelete = () => {
    if (window.confirm(`「${task.title}」を削除してもよろしいですか？`)) {
      onDelete(task.id);
    }
  };

  return (
    <div className="relative pl-12 transition-all duration-200 group/item">
      {/* タイムラインの丸アイコン */}
      {task.is_completed ? (
        <div className="absolute left-4 top-4 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-offset-0 ring-emerald-200/40 flex items-center justify-center text-[10px] text-white font-bold">
          <Check className="w-2.5 h-2.5 stroke-[3]" />
        </div>
      ) : (
        <div className="absolute left-4 top-4 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-500 ring-4 ring-slate-100 dark:ring-slate-800" />
      )}

      {/* タスクカード本文 */}
      <div
        className={`rounded-2xl p-4 border transition-all ${
          task.is_completed
            ? 'task-completed-card shadow-none opacity-85'
            : 'theme-card shadow-sm hover:border-indigo-300'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* 完了チェッカーボタン */}
            <button
              onClick={() => onToggle(task.id)}
              className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition shrink-0 ${
                task.is_completed
                  ? 'border-emerald-600 bg-emerald-600 text-white'
                  : 'border-slate-300 hover:border-indigo-600 text-transparent hover:text-indigo-600'
              }`}
              title={task.is_completed ? '未完了に戻す' : '完了にする'}
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </button>

            {/* タイトル & メタ情報 */}
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-sm break-words ${
                    task.is_completed
                      ? 'line-through text-slate-500 dark:text-slate-400 font-normal'
                      : 'font-semibold'
                  }`}
                >
                  {task.title}
                </span>

                {/* 削除ボタン */}
                <button
                  onClick={handleDelete}
                  className="opacity-0 group-hover/item:opacity-100 text-slate-400 hover:text-red-500 p-1 rounded-lg transition"
                  title="タスクを削除"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* メタ情報バッジ一覧 */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* カテゴリーバッジ */}
                <span className="px-2 py-0.5 rounded-full border text-[11px] font-medium theme-subtle-bg theme-border">
                  {catIcon} {catName}
                </span>

                {/* 担当者バッジ（未完了なら変更可能、完了済みならロック） */}
                {task.is_completed ? (
                  <span
                    className="px-2.5 py-1 rounded-lg border text-[11px] font-medium border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center gap-1.5 select-none opacity-85"
                    title="完了済みのため担当者変更不可（実績ロック）"
                  >
                    <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: assigneeColor }} />
                    <span>{assigneeName}</span>
                  </span>
                ) : (
                  <label
                    className="relative inline-flex items-center group/assignee cursor-pointer select-none active:scale-95 transition-transform"
                    title="タップして担当者を変更"
                  >
                    <span className="px-2.5 py-1 rounded-lg border text-[11px] font-medium border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition group-hover/assignee:border-indigo-400 group-hover/assignee:text-indigo-600 shadow-2xs">
                      <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: assigneeColor }} />
                      <span>{assigneeName}</span>
                      <Edit2 className="w-2.5 h-2.5 opacity-40 group-hover/assignee:opacity-100 transition" />
                    </span>
                    <select
                      value={task.assignee_id || ''}
                      onChange={(e) => onUpdateAssignee(task.id, e.target.value || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full text-base"
                      title="タップして担当者を変更"
                    >
                      <option value="">未定 / 全員</option>
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          👤 {m.name}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {/* 期限または完了日時バッジ */}
                {task.is_completed ? (
                  <span
                    className="task-completed-badge px-2.5 py-1 rounded-lg text-[11px] font-medium border flex items-center gap-1 cursor-default select-none opacity-90"
                    title="完了済みのため期限変更不可（実績ロック）"
                  >
                    <CheckCheck className="w-3 h-3" />
                    <span>
                      実績: {task.completed_by_name ? `${task.completed_by_name}が完了` : '完了'} (
                      {task.completed_at ? task.completed_at.substring(5, 16) : ''})
                    </span>
                  </span>
                ) : (
                  <label
                    className="relative inline-flex items-center group/date cursor-pointer select-none active:scale-95 transition-transform"
                    title="タップして期限を変更（カレンダー入力）"
                    onClick={(e) => {
                      try {
                        const input = (e.currentTarget as HTMLElement).querySelector('input');
                        input?.showPicker();
                      } catch {
                        // ignore
                      }
                    }}
                  >
                    <span className="theme-subtle-bg theme-muted-text px-2.5 py-1 rounded-lg text-[11px] font-medium border theme-border flex items-center gap-1.5 transition group-hover/date:border-indigo-400 group-hover/date:text-indigo-600 shadow-2xs">
                      <Calendar className="w-3 h-3 text-indigo-500/80" />
                      <span>期限: {currentDueDate || '未設定'}</span>
                      <Edit2 className="w-2.5 h-2.5 opacity-40 group-hover/date:opacity-100 transition" />
                    </span>
                    <input
                      type="date"
                      value={currentDueDate}
                      onChange={(e) => onUpdateDueDate(task.id, e.target.value || null)}
                      className="date-picker-input"
                      title="タップして期限を変更"
                    />
                  </label>
                )}

                {/* タグ一覧 */}
                {(task.tags || []).map((tag, idx) => (
                  <span
                    key={idx}
                    className="theme-subtle-bg theme-muted-text px-1.5 py-0.5 rounded text-[10px] border theme-border"
                  >
                    #{tag.replace(/^#/, '')}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
