"use client";

import styles from "./admin_timetable_content_detail.module.css";
import { useState } from "react";

interface EventData {
  id: string | number;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  startDate: Date | null;
  endDate: Date | null;
  location: string | null;
  imageUrl: string | null;
  groups?: string[];
  displayTimeStartTime?: string;
  displayTimeEndTime?: string;
}

interface NowEvent {
  locationtype: string;
  eventid: number;
  groupindex?: number;
  updatedAt?: string;
}

interface AdminTimeTableContentDetailProps {
  eventData: EventData;
  nowEvents: NowEvent[];
  locationType: string;
  onRegister: (locationType: string, eventId: number, groupIndex?: number) => void;
  loading?: boolean;
}

export default function AdminTimeTableContentDetail({ eventData, nowEvents, locationType, onRegister, loading }: AdminTimeTableContentDetailProps) {
  // grid位置計算を復元
  const getGridRow = (date: Date | string | null | undefined) => {
    if (!date) return 2;
    let d: Date;
    if (typeof date === "string") {
      d = new Date(date.replace(" ", "T"));
    } else {
      d = date as Date;
    }
    const h = d.getHours();
    const m = d.getMinutes();
    const baseMinutes = 8 * 60 + 30;
    const eventMinutes = h * 60 + m;
    return 2 + (eventMinutes - baseMinutes);
  };
  const gridRowStart = getGridRow(eventData.startDate);
  const gridRowEnd = getGridRow(eventData.endDate);
  // DBのnowEventsに沿って該当イベントのdivに.nowEventを付与
  const locationTypeLower = (locationType ?? '').toString().toLowerCase().trim();
  const eventIdNum = Number(eventData.id);
  const groups = Array.isArray(eventData.groups) ? eventData.groups : undefined;

  if (groups && groups.length > 0) {
    // groups分岐: groupindexが一致するgroupBoxのみレイアウト変更（div構造に統一）
    return (
      <div className={styles.wrapper} style={{ gridRowStart, gridRowEnd, gridColumnStart: 3 }}>
        <p className={styles.time_group}>
          {eventData.startDate && eventData.endDate
            ? `${eventData.startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${eventData.endDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
            : "--:--"}
        </p>
        <p className={styles.title_group}>{eventData.title ?? "タイトルなし"}</p>
        <div className={styles.groupBox_wrapper}>
          {groups.map((name: string, idx: number) => {
            const isNow = nowEvents.some(
              (ne) => {
                const match = (
                  (ne.locationtype ?? '').toString().toLowerCase().trim() === locationTypeLower &&
                  Number(ne.eventid) === eventIdNum &&
                  Number(ne.groupindex) === Number(idx)
                );
                return match;
              }
            );
            return (
              <div
                key={name + '-' + idx}
                className={isNow ? `${styles.groupBox} ${styles.nowEvent}` : styles.groupBox}
                style={{
                  borderBottom: idx !== groups.length - 1 ? '1px solid #aaa' : 'none',
                  ...(isNow && { backgroundColor: 'var(--text)', color: 'black'})
                }}
                onClick={() => onRegister(locationType, Number(eventData.id), idx)}
              >
                <span style={{width: '100%'}}>{name}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // groupsなし分岐（div構造に統一）
  const isNow = nowEvents.some(
          (ne) => (
            (ne.locationtype ?? '').toString().toLowerCase().trim() === locationTypeLower &&
            Number(ne.eventid) === eventIdNum &&
            (ne.groupindex === undefined || ne.groupindex === null || Number(ne.groupindex) === 0)
          )
  );
  return (
    <div
      className={isNow ? `${styles.wrapper} ${styles.nowEvent}` : styles.wrapper}
      style={{ gridRowStart, gridRowEnd, gridColumnStart: 3 }}
      onClick={() => onRegister(locationType, Number(eventData.id))}
    >
      <p className={styles.time}>{eventData.startDate && eventData.endDate
        ? `${eventData.startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${eventData.endDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
        : "--:--"}
      </p>
      <p className={styles.title}>{eventData.title ?? "タイトルなし"}</p>
    </div>
  );
}
