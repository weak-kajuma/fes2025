import { supabase } from '../../../lib/supabaseClient';

export interface EventDataForClient {
  id: number;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  startDate: Date | null;
  endDate: Date | null;
  location: string | null;
  imageUrl: string | null;
}

export interface EventsByLocation {
  locationType: string;
  events: EventDataForClient[];
}

/**
 * 指定された日付・エリアのイベントデータをSupabaseから取得し、JST時刻を整形せず返す
 */
export async function getAllEventsForDate(
  targetDate: string,
  allAreaValues: string[],
  year: number,
  month: number
): Promise<EventsByLocation[]> {
  // 日付範囲を作成
  const day = parseInt(targetDate, 10);
  const dateStart = new Date(year, month - 1 , day, 0, 0, 0, 0);
  const dateEnd = new Date(year, month - 1 , day, 23, 59, 59, 999);

  // Supabaseから取得
  const { data, error } = await supabase
    .from('events')
    .select(`*`)
    // .gte('startDate', dateStart.toISOString())
    // .lte('startDate', dateEnd.toISOString())
    // .in('locationType', allAreaValues);

  console.log("Supabase fetch result:", { data, error });

  if (error) {
    console.error('Supabase fetch error:', error);
    return allAreaValues.map(loc => ({ locationType: loc, events: [] }));
  }

  // locationTypeごとにグループ化
  const grouped: { [key: string]: EventDataForClient[] } = {};
  data?.forEach((event: any) => {
    if (!grouped[event.locationType]) grouped[event.locationType] = [];
    grouped[event.locationType].push({
      id: event.id,
      title: event.title,
      subtitle: event.subtitle,
      description: event.description,
      startDate: event.startDate ? new Date(event.startDate) : null,
      endDate: event.endDate ? new Date(event.endDate) : null,
      location: event.location,
      imageUrl: event.imageUrl,
    });
  });

  // すべてのエリア値で返す（空配列も含める）
  return allAreaValues.map(locationType => ({
    locationType,
    events: grouped[locationType] ?? [],
  }));
}