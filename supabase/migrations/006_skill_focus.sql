-- 聚焦方向模块：管理首页"我在聚焦什么"的内容

-- 技能分组表（如"技术栈"、"学习方向"等）
CREATE TABLE IF NOT EXISTS skill_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title_zh TEXT NOT NULL,
  title_en TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 技能项表（每个分组下的具体条目）
CREATE TABLE IF NOT EXISTS skill_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES skill_groups(id) ON DELETE CASCADE NOT NULL,
  text_zh TEXT NOT NULL,
  text_en TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_skill_groups_user_id ON skill_groups(user_id);
CREATE INDEX idx_skill_groups_sort ON skill_groups(user_id, sort_order);
CREATE INDEX idx_skill_items_group_id ON skill_items(group_id);
CREATE INDEX idx_skill_items_sort ON skill_items(group_id, sort_order);

-- 触发器：自动更新 updated_at
CREATE TRIGGER update_skill_groups_updated_at BEFORE UPDATE ON skill_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE skill_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_items ENABLE ROW LEVEL SECURITY;

-- 策略：用户管理自己的数据，公开可读
CREATE POLICY "Users can manage own skill groups" ON skill_groups
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public can view skill groups" ON skill_groups
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own skill items" ON skill_items
  FOR ALL USING (
    auth.uid() = (SELECT user_id FROM skill_groups WHERE skill_groups.id = skill_items.group_id)
  );

CREATE POLICY "Public can view skill items" ON skill_items
  FOR SELECT USING (true);
