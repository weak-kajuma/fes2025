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

// location文字列をCSSクラス名に適した形式に変換するヘルパー関数
const formatLocationToClassName = (location: string | null): string => {
  if (!location) {
    return styles.locationDefault; // ここは必ずCSS Modulesのクラス名
  }
  const sanitized = location.replace(/\s+/g, '');
  return styles[`location${sanitized}`] || styles.locationDefault;
};

export default function TimeTableContent ({ eventData }: { eventData: EventData }) {

  const locationClassName = formatLocationToClassName(eventData.location);

  // Date型からgridRowを計算
  const getGridRowFromDate = (date: Date | null) => {
    if (!date) return 2;
    const h = date.getHours();
    const m = date.getMinutes();
    const baseMinutes = 8 * 60 + 30; // 8:30基準
    const eventMinutes = h * 60 + m;
    return 2 + (eventMinutes - baseMinutes);
  };

  const gridRowStart = getGridRowFromDate(eventData.startDate);
  const gridRowEnd = getGridRowFromDate(eventData.endDate);

  // 表示用時刻（サーバーで生成されていない場合はここで生成）
  const formatTime = (date: Date | null) => {
    if (!date) return '--:--';
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
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
      <p className={styles.title}>{eventData.title ?? 'タイトルなし'}</p>
    </div>
  )
}