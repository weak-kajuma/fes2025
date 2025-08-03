import timetable_row_data from "../../../data/timetable.json"

type EventDataForClient = {
  id: number;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  startDate: Date | null;
  endDate: Date | null;
  location: string | null;
  imageUrl: string | null;
};

export type EventsByLocation = {
  locationType: string;
  events: EventDataForClient[];
};

type EventRow = {
  id: number;
  title: string;
  subtitle: string | null;
  description: string | null;
  startDate: string;
  endDate: string;
  location: string;
  imageUrl: string | null;
};

/**
 * 指定された日付・エリアのイベントデータをSupabaseから取得し、JST時刻を整形せず返す
 */
export function getEventsBySort(
    targetDate: string,
): EventsByLocation[] {
    const grouped: Record<string, EventDataForClient[]> = {};
    timetable_row_data.forEach((event: EventRow) => {
        if (!((new Date(event.startDate)).getDate() === parseInt(targetDate, 10))) return;
        grouped[event.location] ??= [];
        grouped[event.location].push({
            id: event.id,
            title: event.title,
            subtitle: event.subtitle,
            description: event.description,
            startDate: new Date(event.startDate),
            endDate: new Date(event.endDate),
            location: event.location,
            imageUrl: event.imageUrl,
        });
    })
    console.log(grouped)
    return Object.entries(grouped).map(([locationType, events]) => ({
        locationType,
        events,
    }));
}