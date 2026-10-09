import React, { useState } from 'react';
import { X, FolderPlus, Check } from 'lucide-react';
import { ThemeType } from '../types';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, description: string, theme: ThemeType) => Promise<void>;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [theme, setTheme] = useState<ThemeType>('indigo');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setIsSubmitting(true);
      await onCreate(title.trim(), description.trim(), theme);
      setTitle('');
      setDescription('');
      setTheme('indigo');
      onClose();
    } catch (err) {
      console.error(err);
      alert('プロジェクトの作成に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="theme-card w-full max-w-md rounded-2xl p-6 shadow-2xl border theme-border transition-all animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-indigo-500" /> 新規プロジェクト作成
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center theme-muted-text transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold theme-muted-text mb-1">プロジェクト名</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: ✈️ 年末の家族旅行、💻 新規事業"
              required
              autoFocus
              className="theme-input w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold theme-muted-text mb-1">説明 (任意)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="プロジェクトの目的や概要"
              className="theme-input w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold theme-muted-text mb-1.5">テーマカラー</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: 'indigo', label: '🔵 インディゴ' },
                { id: 'amber', label: '🟠 アンバー' },
                { id: 'emerald', label: '🟢 グリーン' },
                { id: 'rose', label: '🌸 ローズ' },
              ].map((t) => (
                <label
                  key={t.id}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition ${
                    theme === t.id
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 font-semibold'
                      : 'theme-border hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <input
                    type="radio"
                    name="project-theme"
                    value={t.id}
                    checked={theme === t.id}
                    onChange={() => setTheme(t.id as ThemeType)}
                    className="accent-indigo-600"
                  />
                  <span>{t.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="theme-primary-btn text-white px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Check className="w-4 h-4" /> 作成して開く
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
