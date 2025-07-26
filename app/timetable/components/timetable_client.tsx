"use client";

import styles from "./timetable_client.module.css";
import { useEffect, useRef, useState, useTransition } from "react";
import { getEventsBySort, EventsByLocation } from "./ServerAction";
import Link from "next/link";
import TimeTableContent from "./timetable_content";

// 日付・エリアボタン定義
const dateOptions = [
  { label: "20(土)", value: "20", className: styles.firstDate },
  { label: "21(日)", value: "21", className: styles.secondDate },
];
const areaOptions = [
  { label: "野外ステージ", value: "野外ステージ", className: styles.stage },
  { label: "コナコピアホール", value: "コナコピアホール", className: styles.hole },
  { label: "中庭", value: "中庭", className: styles.yard },
  { label: "体育館", value: "体育館", className: styles.gym },
];

export default function Timetable_Client() {
  const title_Ref = useRef<HTMLHeadingElement>(null);
  const [selectedDate, setSelectedDate] = useState<string>(dateOptions[0].value);
  const [selectedArea, setSelectedArea] = useState<string[]>([]);
  const [maxSelectableAreas, setMaxSelectableAreas] = useState<number>(3);
  const [allEventsData, setAllEventsData] = useState<{ [date: string]: EventsByLocation[] | undefined }>({});
  const [currentDisplayEvents, setCurrentDisplayEvents] = useState<EventsByLocation[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [errorLoading, setErrorLoading] = useState<string | null>(null);
  const [isTransitioningDate, startTransitionDate] = useTransition();

  const EVENT_YEAR = 2025;
  const EVENT_MONTH = 9;

  // レスポンシブ対応
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      let newMax = 3;
      if (width > 1200 - 1) newMax = 3;
      else if (width > 768 - 1) newMax = 2;
      else newMax = 1;
      setMaxSelectableAreas(prev => prev !== newMax ? newMax : prev);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 初期データロード
  useEffect(() => {
    let mounted = true;
    const fetchAllInitialData = async () => {
      setIsInitialLoading(true);
      setErrorLoading(null);
      try {
        const dataPromises = dateOptions.map(dateOpt =>
          getEventsBySort(dateOpt.value, areaOptions.map(opt => opt.value), EVENT_YEAR, EVENT_MONTH)
        );
        const results = await Promise.all(dataPromises);
        const newData: { [date: string]: EventsByLocation[] } = {};
        dateOptions.forEach((dateOpt, idx) => {
          newData[dateOpt.value] = results[idx];
        });
        if (mounted) {
          setAllEventsData(prev => JSON.stringify(prev) === JSON.stringify(newData) ? prev : newData);
          if (areaOptions.length > 0 && maxSelectableAreas > 0) {
            const initialArea = areaOptions.slice(0, maxSelectableAreas).map(opt => opt.value);
            setSelectedArea(prev => JSON.stringify(prev) === JSON.stringify(initialArea) ? prev : initialArea);
          }
        }
      } catch (err) {
        if (mounted) setErrorLoading("タイムテーブル情報の読み込みに失敗しました。");
      } finally {
        if (mounted) setIsInitialLoading(false);
      }
    };
    fetchAllInitialData();
    return () => { mounted = false; };
  }, [EVENT_YEAR, EVENT_MONTH, maxSelectableAreas]);

  // 日付・データ変更時の表示更新
  useEffect(() => {
    if (selectedDate && allEventsData[selectedDate]) {
      const newEvents = allEventsData[selectedDate] || [];
      setCurrentDisplayEvents(prev => JSON.stringify(prev) === JSON.stringify(newEvents) ? prev : newEvents);
    } else if (selectedDate && !allEventsData[selectedDate] && !isInitialLoading) {
      setCurrentDisplayEvents(prev => prev.length === 0 ? prev : []);
    }
  }, [selectedDate, allEventsData, isInitialLoading]);

  // maxSelectableAreas変更時のエリア選択調整
  useEffect(() => {
    if (isInitialLoading) return;
    setSelectedArea(prev => {
      let newSelected = [...prev];
      if (newSelected.length > maxSelectableAreas) {
        newSelected = newSelected.slice(newSelected.length - maxSelectableAreas);
      } else if (newSelected.length < maxSelectableAreas && newSelected.length < areaOptions.length) {
        const set = new Set(newSelected);
        const needed = maxSelectableAreas - newSelected.length;
        const candidates = areaOptions.filter(opt => !set.has(opt.value)).slice(0, needed);
        newSelected.push(...candidates.map(opt => opt.value));
      }
      if (maxSelectableAreas === 0) newSelected = [];
      if (JSON.stringify(prev) === JSON.stringify(newSelected)) return prev;
      return newSelected;
    });
  }, [maxSelectableAreas, isInitialLoading]);

  // 現在時刻バーの計算
  const [currentRow, setCurrentRow] = useState(2); // 初期値はヘッダーの次の行 (2行目)

  useEffect(() => {
    const calculateCurrentRow = () => {
      const now = new Date();
      const startTime = new Date();
      startTime.setHours(8, 30, 0, 0); // 基準時刻 8:30
      const endTime = new Date();
      endTime.setHours(15, 30, 0, 0); // 終了時刻 15:30

      let newRow = 2;
      if (now < startTime) {
        newRow = 2;
      } else if (now >= endTime) {
        newRow = 422 + 2;
      } else {
        const diffInMinutes = Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60));
        newRow = diffInMinutes + 2;
      }
      setCurrentRow(prev => prev === newRow ? prev : newRow);
    };

    calculateCurrentRow();
    const intervalId = setInterval(calculateCurrentRow, 60000);
    return () => clearInterval(intervalId);
  }, []);

  // イベントカード
  const EventCard = ({ event }: { event: any }) => {
    // 8:30基準でグリッド計算
    const getGridRow = (timeStr?: string | null) => {
      if (!timeStr) return 2;
      const [h, m] = timeStr.split(":").map(Number);
      const baseMinutes = 8 * 60 + 30;
      const eventMinutes = h * 60 + m;
      return 2 + (eventMinutes - baseMinutes);
    };
    const gridRowStart = getGridRow(event.displayTimeStartTime);
    const gridRowEnd = getGridRow(event.displayTimeEndTime);
    return (
      <div
        className={styles.event}
        style={{
          gridRowStart,
          gridRowEnd,
          gridColumnStart: 3,
          background: "var(--location-primary-color, #eee)",
          borderRadius: "10px",
          margin: "2px auto",
          width: "90%",
          position: "absolute",
        }}
      >
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)", textAlign: "center", width: "100%"
        }}>
          {event.title ?? "タイトルなし"}
        </div>
      </div>
    );
  };

  // locationTypeをCSSクラス名に変換
  const formatLocationToClassName = (locationType: string | null): string => {
    if (!locationType) {
      return styles.locationDefault || 'locationDefault';
    }
    const sanitized = locationType.replace(/\s+/g, '');
    return styles[`location${sanitized}`] || styles.locationDefault || `location${sanitized}`;
  };

  return (
    <div className={styles.main}>
      <h2 className={styles.title} ref={title_Ref}>TIME TABLE</h2>
      <div className={styles.selector}>
        <div className={styles.dateSelector}>
          {dateOptions.map(dateOpt => (
            <button
              key={dateOpt.label}
              className={`${dateOpt.className} ${styles.button} ${selectedDate === dateOpt.value ? styles.selected : ""}`}
              onClick={() => setSelectedDate(dateOpt.value)}
            >
              {dateOpt.label}
            </button>
          ))}
        </div>
        <div className={styles.areaSelector}>
          {areaOptions.map(areaOpt => (
            <button
              key={areaOpt.label}
              className={`${areaOpt.className} ${styles.button} ${selectedArea.includes(areaOpt.value) ? styles.selected : ""}`}
              onClick={() => {
                setSelectedArea(prev => {
                  const idx = prev.indexOf(areaOpt.value);
                  const newSelected = [...prev];
                  // 選択解除は、選択数がmaxSelectableAreasより大きい時だけ許可
                  if (idx > -1) {
                    if (newSelected.length > maxSelectableAreas) {
                      newSelected.splice(idx, 1);
                    }
                    // それ未満の時は何もしない
                  } else {
                    if (newSelected.length >= maxSelectableAreas && maxSelectableAreas > 0) newSelected.shift();
                    if (maxSelectableAreas > 0) newSelected.push(areaOpt.value);
                  }
                  return newSelected;
                });
              }}
              disabled={maxSelectableAreas === 0 && !selectedArea.includes(areaOpt.value)}
            >
              {areaOpt.label}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.eventContentWrapper}>
        {isInitialLoading && <div className={styles.loading}>タイムテーブルを読み込んでいます...</div>}
        {errorLoading && <div className={styles.error}>{errorLoading}</div>}
        {!isInitialLoading && !errorLoading && (
          currentDisplayEvents.length > 0 && currentDisplayEvents.map(({ locationType, events }) => (
            <div
              key={`${selectedDate}-${locationType}`}
              style={{ display: selectedArea.includes(locationType) ? 'grid' : 'none' }}
              className={`${styles.eventLocationContainer} ${formatLocationToClassName(locationType)}`}
            >
              {/* 現在時刻バー */}
              <div className={styles.bar} style={{ '--current-row': currentRow } as React.CSSProperties}></div>
              {/* ラベル */}
              <div className={styles.label}>
                <Link href="">
                  <div className={styles.label_inner}>
                    {locationType}
                  </div>
                </Link>
              </div>
              <div className={styles.box}></div>
              <div className={styles.background}></div>
              {/* 時間ラベル */}
              <div className={styles.timeText}>8:30</div>
              <div className={styles.timeText}>9:00</div>
              <div className={styles.timeText}>10:00</div>
              <div className={styles.timeText}>11:00</div>
              <div className={styles.timeText}>12:00</div>
              <div className={styles.timeText}>13:00</div>
              <div className={styles.timeText}>14:00</div>
              <div className={styles.timeText}>15:00</div>
              <div className={styles.timeText}>15:30</div>
              {/* タイムバー（必要な数だけ） */}
              {[...Array(17)].map((_, i) => (
                <div key={i} className={styles.timeBar}></div>
              ))}
              {/* イベント */}
              {events.map(event => (
                <TimeTableContent key={event.id} eventData={event} />
              ))}
            </div>
          ))
        )}
        {isTransitioningDate && !isInitialLoading && <div className={styles.loadingOverlay}>情報を更新中...</div>}
      </div>
      <div className={styles.wrapper}></div>
    </div>
  );
}