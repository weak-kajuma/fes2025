"use client"

import styles from './timetable_content.module.css'

interface EventData {
  id: string | number; // id の型に合わせて string か number にしてください
  title: string | null; // null の可能性を許容
  subtitle: string | null; // 他のフィールドも Prisma の型に合わせる
  description: string | null;
  startDate: Date | null;
  endDate: Date | null;
  location: string | null;
  imageUrl: string | null;
  displayTimeStartTime?: string; // 追加: サーバーで生成された表示用時刻
  displayTimeEndTime?: string;   // 追加: サーバーで生成された表示用時刻
}


// 日本語→英語変換テーブル（キャメルケース）
const locationTypeMap: Record<string, string> = {
  '野外ステージ': 'Stage',
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

  const locationClassName = formatLocationToClassName((eventData as any).locationType ?? eventData.location);

  // Date型からgridRowを計算
    const getGridRow = (timeStr?: string | null) => {
      if (!timeStr) return 2;
      // "2025-09-20 08:40:00" → "2025-09-20T08:40:00" に変換
      const dateObj = new Date(timeStr.replace(' ', 'T'));
      const baseMinutes = 8 * 60 + 30;
      const eventMinutes = dateObj.getHours() * 60 + dateObj.getMinutes();
      return 2 + (eventMinutes - baseMinutes);
    };

  const gridRowStart = getGridRow(
    typeof eventData.startDate === "string"
      ? eventData.startDate
      : eventData.startDate
      ? eventData.startDate.toISOString().replace("T", " ").slice(0, 19)
      : undefined
  );
  const gridRowEnd = getGridRow(
    typeof eventData.endDate === "string"
      ? eventData.endDate
      : eventData.endDate
      ? eventData.endDate.toISOString().replace("T", " ").slice(0, 19)
      : undefined
  );

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