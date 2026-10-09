-- 初期ユーザー
INSERT OR IGNORE INTO users (id, name, email, avatar_color) VALUES
  ('user_taro', '太郎', 'taro@example.com', '#2563eb'),
  ('user_hanako', '花子', 'hanako@example.com', '#ec4899'),
  ('user_kenta', '健太', 'kenta@example.com', '#0d9488');

-- 初期プロジェクト（引越し）
INSERT OR IGNORE INTO projects (id, title, description, theme) VALUES
  ('proj_moving', '🚚 新居への引越し', '引越しに伴う荷造り・諸手続き・掃除のToDoタイムライン', 'amber');

-- プロジェクトメンバー
INSERT OR IGNORE INTO project_members (id, project_id, user_id, role) VALUES
  ('pm_1', 'proj_moving', 'user_taro', 'owner'),
  ('pm_2', 'proj_moving', 'user_hanako', 'admin'),
  ('pm_3', 'proj_moving', 'user_kenta', 'member');

-- カテゴリー
INSERT OR IGNORE INTO categories (id, project_id, name, icon, color_badge, sort_order) VALUES
  ('cat_packing', 'proj_moving', '荷造り', '📦', 'amber', 1),
  ('cat_admin', 'proj_moving', '事務・手配', '📝', 'blue', 2),
  ('cat_clean', 'proj_moving', '不用品・掃除', '🧹', 'purple', 3);

-- タグ
INSERT OR IGNORE INTO tags (id, project_id, name) VALUES
  ('tag_urgent', 'proj_moving', '急ぎ'),
  ('tag_cost', 'proj_moving', '費用発生'),
  ('tag_check', 'proj_moving', '要確認'),
  ('tag_cardboard', 'proj_moving', 'ダンボール');

-- 初期タスク（未完了と完了実績の両方）
INSERT OR IGNORE INTO tasks (id, project_id, category_id, assignee_id, title, description, is_completed, completed_at, completed_by_id, due_date, sort_order) VALUES
  ('task_1', 'proj_moving', 'cat_admin', 'user_taro', '引越し見積もり比較 & 業者決定', '複数社比較してサカイに決定済', 1, '2026-10-02 16:30', 'user_taro', '2026-10-02', 1),
  ('task_2', 'proj_moving', 'cat_admin', 'user_taro', '賃貸の解約届を管理会社に提出', 'Webフォームより送信完了', 1, '2026-10-04 11:15', 'user_taro', '2026-10-05', 2),
  ('task_3', 'proj_moving', 'cat_clean', 'user_hanako', 'リビング・寝室の不用品を粗大ゴミ申し込み', '区の粗大ゴミ回収センターに予約', 0, NULL, NULL, '2026-10-08', 3),
  ('task_4', 'proj_moving', 'cat_packing', 'user_hanako', 'オフシーズン衣類・書籍のダンボール詰め', '寝室クローゼットから着手', 0, NULL, NULL, '2026-10-10', 4),
  ('task_5', 'proj_moving', 'cat_admin', 'user_taro', '電気・ガス・水道の移転手続き', 'ガス開通立ち会い日時の調整要', 0, NULL, NULL, '2026-10-12', 5),
  ('task_6', 'proj_moving', 'cat_admin', 'user_kenta', 'エアコン取り外し・移設の見積もり手配', '専門業者へ依頼', 0, NULL, NULL, '2026-10-13', 6),
  ('task_7', 'proj_moving', 'cat_packing', NULL, '食器類・壊れ物の梱包（緩衝材使用）', 'キッチン周り', 0, NULL, NULL, '2026-10-14', 7);

-- タスクとタグの紐付け
INSERT OR IGNORE INTO task_tags (id, task_id, tag_id) VALUES
  ('tt_1', 'task_1', 'tag_cost'),
  ('tt_2', 'task_3', 'tag_urgent'),
  ('tt_3', 'task_3', 'tag_check'),
  ('tt_4', 'task_4', 'tag_cardboard');
