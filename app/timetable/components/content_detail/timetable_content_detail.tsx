"use client"

import styles from './timetable_content_detail.module.css'

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

  type NowEvent = {
    id: number;
    locationType: string;
    eventId: number;
    groupIndex?: number | null;
    updatedAt?: string;
    startDate?: string;
    endDate?: string;
  };

type TimeTableContentDetailProps = {
  eventData: EventData;
  nowEvents: NowEvent[];
  locationType: string;
  onRegister?: (locationType: string, eventId: number, groupIndex?: number) => void;
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

export default function TimeTableContentDetail ({ eventData, nowEvents, locationType }: TimeTableContentDetailProps) {
    // 厳密な比較・デバッグ出力
    const { onRegister } = arguments[0];
    const locationTypeLower = (locationType ?? '').toString().toLowerCase().trim();
    const eventIdNum = Number(eventData.id);
    const nowEvent = nowEvents.find(
      (ne) => (ne.locationType ?? '').toString().toLowerCase().trim() === locationTypeLower && Number(ne.eventId) === eventIdNum
    );
    // locationTypeClassName
    const locationClassName = formatLocationToClassName(eventData.locationType ?? null);
    // gridRow計算
    const getGridRow = (timeStr?: string | null) => {
      if (!timeStr) return 2;
      const dateObj = new Date(timeStr.replace(' ', 'T'));
      const baseMinutes = 8 * 60 + 30;
      const eventMinutes = dateObj.getHours() * 60 + dateObj.getMinutes();
      return 2 + (eventMinutes - baseMinutes);
    };

    const gridRowStart = getGridRow(eventData.startDate);
    const gridRowEnd = getGridRow(eventData.endDate);

    // 時刻フォーマット
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

  // groups安全定義
  const groups = Array.isArray(eventData.groups) ? eventData.groups : undefined;

    if (groups && groups.length > 0) {
      // groups分岐: groupindexが一致するgroupBoxのみレイアウト変更
      return (
        <div
          className={`${styles.wrapper} ${locationClassName}`}
          style={{
            gridRowStart: gridRowStart,
            gridRowEnd: gridRowEnd
          }}
        >
          <p className={styles.time_group}>
            {formatTime(eventData.startDate) + ' - ' + formatTime(eventData.endDate)}
          </p>
          <p className={styles.title_group}>
            {(eventData.title ?? 'タイトルなし')
              .split('\n')
              .map((line, i) => (
                <span key={i}>
                  {line}
                  {i !== (eventData.title ?? 'タイトルなし').split('\n').length - 1 && <br />}
                </span>
              ))}
          </p>
          <div className={styles.groupBox_wrapper}>
            {groups.map((groupdata: { name: string, startDate: string, endDate: string }, idx: number) => {
              const name = groupdata.name;
              const isNow = nowEvents.some(
                (ne) => (ne.locationType ?? '').toString().toLowerCase().trim() === locationTypeLower && Number(ne.eventId) === eventIdNum && ne.groupIndex === idx
              );
              return (
                <div
                  className={isNow ? `${styles.groupBox} ${styles.nowEvent}` : styles.groupBox}
                  key={`${name}-${String(idx)}`}
                  style={{
                    borderBottom: idx !== groups.length - 1 ? '1px solid #aaa' : 'none',
                    ...(isNow && { backgroundColor: 'var(--text)', color: 'black', zIndex: 2 })
                  }}
                  onClick={() => onRegister?.(locationType, Number(eventData.id), idx)}
                >
                  <span style={{width: '100%'}}>{name}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    } else {
      // groupsなし分岐
      return (
        <div
          className={`${styles.wrapper} ${locationClassName} ${nowEvent ? styles.nowEvent : ''}`}
          style={{
            gridRowStart: gridRowStart,
            gridRowEnd: gridRowEnd,
          }}
          onClick={() => onRegister?.(locationType, Number(eventData.id))}
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
      );
    }
}