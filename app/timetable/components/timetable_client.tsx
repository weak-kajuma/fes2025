"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";

import useRevealer from "@/app/hooks/useRevealer";
import { useScrollSmoother } from "@/components/ScrollSmoother";
import { fetchLocalJson } from "@/lib/fetchLocalJson";
import { supabase } from '@/lib/supabaseClient';


import TimeTableContent from "./content/timetable_content";
import TimeTableContentDetail from "./content_detail/timetable_content_detail";
import styles from "./timetable_client.module.css";



// 日付・エリアボタン定義
const dateOptions = [
  { label: "20(Sat)", value: "20", className: styles.firstDate },
  { label: "21(Sun)", value: "21", className: styles.secondDate },
];
const areaOptions = [
  { label: "ステージ", value: "グラウンドステージ", className: styles.stage },
  { label: "コナコピア", value: "コナコピアホール", className: styles.hole },
  { label: "中庭", value: "中庭", className: styles.yard },
  { label: "体育館", value: "体育館", className: styles.gym },
];

type EventData = {
  idx: number;
  id: number;
  title: string;
  subtitle: string | null;
  description: string | null;
  startDate: string;
  endDate: string;
  locationType: string;
  groups?: { name: string, startDate: string, endDate: string }[];
}

type EventsByLocation = {
  locationType: string;
  events: EventData[];
};

export default function Timetable_Client() {
  // 表示モード: 通常/詳細
  const [isDetailMode, setIsDetailMode] = useState(false);
  useRevealer();

  const title_Ref = useRef<HTMLHeadingElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const [selectedDate, setSelectedDate] = useState<string>(dateOptions[0].value);
  const [selectedArea, setSelectedArea] = useState<string[]>([]);
  const [maxSelectableAreas, setMaxSelectableAreas] = useState<number>(3);
  const [allEventsData, setAllEventsData] = useState<Record<string, EventsByLocation[] | undefined>>({});
  const [currentDisplayEvents, setCurrentDisplayEvents] = useState<EventsByLocation[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [errorLoading, setErrorLoading] = useState<string | null>(null);
  const [isTransitioningDate, startTransitionDate] = useTransition();

  const EVENT_YEAR = 2025;
  const EVENT_MONTH = 9;

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.matchMedia('(max-width: 768px)').matches);
    }
  }, []);

  // LocomotiveScrollの初期化（トップレベルで呼び出し）
  useScrollSmoother();

  // レスポンシブ対応
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      let newMax = 3;
      if (width > 1200 - 1) newMax = 3;
      else if (width > 768 + 1) newMax = 2;
      else newMax = 1;
      setMaxSelectableAreas(prev => prev !== newMax ? newMax : prev);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => { window.removeEventListener("resize", handleResize); };
  }, []);

  // 初期データロード
  useEffect(() => {
    let mounted = true;
    const fetchAllInitialData = async () => {
      setIsInitialLoading(true);
      setErrorLoading(null);
      try {
        // --- 切り替え用 ---
        // ▼ローカルJSONからフェッチする場合はこちらを有効化
        const timetableData = await fetchLocalJson<EventData[]>("/data/timetable.json");
        const newData: Record<string, EventsByLocation[]> = {};
        dateOptions.forEach(dateOpt => {
          const dateStr = `2025-09-${dateOpt.value}`;
          const filtered = timetableData.filter(ev => ev.startDate?.startsWith(dateStr));
          newData[dateOpt.value] = areaOptions.map(opt => {
            const events = filtered.filter(ev => ev.locationType === opt.value);
            return { locationType: opt.value, events };
          });
        });

        // ▼一時公開用（空データ即返却）
        // const newData: { [date: string]: EventsByLocation[] } = {};
        // dateOptions.forEach(dateOpt => {
        //   newData[dateOpt.value] = areaOptions.map(opt => ({ locationType: opt.value, events: [] }));
        // });

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
    return () => { clearInterval(intervalId); };
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

  // GSAP横スクロールテキスト
  useEffect(() => {
    if (!railRef.current) return;
    // 動的importでSSR回避
    (async () => {
      const gsap = (await import("gsap")).default;
      const { Observer } = await import("gsap/Observer");
      gsap.registerPlugin(Observer);

      // horizontalLoop関数
      function horizontalLoop(items: Element[], config: any = {}) {
        items = Array.from(items);
        const tl = gsap.timeline({
          repeat: config.repeat,
          paused: config.paused,
          defaults: { ease: "none" },
          onReverseComplete: () => { tl.totalTime(tl.rawTime() + tl.duration() * 100); return; }
        });
        let length = items.length,
          startX = (items[0] as HTMLElement).offsetLeft,
          times: number[] = [],
          widths: number[] = [],
          xPercents: number[] = [],
          curIndex = 0,
          pixelsPerSecond = (config.speed || 1) * 100,
          snap = config.snap === false ? (v: number) => v : gsap.utils.snap(config.snap || 1),
          totalWidth, curX, distanceToStart, distanceToLoop, item, i;
        gsap.set(items, {
          xPercent: (i: number, el: Element) => {
            const w = widths[i] = parseFloat(gsap.getProperty(el, "width", "px") as string);
            xPercents[i] = snap(parseFloat(gsap.getProperty(el, "x", "px") as string) / w * 100 + (gsap.getProperty(el, "xPercent") as number));
            return xPercents[i];
          }
        });
        gsap.set(items, { x: 0 });
        totalWidth = (items[length - 1] as HTMLElement).offsetLeft + xPercents[length - 1] / 100 * widths[length - 1] - startX + (items[length - 1] as HTMLElement).offsetWidth * (gsap.getProperty(items[length - 1], "scaleX") as number) + (parseFloat(config.paddingRight) || 0);
        for (i = 0; i < length; i++) {
          item = items[i];
          curX = xPercents[i] / 100 * widths[i];
          distanceToStart = (item as HTMLElement).offsetLeft + curX - startX;
          distanceToLoop = distanceToStart + widths[i] * (gsap.getProperty(item, "scaleX") as number);
          tl.to(item, { xPercent: snap((curX - distanceToLoop) / widths[i] * 100), duration: distanceToLoop / pixelsPerSecond }, 0)
            .fromTo(item, { xPercent: snap((curX - distanceToLoop + totalWidth) / widths[i] * 100) }, { xPercent: xPercents[i], duration: (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond, immediateRender: false }, distanceToLoop / pixelsPerSecond)
            .add("label" + i, distanceToStart / pixelsPerSecond);
          times[i] = distanceToStart / pixelsPerSecond;
        }
        function toIndex(index: number, vars: any = {}) {
          (Math.abs(index - curIndex) > length / 2) && (index += index > curIndex ? -length : length);
          let newIndex = gsap.utils.wrap(0, length, index),
            time = times[newIndex];
          if ((time > tl.time()) !== (index > curIndex)) {
            vars.modifiers = { time: gsap.utils.wrap(0, tl.duration()) };
            time += tl.duration() * (index > curIndex ? 1 : -1);
          }
          curIndex = newIndex;
          vars.overwrite = true;
          return tl.tweenTo(time, vars);
        }
        tl.next = (vars: any) => toIndex(curIndex + 1, vars);
        tl.previous = (vars: any) => toIndex(curIndex - 1, vars);
        tl.current = () => curIndex;
        tl.toIndex = (index: number, vars: any) => toIndex(index, vars);
        tl.times = times;
        tl.progress(1, true).progress(0, true);
        if (config.reversed) {
          tl.reverse();
        }
        return tl;
      }

      if (!railRef.current) return;
      const scrollingText = Array.from(railRef.current.querySelectorAll("h4"));
      const tl = horizontalLoop(scrollingText, {
        repeat: -1,
        paddingRight: 150,
      });

      Observer.create({
        target: railRef.current,
        type: "wheel,touch",
        onChangeY(self) {
          let factor = 2.5;
          if (self.deltaY < 0) {
            factor *= -1;
          }
          gsap.timeline({ defaults: { ease: "none" } })
            .to(tl, { timeScale: factor * 2.5, duration: 0.2, overwrite: true })
            .to(tl, { timeScale: factor / 2.5, duration: 1 }, "+=0.3");
        }
      });
    })();
  }, []);

  type SupabaseNowEvent = {
    id: number;
    locationtype: string;
    eventid: number;
    groupindex?: number | null;
    updatedat: string;
  };

  type NowEvent = {
    id: number;
    locationType: string;
    eventId: number;
    groupIndex?: number | null;
    updatedAt?: string;
    startDate?: string;
    endDate?: string;
  };
  const [nowEvents, setNowEvents] = useState<NowEvent[]>([]);
  useEffect(() => {
    // Supabaseからnow_eventsをフェッチ
    const fetchNowEvents = async () => {
      const { data, error } = await supabase.from('now_events').select('*');
      if (error) {
        console.error('now_events fetch error:', error);
        return;
      }

      // --- eventとgroupを平らに並べる
      const timetableData = await fetchLocalJson<EventData[]>("/data/timetable.json");
      const flat: NowEvent[] = timetableData.flatMap((ev) => {
        if (ev.groups && ev.groups.length > 0) {
          return ev.groups.map((g, gi) => ({
            id: ev.id * 100 + (gi + 1), // 例: eventId=12, gi=0 → 1201
            locationType: ev.locationType,
            eventId: ev.id,
            groupIndex: gi,
            startDate: g.startDate,
            endDate: g.endDate,
          }));
        } else {
          return [
            {
              id: ev.id * 100, // グループ無しは "xx00"
              locationType: ev.locationType,
              eventId: ev.id,
              groupIndex: -1, // グループ無しは -1
              startDate: ev.startDate,
              endDate: ev.endDate,
            },
          ];
        }
      });
      const byLocation = flat.reduce<Record<string, NowEvent[]>>((acc, cur) => {
        (acc[cur.locationType] ??= []).push(cur);
        return acc;
      }, {});
      for (const key of Object.keys(byLocation)) {
        byLocation[key].sort((a, b) => a.startDate && b.startDate ? new Date(a.startDate).getTime() - new Date(b.startDate).getTime() : 0);
      }

      const getEventById = (
        byLocation: Record<string, NowEvent[]>,
        location: string,
        eventId: number,
        groupIndex?: number
      ): NowEvent | undefined => {
        const list = byLocation[location];
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!list) return undefined;

        const gi = groupIndex ?? -1; // undefined を -1 に潰して比較
        return list.find(
          (e) => e.eventId === eventId && ((e.groupIndex ?? -1) === gi)
        );
      };

      const getEventByTime = (
        byLocation: Record<string, NowEvent[]>,
        location: string,
        time: Date
      ): NowEvent | undefined => {
        const list = byLocation[location];
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!list) return undefined;

        // 1) 正常な区間のみ抽出し、必要ならソート
        const validEvents = list.filter(e => e.startDate && e.endDate).sort((a, b) => {
          if (!a.startDate || !b.startDate) return 0;
          return (new Date(a.startDate).getTime()) - (new Date(b.startDate).getTime());
        });
        // 2) timeがstart-endの間にある最初のイベントを返す
        for (const ev of validEvents) {
          if (!ev.startDate || !ev.endDate) continue;
          const start = new Date(ev.startDate);
          const end = new Date(ev.endDate);
          if (start <= time && time <= end) {
            return ev;
          }
        }
        // 3) もしどのイベントにも属さない場合、2分以内の隙間なら一番近い側を返す
        const GAP_MS = 2 * 60 * 1000; // 2分
        const t = time.getTime();

        // 二分探索: startDate > t となる最初のインデックス
        let lo = 0, hi = validEvents.length;
        while (lo < hi) {
          const mid = (lo + hi) >>> 1;
          const ms = validEvents[mid].startDate ? (new Date(validEvents[mid].startDate)).getTime() : 0;
          if (ms > t) hi = mid;
          else lo = mid + 1;
        }
        const idx = lo;

        const toMs = (s?: string) => (s ? (new Date(s)).getTime() : Number.NaN);
        const prev = idx - 1 >= 0 ? validEvents[idx - 1] : undefined;
        const next = idx < validEvents.length ? validEvents[idx] : undefined;

        // 先頭より前：最初の開始に近ければ採用
        if (!prev && next) {
          const d = Math.abs(toMs(next.startDate) - t);
          if (d <= GAP_MS) return next;
          return undefined;
        }

        // 末尾より後：最後の終了に近ければ採用
        if (prev && !next) {
          const d = Math.abs(t - toMs(prev.endDate));
          if (d <= GAP_MS) return prev;
          return undefined;
        }

        // 2つの区間に挟まれている場合：両端の近い方（同距離は未来側）を返す
        if (prev && next) {
          const endPrev = toMs(prev.endDate);
          const startNext = toMs(next.startDate);
          if (t >= endPrev && t <= startNext) {
            const dPrev = Math.abs(t - endPrev);
            const dNext = Math.abs(startNext - t);
            const minD = Math.min(dPrev, dNext);
            if (minD <= GAP_MS) return dNext <= dPrev ? next : prev;
          }
        }

        return undefined;
      };

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const now_events = (data as SupabaseNowEvent[] ?? []).map(ev => {
        const ne = getEventById(byLocation, ev.locationtype, ev.eventid, ev.groupindex ?? undefined);

        // TODO: テスト用に現在時刻を固定（本番ではコメントアウトして実際の現在時刻を使う）
        // const now_time = new Date("2025-09-20T13:00:00+09:00"); // テスト用固定時刻
        const now_time = new Date(); // 実際の現在時刻

        const updatedAtMs = Date.parse(ev.updatedat);
        const startMs = Date.parse((ne?.startDate ?? '').replace(' ', 'T') + '+09:00');
        const expect_now_time = new Date(now_time.getTime() - updatedAtMs + startMs);
        return getEventByTime(byLocation, ev.locationtype, expect_now_time);
      });


      setNowEvents(now_events.filter((ev): ev is NowEvent => !!ev));
    };
    void fetchNowEvents();
    // 10秒ごとにポーリング
    const intervalId = setInterval(fetchNowEvents, 10000);
    return () => { clearInterval(intervalId); };
  }, []);

  return (
    <>
      <div className={styles.revealer} data-reveal></div>

      <div data-smooth-wrapper>
        <div className={styles.main} data-scroll-container>

          <div className={styles.scrolling_text}>
            <div className={styles.rail} ref={railRef}>
              <h4 className={styles.rail_text}>Time Table</h4>
              <h4 className={styles.rail_text}>Time Table</h4>
              <h4 className={styles.rail_text}>Time Table</h4>
            </div>
          </div>

          {/* タイムテーブル表示切替ボタン */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
            {[{ label: 'Normal', value: false }, { label: 'Detail', value: true }].map(btn => (
              <div
                key={btn.label}
                onClick={() => { setIsDetailMode(btn.value); }}
                style={{
                  color: "black",
                  padding: '0.5rem 1.5rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  backgroundColor: "transparent",
                  fontSize: "2rem",
                  fontFamily: "var(--mincho)",
                  position: 'relative',
                  display: 'inline-block',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => {
                  const underline = e.currentTarget.querySelector('.underline-anim');
                  if (underline) (underline as HTMLElement).style.transform = 'scaleX(1)';
                }}
                onMouseLeave={e => {
                  const underline = e.currentTarget.querySelector('.underline-anim');
                  if (underline) (underline as HTMLElement).style.transform = 'scaleX(0)';
                }}
              >
                {btn.label}
                <span
                  className="underline-anim"
                  style={{
                    position: 'absolute',
                    left: 0,
                    bottom: 0,
                    width: '100%',
                    height: '1px',
                    background: 'black',
                    transform: 'scaleX(0)',
                    transformOrigin: 'left',
                    transition: 'transform 0.3s cubic-bezier(.4,0,.2,1)',
                    borderRadius: '2px',
                  }}
                />
              </div>
            ))}
          </div>

          <div className={styles.nav}>
            <div className={styles.nav_content}>
              <div className={`${styles.nav_item} ${styles.pre}`}>Date</div>
              <div className={styles.nav_item_back_wrapper}>
                  {dateOptions.map(dateOpt => (
                    <div
                      key={dateOpt.label}
                      className={`${dateOpt.className} ${styles.nav_item} ${styles.nav_item_back} ${selectedDate === dateOpt.value ? styles.selected : ""}`}
                      onClick={() => { setSelectedDate(dateOpt.value); }}
                    >
                      {dateOpt.label}
                    </div>
                  ))}
              </div>
            </div>
            <div className={styles.nav_content}>
              <div className={`${styles.nav_item} ${styles.pre}`}>Location</div>
              <div className={styles.nav_item_back_wrapper}>
                {areaOptions.map(areaOpt => (
                  <div
                    key={areaOpt.label}
                    className={`${areaOpt.className} ${styles.nav_item} ${styles.nav_item_back} ${selectedArea.includes(areaOpt.value) ? styles.selected : ""}`}
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
                    style={maxSelectableAreas === 0 && !selectedArea.includes(areaOpt.value) ? { pointerEvents: "none", opacity: 0.5 } : {}}
                  >
                    {areaOpt.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.eventContentWrapper}>
            {isInitialLoading && <div className={styles.loading}>タイムテーブルを読み込んでいます...</div>}
            {errorLoading && <div className={styles.error}>{errorLoading}</div>}
            {!isInitialLoading && !errorLoading && (
              currentDisplayEvents.length > 0 && currentDisplayEvents.map(({ locationType, events }) => (
                isDetailMode ? (
                  selectedArea.includes(locationType) ? (
                    <div className={styles.detail_wrapper} key={`${selectedDate}-${locationType}`}>
                      <p>現在行われている演目</p>
                      <div className={styles.nowEvent}>
                        {(() => {
                          // --- 切り替え用 ---
                          // ▼ローカルJSONからフェッチする場合はこちらを有効化
                          const timetable: EventData[] = require("@/public/data/timetable.json");

                          // ▼一時公開用（空データ即返却）
                          // const timetable: any[] = [];

                          const nowEvent = nowEvents.find(ev => (ev.locationType ?? '').toLowerCase().trim() === (locationType ?? '').toLowerCase().trim());
                          if (!nowEvent) return <span>なし</span>;
                          const event = timetable.find((ev: any) => ev.id === nowEvent.eventId);
                          if (!event) return <span>なし</span>;
                          const title = event.title || "タイトルなし";
                          let groupName = null;
                          if (event.groups && Array.isArray(event.groups) && typeof nowEvent.groupIndex === "number") {
                            groupName = event.groups[nowEvent.groupIndex].name || null;
                          }
                          if (!title && !groupName) return <span>なし</span>;
                          return (
                            <>
                              <span>{title}</span>
                              {groupName && <span style={{marginLeft: '1em'}}>{groupName}</span>}
                            </>
                          );
                        })()}
                      </div>
                      <div
                        key={`${selectedDate}-${locationType}`}
                        style={{ display: 'grid' }}
                        className={`${styles.eventLocationContainer_detail} ${formatLocationToClassName(locationType)}`}
                      >
                        <div className={styles.bar} style={{ '--current-row': currentRow } as React.CSSProperties}></div>
                        <div className={styles.label}>
                          <Link href="">
                            <div className={styles.label_inner}>
                              {locationType}
                            </div>
                          </Link>
                        </div>
                        <div className={styles.box}></div>
                        <div className={styles.background}></div>
                        <div className={styles.timeText}>8:30</div>
                        <div className={styles.timeText}>9:00</div>
                        <div className={styles.timeText}>10:00</div>
                        <div className={styles.timeText}>11:00</div>
                        <div className={styles.timeText}>12:00</div>
                        <div className={styles.timeText}>13:00</div>
                        <div className={styles.timeText}>14:00</div>
                        <div className={styles.timeText}>15:00</div>
                        <div className={styles.timeText}>15:30</div>
                        {[...Array(17)].map((_, i) => (
                          <div key={i} className={styles.timeBar}></div>
                        ))}
                        {events.map(event => (
                          <TimeTableContentDetail key={event.id} eventData={event} nowEvents={nowEvents} locationType={locationType} />
                        ))}
                      </div>
                    </div>
                  ) : null
                ) : (
                  <div
                    key={`${selectedDate}-${locationType}`}
                    style={{ display: selectedArea.includes(locationType) ? 'grid' : 'none' }}
                    className={`${styles.eventLocationContainer} ${formatLocationToClassName(locationType)}`}
                  >
                    <div className={styles.bar} style={{ '--current-row': currentRow } as React.CSSProperties}></div>
                    <div className={styles.label}>
                      <Link href="">
                        <div className={styles.label_inner}>
                          {locationType}
                        </div>
                      </Link>
                    </div>
                    <div className={styles.box}></div>
                    <div className={styles.background}></div>
                    <div className={styles.timeText}>8:30</div>
                    <div className={styles.timeText}>9:00</div>
                    <div className={styles.timeText}>10:00</div>
                    <div className={styles.timeText}>11:00</div>
                    <div className={styles.timeText}>12:00</div>
                    <div className={styles.timeText}>13:00</div>
                    <div className={styles.timeText}>14:00</div>
                    <div className={styles.timeText}>15:00</div>
                    <div className={styles.timeText}>15:30</div>
                    {[...Array(17)].map((_, i) => (
                      <div key={i} className={styles.timeBar}></div>
                    ))}
                    {!isDetailMode && events.map(event => (
                      <TimeTableContent key={event.id} eventData={event} />
                    ))}
                  </div>
                )
              ))
            )}
            {isTransitioningDate && !isInitialLoading && <div className={styles.loadingOverlay}>情報を更新中...</div>}
          </div>

        </div>
      </div>
    </>
  );
}
