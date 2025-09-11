// import { supabase } from '../../../lib/supabaseClient';
import { fetchLocalJson } from '@/lib/fetchLocalJson';

export type EventDataForClient = {
  id: number;
  title: string | null;
  host: string | null;
  intro: string | null;
  brief_intro: string | null;
  locationType: string | null;
  tags: string[] | null;
  date: string | null;
};

type EventRow = {
  id: number;
  title: string | null;
  host: string | null;
  intro: string | null;
  brief_intro: string | null;
  locationType: string | null;
  tags: string[] | null;
  startDate?: string;
};

export async function getEventsWithFilters(
  targetDate: string | null,
  selectedAreas: string[],
  keyword: string,
  // year: number,
  // month: number
): Promise<EventDataForClient[]> {
  // ローカルJSONから全件取得
  const allData = await fetchLocalJson<EventRow[]>("/data/search.json");

  // ① 日付絞り込み（startDateがその日の範囲）
  // if (targetDate) {
  //   const day = parseInt(targetDate, 10);
  //   const year = 2025; // Example year, you should pass this in
  //   const month = 9; // Example month, you should pass this in
  //   const dateStart = new Date(year, month - 1, day, 0, 0, 0, 0);
  //   const dateEnd = new Date(year, month - 1, day, 23, 59, 59, 999);
  //   query = query
  //     .gte('startDate', dateStart.toISOString())
  //     .lte('startDate', dateEnd.toISOString());
  // }

  // 日付絞り込み（dateプロパティで）
  let filtered = allData;
  if (targetDate) {
    // 20→2025-09-20, 21→2025-09-21
    const dateStr = targetDate === "20" ? "2025-09-20" : targetDate === "21" ? "2025-09-21" : "";
    filtered = filtered.filter((ev: any) => ev.date === dateStr);
  }

  // ② エリアでの絞り込み (RPCの結果に対してさらに絞り込み)
  if (selectedAreas.length > 0) {
    // The RPC function returns a query builder, so we can chain filters.
    filtered = filtered.filter((ev: EventRow) => selectedAreas.includes(ev.locationType ?? ""));
  }

  // キーワード絞り込み
  if (keyword) {
    const kw = keyword.toLowerCase();
      filtered = filtered.filter((ev: EventRow) =>
        (ev.title?.toLowerCase().includes(kw) || "") ||
        (ev.host?.toLowerCase().includes(kw) || "") ||
        (ev.intro?.toLowerCase().includes(kw) || "") ||
        (ev.brief_intro?.toLowerCase().includes(kw) || "")
      );
  }


  // 日付で昇順ソート（dateプロパティがある場合）
  filtered = filtered.sort((a: any, b: any) => {
    if (!a.date || !b.date) return 0;
    return a.date.localeCompare(b.date);
  });

  // 型変換
  return filtered.map((row: any) => ({
    id: row.id,
    title: row.title,
    host: row.host,
    intro: row.intro,
    brief_intro: row.brief_intro,
    locationType: row.locationType,
    tags: row.tags ?? [],
    date: row.date ?? null,
  }));
}