-- 创建 profiles 表
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  character_name TEXT NOT NULL DEFAULT '主角',
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 创建 stat_scores 表（六维属性评分）
CREATE TABLE IF NOT EXISTS stat_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  score_date DATE NOT NULL DEFAULT CURRENT_DATE,
  physical_score INTEGER NOT NULL DEFAULT 50 CHECK (physical_score >= 0 AND physical_score <= 100),
  execution_score INTEGER NOT NULL DEFAULT 50 CHECK (execution_score >= 0 AND execution_score <= 100),
  focus_score INTEGER NOT NULL DEFAULT 50 CHECK (focus_score >= 0 AND focus_score <= 100),
  emotion_score INTEGER NOT NULL DEFAULT 50 CHECK (emotion_score >= 0 AND emotion_score <= 100),
  social_score INTEGER NOT NULL DEFAULT 50 CHECK (social_score >= 0 AND social_score <= 100),
  creativity_score INTEGER NOT NULL DEFAULT 50 CHECK (creativity_score >= 0 AND creativity_score <= 100),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建 daily_logs 表（每日记录）
CREATE TABLE IF NOT EXISTS daily_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  summary TEXT,
  good_points TEXT,
  bad_points TEXT,
  reflection TEXT,
  tomorrow_plan TEXT,
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, log_date)
);

-- 创建 life_events 表（经历事件）
CREATE TABLE IF NOT EXISTS life_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  tags TEXT[],
  affected_stats TEXT[],
  impact_level INTEGER CHECK (impact_level >= 1 AND impact_level <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建 fitness_records 表（体测数据）
CREATE TABLE IF NOT EXISTS fitness_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  weight DECIMAL(5,2),
  body_fat DECIMAL(4,2),
  run_1000m_seconds INTEGER,
  pull_ups INTEGER,
  push_ups INTEGER,
  sit_and_reach DECIMAL(4,1),
  vital_capacity INTEGER,
  resting_hr INTEGER,
  sleep_hours DECIMAL(3,1),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建 uploaded_files 表（文件上传）
CREATE TABLE IF NOT EXISTS uploaded_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  related_type TEXT,
  related_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建 blog_posts 表（博客文章）
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  summary TEXT,
  content TEXT NOT NULL,
  tags TEXT[],
  status TEXT NOT NULL DEFAULT 'draft',
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建 thoughts 表（想法/短内容）
CREATE TABLE IF NOT EXISTS thoughts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建 ai_analyses 表（AI分析记录）
CREATE TABLE IF NOT EXISTS ai_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  analysis_type TEXT NOT NULL,
  input_summary TEXT,
  result TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_stat_scores_user_id ON stat_scores(user_id);
CREATE INDEX idx_stat_scores_date ON stat_scores(score_date);
CREATE INDEX idx_daily_logs_user_id ON daily_logs(user_id);
CREATE INDEX idx_daily_logs_date ON daily_logs(log_date);
CREATE INDEX idx_life_events_user_id ON life_events(user_id);
CREATE INDEX idx_life_events_date ON life_events(event_date);
CREATE INDEX idx_fitness_records_user_id ON fitness_records(user_id);
CREATE INDEX idx_fitness_records_date ON fitness_records(record_date);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);

-- 创建触发器：自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_logs_updated_at BEFORE UPDATE ON daily_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 启用 RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stat_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE life_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analyses ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略：用户只能访问自己的数据
CREATE POLICY "Users can manage own profile" ON profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own stats" ON stat_scores
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own daily logs" ON daily_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own life events" ON life_events
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own fitness records" ON fitness_records
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own files" ON uploaded_files
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own ai analyses" ON ai_analyses
  FOR ALL USING (auth.uid() = user_id);

-- 博客和想法：所有人可查看，认证用户可管理
CREATE POLICY "Anyone can view published posts" ON blog_posts
  FOR SELECT USING (status = 'published');

CREATE POLICY "Authenticated users can manage posts" ON blog_posts
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can view thoughts" ON thoughts
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage thoughts" ON thoughts
  FOR ALL USING (auth.role() = 'authenticated');
