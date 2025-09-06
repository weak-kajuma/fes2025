"use client"

import styles from './timetable_content.module.css'

type EventData = {
  idx: number;
  id: number;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  locationType: string | null;
  groups?: { name: string, startDate: string, endDate: string }[];
}


// 日本語→英語変換テーブル（キャメルケース）
const locationTypeMap: Record<string, string> = {
  'グラウンドステージ': 'Stage',
  '中庭': 'Yard',
  'コナコピアホール': 'Hole',
  '体育館': 'Gym',
};

// locationTypeを英語キャメルケースに変換しCSSクラス名に
const formatLocationToClassName = (location: string | null): string => {
  if (!location) return styles.locationDefault;
  const eng = locationTypeMap[location] || 'Default';
  return styles[`location${eng}`] || styles.locationDefault;
};

export default function TimeTableContent ({ eventData }: { eventData: EventData }) {

  const locationClassName = formatLocationToClassName(eventData.locationType ?? null);

  // Date型からgridRowを計算
    const getGridRow = (timeStr?: string | null) => {
      if (!timeStr) return 2;
      // "2025-09-20 08:40:00" → "2025-09-20T08:40:00" に変換
      const dateObj = new Date(timeStr.replace(' ', 'T'));
      const baseMinutes = 8 * 60 + 30;
      const eventMinutes = dateObj.getHours() * 60 + dateObj.getMinutes();
      return 2 + (eventMinutes - baseMinutes);
    };

  const gridRowStart = getGridRow(eventData.startDate ?? undefined);
  const gridRowEnd = getGridRow(eventData.endDate ?? undefined);

  // 表示用時刻（サーバーで生成されていない場合はここで生成）
  const formatTime = (date: Date | string | null | undefined) => {
    if (!date) return '--:--';
    let d: Date;
    if (typeof date === 'string') {
      d = new Date(date.replace(' ', 'T'));
    } else {
      d = date;
    }
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  return (
    <div
      className={`${styles.wrapper} ${locationClassName}`}
      style={{
        gridRowStart: gridRowStart,
        gridRowEnd: gridRowEnd,
      }}
    >
      <p className={styles.time}>
        {formatTime(eventData.startDate) + ' - ' + formatTime(eventData.endDate)}
      </p>
      <p className={styles.title}>
        {(eventData.title ?? 'タイトルなし')
          .split('\n')
          .map((line, i) => (
            <span key={i}>
              {line}
              {i !== (eventData.title ?? 'タイトルなし').split('\n').length - 1 && <br />}
            </span>
          ))}
      </p>
    </div>
  )
}