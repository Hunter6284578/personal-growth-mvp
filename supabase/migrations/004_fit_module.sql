-- ==================== 健身模块 ====================

-- 动作库字典
CREATE TABLE IF NOT EXISTS fit_exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  target_muscle TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'free_weight', -- free_weight, machine, cable, band, bodyweight
  equipment TEXT, -- dumbbell, barbell, band, cable, etc.
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 训练记录
CREATE TABLE IF NOT EXISTS fit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  exercise_id UUID REFERENCES fit_exercises(id) ON DELETE SET NULL NOT NULL,
  sets JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_volume INTEGER NOT NULL DEFAULT 0,
  total_sets INTEGER NOT NULL DEFAULT 0,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_fit_exercises_muscle ON fit_exercises(target_muscle);
CREATE INDEX idx_fit_exercises_category ON fit_exercises(category);
CREATE INDEX idx_fit_logs_user_id ON fit_logs(user_id);
CREATE INDEX idx_fit_logs_date ON fit_logs(date);
CREATE INDEX idx_fit_logs_exercise_id ON fit_logs(exercise_id);
CREATE INDEX idx_fit_logs_user_date ON fit_logs(user_id, date);

-- RLS
ALTER TABLE fit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own fit logs" ON fit_logs
  FOR ALL USING (auth.uid() = user_id);

-- ==================== 预置动作库 ====================
-- 重点关注：三角肌中束/后束
INSERT INTO fit_exercises (name, target_muscle, category, equipment, notes) VALUES
-- 三角肌中束
('哑铃侧平举', '三角肌中束', 'free_weight', 'dumbbell', '经典中束动作'),
('阻力带侧平举', '三角肌中束', 'band', 'band', '恒定张力，适合在家中或热身使用'),
('绳索侧平举', '三角肌中束', 'cable', 'cable', '全程恒定张力'),
('单臂哑铃侧平举', '三角肌中束', 'free_weight', 'dumbbell', '可借力扶稳，孤立更好'),
('器械侧平举', '三角肌中束', 'machine', 'machine', '固定轨迹，适合新手'),
('哑铃推举', '三角肌前束/中束', 'free_weight', 'dumbbell', '复合动作，覆盖前束和中束'),
('杠铃推举', '三角肌前束/中束', 'free_weight', 'barbell', '大重量复合动作'),
('阿诺德推举', '三角肌前束/中束', 'free_weight', 'dumbbell', '旋转发力，全面刺激'),
-- 三角肌后束
('俯身哑铃飞鸟', '三角肌后束', 'free_weight', 'dumbbell', '经典后束动作'),
('绳索面拉', '三角肌后束', 'cable', 'cable', '后束和斜方肌下束'),
('俯身绳索飞鸟', '三角肌后束', 'cable', 'cable', '固定轨迹后束动作'),
('反向蝴蝶机夹胸', '三角肌后束', 'machine', 'machine', '固定轨迹，适合收尾'),
('阻力带面拉', '三角肌后束', 'band', 'band', '便携后束训练'),
('杠铃划船', '三角肌后束/背阔肌', 'free_weight', 'barbell', '复合动作'),
('坐姿绳索划船', '三角肌后束/背阔肌', 'cable', 'cable', '中等重量复合动作'),
-- 其他肌群补充
('平板杠铃卧推', '胸大肌', 'free_weight', 'barbell', '胸部基础动作'),
('上斜哑铃卧推', '胸大肌上束', 'free_weight', 'dumbbell', '上胸重点'),
('双杠臂屈伸', '胸大肌下束/三头', 'bodyweight', NULL, '自重复合动作'),
('深蹲', '股四头肌/臀大肌', 'free_weight', 'barbell', '腿部基础动作'),
('罗马尼亚硬拉', '腘绳肌/臀大肌', 'free_weight', 'barbell', '后链基础动作'),
('平板支撑', '核心', 'bodyweight', NULL, '核心稳定'),
('引体向上', '背阔肌/二头', 'bodyweight', NULL, '上肢拉力基础'),
('哑铃弯举', '肱二头肌', 'free_weight', 'dumbbell', '二头孤立动作'),
('绳索下压', '肱三头肌', 'cable', 'cable', '三头孤立动作');
