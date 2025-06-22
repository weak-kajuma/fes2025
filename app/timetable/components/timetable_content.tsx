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
    return styles.locationDefault || 'locationDefault'; // CSS Modulesのクラス名またはプレーンなクラス名
  }
  // 例: "ステージA" -> "locationStageA"
  // スペースを除去し、英字の最初の文字を大文字にするなど、適宜調整してください。
  const sanitized = location.replace(/\s+/g, ''); // スペース除去
  // CSS Modules を使っている場合、stylesオブジェクト経由でクラス名を取得
  return styles[`location${sanitized}`] || styles.locationDefault || `location${sanitized}`;
};

export default function TimeTableContent ({ eventData }: { eventData: EventData }) {

  const locationClassName = formatLocationToClassName(eventData.location);

  const getGridRow = (timeStr?: string | null) => {
    if (!timeStr) return 2;
    const [h, m] = timeStr.split(":").map(Number);
    const baseMinutes = 8 * 60 + 30;
    const eventMinutes = h * 60 + m;
    return 2 + (eventMinutes - baseMinutes);
  };

  const gridRowStart = getGridRow(eventData.displayTimeStartTime);
  const gridRowEnd = getGridRow(eventData.displayTimeEndTime);

  return (
    <div
      className={`${styles.wrapper} ${locationClassName}`}
      style={{
        gridRowStart: gridRowStart,
        gridRowEnd: gridRowEnd,
      }}
    >
      <p className={styles.time}>
        {/* サーバーで生成された表示用時刻をそのまま表示 */}
        {(eventData.displayTimeStartTime ?? '--:--') + ' - ' + (eventData.displayTimeEndTime ?? '--:--')}
      </p>
      <p className={styles.title}>{eventData.title ?? 'タイトルなし'}</p>
    </div>
  )
}