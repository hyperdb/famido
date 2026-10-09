import React, { useState, useEffect } from 'react';
import { X, UserPlus, UserCheck, Check } from 'lucide-react';
import { User } from '../types';

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  editUser?: User | null; // 編集対象（nullの場合は新規追加）
  onSubmit: (params: { name: string; role: string; avatarColor: string; userId?: string }) => Promise<void>;
}

const AVATAR_COLORS = [
  { value: '#2563eb', label: 'ブルー', bg: 'bg-blue-600' },
  { value: '#ec4899', label: 'ピンク', bg: 'bg-pink-500' },
  { value: '#0d9488', label: 'ティール', bg: 'bg-teal-600' },
  { value: '#9333ea', label: 'パープル', bg: 'bg-purple-600' },
  { value: '#ea580c', label: 'オレンジ', bg: 'bg-orange-600' },
];

export const MemberModal: React.FC<MemberModalProps> = ({
  isOpen,
  onClose,
  editUser,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('member');
  const [avatarColor, setAvatarColor] = useState('#2563eb');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = Boolean(editUser);

  useEffect(() => {
    if (editUser) {
      setName(editUser.name);
      setRole(editUser.role || 'member');
      setAvatarColor(editUser.avatar_color || '#2563eb');
    } else {
      setName('');
      setRole('member');
      setAvatarColor('#2563eb');
    }
  }, [editUser, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);
      await onSubmit({
        name: name.trim(),
        role,
        avatarColor,
        userId: editUser?.id,
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert(isEditMode ? 'メンバー情報の更新に失敗しました' : 'メンバーの追加に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="theme-card w-full max-w-sm rounded-2xl p-6 shadow-2xl border theme-border transition-all animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            {isEditMode ? (
              <>
                <UserCheck className="w-5 h-5 text-indigo-500" /> メンバー情報の編集
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5 text-indigo-500" /> メンバーを追加
              </>
            )}
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
            <label className="block text-xs font-semibold theme-muted-text mb-1">名前 / ニックネーム</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 佐藤、パパ、引越し業者"
              required
              autoFocus
              className="theme-input w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold theme-muted-text mb-1">役割 (権限)</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="theme-input w-full px-3 py-2 rounded-xl border text-xs font-medium"
            >
              <option value="member">メンバー (通常)</option>
              <option value="admin">管理者 (設定・編集)</option>
              {isEditMode && <option value="owner">オーナー (作成者)</option>}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold theme-muted-text mb-1.5">アバターカラー</label>
            <div className="flex items-center gap-3">
              {AVATAR_COLORS.map((c) => (
                <label key={c.value} className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="avatar-color"
                    value={c.value}
                    checked={avatarColor.toLowerCase() === c.value.toLowerCase()}
                    onChange={() => setAvatarColor(c.value)}
                    className="sr-only"
                  />
                  <span
                    className={`w-6 h-6 rounded-full inline-block transition-transform ${c.bg} ${
                      avatarColor.toLowerCase() === c.value.toLowerCase()
                        ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110'
                        : 'opacity-70 hover:opacity-100 hover:scale-105'
                    }`}
                    title={c.label}
                  />
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
              <Check className="w-4 h-4" /> {isEditMode ? '更新する' : '追加する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
