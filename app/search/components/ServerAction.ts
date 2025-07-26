import { supabase } from '../../../lib/supabaseClient';

export type EventDataForClient = {
  id: number;
  title: string | null;
  host: string | null;
  intro: string | null;
  brief_intro: string | null;
  locationType: string | null;
  tags: string[] | null;
};

type EventRow = {
  id: number;
  title: string | null;
  host: string | null;
  intro: string | null;
  brief_intro: string | null;
  locationType: string | null;
  tags: string[] | null;
};

export async function getEventsWithFilters(
  targetDate: string | null,
  selectedAreas: string[],
  keyword: string,
  // year: number,
  // month: number
): Promise<EventDataForClient[]> {
  let query;

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

  // ③ キーワード検索: RPC関数を呼び出す
  if (keyword) {
    query = supabase.rpc('search_events', { search_keyword: keyword });
  } else {
    // キーワードがない場合は全件取得
    query = supabase.from('Event_all').select('*');
  }

  // ② エリアでの絞り込み (RPCの結果に対してさらに絞り込み)
  if (selectedAreas.length > 0) {
    // The RPC function returns a query builder, so we can chain filters.
    query = query.in('locationType', selectedAreas);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Supabase fetch error:', error.message);
    return [];
  }

  return (data as EventRow[]).map(event => ({
    id: event.id,
    title: event.title,
    host: event.host,
    intro: event.intro,
    brief_intro: event.brief_intro,
    locationType: event.locationType,
    tags: event.tags ?? [],
  }));
}