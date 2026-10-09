import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Category, User } from '../types';

interface TaskFormProps {
  categories: Category[];
  members: User[];
  onAddTask: (params: {
    title: string;
    categoryId?: string;
    assigneeId?: string;
    dueDate?: string;
    tags?: string[];
  }) => Promise<void>;
}

export const TaskForm: React.FC<TaskFormProps> = ({ categories, members, onAddTask }) => {
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [tagsStr, setTagsStr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // カテゴリーがロードされたら初期値を設定
  React.useEffect(() => {
    if (!categoryId && categories.length > 0) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsStr
      ? tagsStr
          .split(',')
          .map((s) => s.trim().replace(/^#/, ''))
          .filter(Boolean)
      : [];

    try {
      setIsSubmitting(true);
      await onAddTask({
        title: title.trim(),
        categoryId: categoryId || undefined,
        assigneeId: assigneeId || undefined,
        dueDate: dueDate || undefined,
        tags,
      });
      setTitle('');
      setTagsStr('');
    } catch (err) {
      console.error(err);
      alert('タスクの作成に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="theme-card rounded-2xl p-4 shadow-sm border mb-6 transition-colors">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="新しいタスクを入力... (例: ダンボールの手配、鍵の受取)"
            required
            className="theme-input flex-1 px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="theme-primary-btn text-white px-5 py-2 font-medium text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> タスク追加
          </button>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {/* カテゴリー選択 */}
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="theme-input px-3 py-1.5 rounded-lg border font-medium"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>

          {/* 担当者選択 */}
          <select
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            className="theme-input px-3 py-1.5 rounded-lg border font-medium"
          >
            <option value="">👥 未定 / 全員</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                👤 担当: {m.name}
              </option>
            ))}
          </select>

          {/* 期限日 */}
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="theme-input px-3 py-1.5 rounded-lg border"
          />

          {/* タグ入力 */}
          <input
            type="text"
            value={tagsStr}
            onChange={(e) => setTagsStr(e.target.value)}
            placeholder="タグ (カンマ区切り: #急ぎ, #費用発生)"
            className="theme-input px-3 py-1.5 rounded-lg border flex-1 min-w-[160px]"
          />
        </div>
      </form>
    </div>
  );
};
