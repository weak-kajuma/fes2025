-- Supabase SQL: now_events テーブル定義
CREATE TABLE public.now_events (
  id serial PRIMARY KEY,
  locationType text NOT NULL,
  eventId integer NOT NULL,
  groupIndex integer,
  updatedAt timestamptz DEFAULT now()
);

-- 必要に応じてRLS（Row Level Security）やAPI権限も設定してください。
