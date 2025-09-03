import { createClient } from '@supabase/supabase-js';

// 環境変数からURLとKEYを取得（.env.local推奨）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl, supabaseKey);

// now_eventsテーブルからリアルタイム演目を取得
export async function fetchNowEvents() {
  const { data, error } = await supabase
    .from('now_events')
    .select('*');
  if (error) throw error;
  return data;
}

// 型定義例
export type NowEvent = {
  id: number;
  locationType: string;
  eventId: number;
  groupIndex?: number;
  updatedAt?: string;
};
