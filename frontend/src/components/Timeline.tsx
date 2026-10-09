import React from 'react';
import { FolderOpen, Calendar, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Task, User, Category } from '../types';
import { TaskCard } from './TaskCard';

interface TimelineProps {
  tasks: Task[];
  members: User[];
  categories: Category[];
  onToggle: (taskId: string) => void;
  onUpdateDueDate: (taskId: string, newDate: string | null) => void;
  onUpdateAssignee: (taskId: string, newAssigneeId: string | null) => void;
  onDelete: (taskId: string) => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  tasks,
  members,
  categories,
  onToggle,
  onUpdateDueDate,
  onUpdateAssignee,
  onDelete,
}) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-16 theme-muted-text text-sm">
        <FolderOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
        条件に一致するタスクはありません
      </div>
    );
  }

  // 今日の日付文字列（YYYY-MM-DD）
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  // タスクを日付・ステータス別にグルーピング
  const overdueTasks: Task[] = [];
  const todayTasks: Task[] = [];
  const tomorrowTasks: Task[] = [];
  const upcomingTasks: Task[] = [];
  const noDueDateTasks: Task[] = [];
  const completedTasks: Task[] = [];

  tasks.forEach((t) => {
    if (t.is_completed) {
      completedTasks.push(t);
      return;
    }

    const dueDate = t.due_date || t.dueDate;
    if (!dueDate) {
      noDueDateTasks.push(t);
    } else if (dueDate < todayStr) {
      overdueTasks.push(t);
    } else if (dueDate === todayStr) {
      todayTasks.push(t);
    } else if (dueDate === tomorrowStr) {
      tomorrowTasks.push(t);
    } else {
      upcomingTasks.push(t);
    }
  });

  const sections = [
    {
      id: 'overdue',
      title: '期限切れ',
      icon: <AlertCircle className="w-4 h-4 text-red-500" />,
      badgeClass: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/40 dark:border-red-900 dark:text-red-400',
      tasks: overdueTasks,
    },
    {
      id: 'today',
      title: '今日',
      icon: <Clock className="w-4 h-4 text-amber-500" />,
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-400',
      tasks: todayTasks,
    },
    {
      id: 'tomorrow',
      title: '明日',
      icon: <Calendar className="w-4 h-4 text-blue-500" />,
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:border-blue-900 dark:text-blue-400',
      tasks: tomorrowTasks,
    },
    {
      id: 'upcoming',
      title: '今後の予定',
      icon: <Calendar className="w-4 h-4 text-indigo-500" />,
      badgeClass: 'theme-primary-badge',
      tasks: upcomingTasks,
    },
    {
      id: 'no_due',
      title: '期限未設定',
      icon: <Calendar className="w-4 h-4 opacity-50" />,
      badgeClass: 'theme-subtle-bg theme-muted-text border theme-border',
      tasks: noDueDateTasks,
    },
    {
      id: 'completed',
      title: '完了した実績ログ（履歴）',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-400',
      tasks: completedTasks,
    },
  ].filter((sec) => sec.tasks.length > 0);

  return (
    <div className="relative">
      {/* タイムラインの縦線 */}
      <div className="theme-timeline-line absolute left-6 top-3 bottom-3 w-0.5" />

      <div className="space-y-8">
        {sections.map((section) => (
          <div key={section.id} className="space-y-3">
            {/* セクションヘッダー */}
            <div className="relative pl-12 flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 shadow-2xs ${section.badgeClass}`}
              >
                {section.icon}
                <span>{section.title}</span>
                <span className="opacity-70 text-[10px]">({section.tasks.length})</span>
              </span>
            </div>

            {/* セクション内のタスクカード群 */}
            <div className="space-y-3">
              {section.tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  members={members}
                  categories={categories}
                  onToggle={onToggle}
                  onUpdateDueDate={onUpdateDueDate}
                  onUpdateAssignee={onUpdateAssignee}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
