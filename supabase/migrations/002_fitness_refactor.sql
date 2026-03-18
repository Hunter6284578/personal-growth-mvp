-- 体测数据模块重构：按记录频率拆分为三类

-- 1. 每日健康记录（睡眠、运动、体重）
CREATE TABLE IF NOT EXISTS daily_health (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  sleep_hours DECIMAL(3,1),
  sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
  weight DECIMAL(5,2),
  exercise_type TEXT,
  exercise_minutes INTEGER,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, record_date)
);

-- 2. 体测成绩（学校体测/自测）
CREATE TABLE IF NOT EXISTS fitness_tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  test_date DATE NOT NULL DEFAULT CURRENT_DATE,
  test_type TEXT NOT NULL DEFAULT 'self_test' CHECK (test_type IN ('school_test', 'self_test')),
  semester TEXT,
  run_1000m_seconds INTEGER,
  pull_ups INTEGER,
  standing_jump INTEGER,
  sit_and_reach DECIMAL(4,1),
  vital_capacity INTEGER,
  total_score DECIMAL(4,1),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 身体数据（体脂、心率、围度等）
CREATE TABLE IF NOT EXISTS body_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  body_fat DECIMAL(4,2),
  resting_hr INTEGER,
  chest DECIMAL(4,1),
  waist DECIMAL(4,1),
  hip DECIMAL(4,1),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_daily_health_user_id ON daily_health(user_id);
CREATE INDEX idx_daily_health_date ON daily_health(record_date);
CREATE INDEX idx_fitness_tests_user_id ON fitness_tests(user_id);
CREATE INDEX idx_fitness_tests_date ON fitness_tests(test_date);
CREATE INDEX idx_body_metrics_user_id ON body_metrics(user_id);
CREATE INDEX idx_body_metrics_date ON body_metrics(record_date);

-- 创建触发器：自动更新 updated_at
CREATE TRIGGER update_daily_health_updated_at BEFORE UPDATE ON daily_health
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 启用 RLS
ALTER TABLE daily_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_metrics ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略
CREATE POLICY "Users can manage own daily health" ON daily_health
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own fitness tests" ON fitness_tests
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own body metrics" ON body_metrics
  FOR ALL USING (auth.uid() = user_id);
