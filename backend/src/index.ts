import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// CORS 有効化（フロントエンドからのアクセスを許可）
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// ヘルスチェック
app.get('/', (c) => {
  return c.json({ status: 'ok', message: 'Timeline Todo API is running' });
});

// プロジェクト一覧取得（進捗付き）
app.get('/api/projects', async (c) => {
  const { results: projects } = await c.env.DB.prepare(`
    SELECT 
      p.*,
      COUNT(t.id) as task_count,
      COALESCE(SUM(CASE WHEN t.is_completed = 1 THEN 1 ELSE 0 END), 0) as completed_task_count
    FROM projects p
    LEFT JOIN tasks t ON p.id = t.project_id
    GROUP BY p.id
    ORDER BY p.created_at ASC
  `).all();
  return c.json(projects);
});

// 新規プロジェクト作成
app.post('/api/projects', async (c) => {
  const body = await c.req.json<{
    title: string;
    description?: string;
    theme?: string;
    userId?: string;
  }>();

  if (!body.title) {
    return c.json({ error: 'Title is required' }, 400);
  }

  const projectId = 'proj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
  const theme = body.theme || 'indigo';
  const userId = body.userId || 'user_taro';

  // 1. プロジェクト追加
  await c.env.DB.prepare(`
    INSERT INTO projects (id, title, description, theme)
    VALUES (?, ?, ?, ?)
  `).bind(projectId, body.title, body.description || '', theme).run();

  // 2. オーナーメンバー追加
  await c.env.DB.prepare(`
    INSERT INTO project_members (id, project_id, user_id, role)
    VALUES (?, ?, ?, 'owner')
  `).bind('pm_' + Date.now(), projectId, userId).run();

  // 3. 基本カテゴリーを2つ作成
  await c.env.DB.prepare(`
    INSERT INTO categories (id, project_id, name, icon, color_badge, sort_order)
    VALUES 
      (?, ?, 'メインタスク', '📌', 'blue', 1),
      (?, ?, '準備・手配', '📝', 'amber', 2)
  `).bind(
    'cat_' + Date.now() + '_1', projectId,
    'cat_' + Date.now() + '_2', projectId
  ).run();

  return c.json({ success: true, projectId }, 201);
});

// プロジェクトのテーマ設定を更新
app.patch('/api/projects/:id/theme', async (c) => {
  const projectId = c.req.param('id');
  const body = await c.req.json<{ theme: string }>();

  if (!body.theme) {
    return c.json({ error: 'Theme is required' }, 400);
  }

  await c.env.DB.prepare(`
    UPDATE projects SET theme = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `).bind(body.theme, projectId).run();

  return c.json({ success: true, theme: body.theme });
});

// プロジェクトメンバー追加
app.post('/api/projects/:id/members', async (c) => {
  const projectId = c.req.param('id');
  const body = await c.req.json<{
    name: string;
    email?: string;
    role?: string;
    avatarColor?: string;
  }>();

  if (!body.name) {
    return c.json({ error: 'Name is required' }, 400);
  }

  const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
  const color = body.avatarColor || '#6366f1';
  const role = body.role || 'member';

  // 1. ユーザー作成
  await c.env.DB.prepare(`
    INSERT INTO users (id, name, email, avatar_color)
    VALUES (?, ?, ?, ?)
  `).bind(userId, body.name, body.email || null, color).run();

  // 2. プロジェクトメンバー紐付け
  await c.env.DB.prepare(`
    INSERT INTO project_members (id, project_id, user_id, role)
    VALUES (?, ?, ?, ?)
  `).bind('pm_' + Date.now(), projectId, userId, role).run();

  return c.json({
    success: true,
    user: {
      id: userId,
      name: body.name,
      email: body.email || null,
      avatar_color: color,
      role
    }
  }, 201);
});

// プロジェクト詳細とタスク一覧（メイン取得API）
app.get('/api/projects/:id', async (c) => {
  const projectId = c.req.param('id');

  // プロジェクト情報
  const project = await c.env.DB.prepare(
    'SELECT * FROM projects WHERE id = ?'
  ).bind(projectId).first();

  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  // メンバー一覧
  const { results: members } = await c.env.DB.prepare(`
    SELECT u.id, u.name, u.email, u.avatar_color, pm.role
    FROM project_members pm
    JOIN users u ON pm.user_id = u.id
    WHERE pm.project_id = ?
  `).bind(projectId).all();

  // カテゴリー一覧
  const { results: categories } = await c.env.DB.prepare(`
    SELECT * FROM categories WHERE project_id = ? ORDER BY sort_order ASC
  `).bind(projectId).all();

  // タグ一覧
  const { results: tags } = await c.env.DB.prepare(`
    SELECT * FROM tags WHERE project_id = ? ORDER BY name ASC
  `).bind(projectId).all();

  // タスク一覧（完了タスクも保持！カテゴリー・担当者・タグを結合）
  const { results: taskRows } = await c.env.DB.prepare(`
    SELECT 
      t.id, t.project_id, t.category_id, t.assignee_id, t.title, t.description,
      t.is_completed, t.completed_at, t.completed_by_id, t.due_date, t.created_at,
      c.name AS category_name, c.icon AS category_icon, c.color_badge AS category_color,
      u_assignee.name AS assignee_name, u_assignee.avatar_color AS assignee_color,
      u_completed.name AS completed_by_name
    FROM tasks t
    LEFT JOIN categories c ON t.category_id = c.id
    LEFT JOIN users u_assignee ON t.assignee_id = u_assignee.id
    LEFT JOIN users u_completed ON t.completed_by_id = u_completed.id
    WHERE t.project_id = ?
    ORDER BY 
      CASE WHEN t.due_date IS NULL THEN 1 ELSE 0 END,
      t.due_date ASC,
      t.created_at ASC
  `).bind(projectId).all();

  // 各タスクに紐付くタグを取得
  const { results: taskTagRows } = await c.env.DB.prepare(`
    SELECT tt.task_id, tg.name AS tag_name
    FROM task_tags tt
    JOIN tags tg ON tt.tag_id = tg.id
    JOIN tasks t ON tt.task_id = t.id
    WHERE t.project_id = ?
  `).bind(projectId).all();

  const tagsByTaskId: Record<string, string[]> = {};
  for (const row of taskTagRows as any[]) {
    if (!tagsByTaskId[row.task_id]) {
      tagsByTaskId[row.task_id] = [];
    }
    tagsByTaskId[row.task_id].push(row.tag_name);
  }

  const tasks = (taskRows as any[]).map(t => ({
    ...t,
    is_completed: Boolean(t.is_completed),
    tags: tagsByTaskId[t.id] || []
  }));

  return c.json({
    project,
    members,
    categories,
    tags,
    tasks
  });
});

// 新規タスク追加
app.post('/api/tasks', async (c) => {
  const body = await c.req.json<{
    projectId: string;
    title: string;
    categoryId?: string;
    assigneeId?: string;
    dueDate?: string;
    tags?: string[];
  }>();

  if (!body.title || !body.projectId) {
    return c.json({ error: 'Title and projectId are required' }, 400);
  }

  const taskId = 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);

  await c.env.DB.prepare(`
    INSERT INTO tasks (id, project_id, category_id, assignee_id, title, due_date, is_completed)
    VALUES (?, ?, ?, ?, ?, ?, 0)
  `).bind(
    taskId,
    body.projectId,
    body.categoryId || null,
    body.assigneeId || null,
    body.title,
    body.dueDate || null
  ).run();

  // タグの紐付け
  if (body.tags && body.tags.length > 0) {
    for (const tagName of body.tags) {
      const cleanName = tagName.startsWith('#') ? tagName.slice(1) : tagName;
      // タグが存在しなければ作成
      let tag = await c.env.DB.prepare(
        'SELECT id FROM tags WHERE project_id = ? AND name = ?'
      ).bind(body.projectId, cleanName).first<{ id: string }>();

      let tagId = tag?.id;
      if (!tagId) {
        tagId = 'tag_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
        await c.env.DB.prepare(
          'INSERT INTO tags (id, project_id, name) VALUES (?, ?, ?)'
        ).bind(tagId, body.projectId, cleanName).run();
      }

      await c.env.DB.prepare(
        'INSERT OR IGNORE INTO task_tags (id, task_id, tag_id) VALUES (?, ?, ?)'
      ).bind('tt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4), taskId, tagId).run();
    }
  }

  return c.json({ success: true, taskId }, 201);
});

// タスク完了 / 未完了 トグル
app.patch('/api/tasks/:id/toggle', async (c) => {
  const taskId = c.req.param('id');
  const body = await c.req.json<{ userId?: string }>().catch(() => ({ userId: 'user_taro' }));
  const userId = body.userId || 'user_taro';

  const task = await c.env.DB.prepare('SELECT is_completed FROM tasks WHERE id = ?').bind(taskId).first<{ is_completed: number }>();
  if (!task) {
    return c.json({ error: 'Task not found' }, 404);
  }

  const newStatus = task.is_completed ? 0 : 1;
  const completedAt = newStatus === 1 ? new Date().toISOString().replace('T', ' ').substring(0, 19) : null;
  const completedById = newStatus === 1 ? userId : null;

  await c.env.DB.prepare(`
    UPDATE tasks 
    SET is_completed = ?, completed_at = ?, completed_by_id = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(newStatus, completedAt, completedById, taskId).run();

  return c.json({
    success: true,
    is_completed: Boolean(newStatus),
    completed_at: completedAt,
    completed_by_id: completedById
  });
});

// タスクの期限変更（リスケジュール、完了済みのタスクは変更不可）
app.patch('/api/tasks/:id/due-date', async (c) => {
  const taskId = c.req.param('id');
  const body = await c.req.json<{ dueDate: string | null }>();

  const task = await c.env.DB.prepare('SELECT is_completed FROM tasks WHERE id = ?').bind(taskId).first<{ is_completed: number }>();
  if (!task) {
    return c.json({ error: 'Task not found' }, 404);
  }
  if (task.is_completed) {
    return c.json({ error: '完了済みのタスクは期限を変更できません' }, 400);
  }

  await c.env.DB.prepare(`
    UPDATE tasks 
    SET due_date = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(body.dueDate || null, taskId).run();

  return c.json({
    success: true,
    due_date: body.dueDate || null
  });
});

// タスクの担当者変更（未完了のみ、完了済みは変更不可）
app.patch('/api/tasks/:id/assignee', async (c) => {
  const taskId = c.req.param('id');
  const body = await c.req.json<{ assigneeId: string | null }>();

  const task = await c.env.DB.prepare('SELECT is_completed FROM tasks WHERE id = ?').bind(taskId).first<{ is_completed: number }>();
  if (!task) {
    return c.json({ error: 'Task not found' }, 404);
  }
  if (task.is_completed) {
    return c.json({ error: '完了済みのタスクは担当者を変更できません' }, 400);
  }

  await c.env.DB.prepare(`
    UPDATE tasks 
    SET assignee_id = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(body.assigneeId || null, taskId).run();

  return c.json({ success: true, assignee_id: body.assigneeId || null });
});

// ユーザー情報更新（名前、アバターカラー、役割）
app.patch('/api/users/:id', async (c) => {
  const userId = c.req.param('id');
  const body = await c.req.json<{
    name?: string;
    avatarColor?: string;
    role?: string;
    projectId?: string;
  }>();

  if (body.name || body.avatarColor) {
    await c.env.DB.prepare(`
      UPDATE users 
      SET name = COALESCE(?, name), avatar_color = COALESCE(?, avatar_color)
      WHERE id = ?
    `).bind(body.name || null, body.avatarColor || null, userId).run();
  }

  if (body.role && body.projectId) {
    await c.env.DB.prepare(`
      UPDATE project_members 
      SET role = ?
      WHERE user_id = ? AND project_id = ?
    `).bind(body.role, userId, body.projectId).run();
  }

  return c.json({ success: true, userId });
});

// タスク削除
app.delete('/api/tasks/:id', async (c) => {
  const taskId = c.req.param('id');
  await c.env.DB.prepare('DELETE FROM tasks WHERE id = ?').bind(taskId).run();
  return c.json({ success: true });
});

export default app;
