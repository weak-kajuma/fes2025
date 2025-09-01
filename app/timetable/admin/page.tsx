"use client";


import styles from "../components/timetable_client.module.css";
import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabaseClient';
import Link from "next/link";
import timetable from "@/public/data/timetable.json";
import TimeTableContentDetail from "../components/content_detail/timetable_content_detail";
import AdminTimeTableContentDetail from "../components/content_detail/admin_timetable_content_detail";
import { useScrollSmoother } from "@/components/ScrollSmoother";

const dateOptions = [
  { label: "20(Sat)", value: "20" },
  { label: "21(Sun)", value: "21" },
];
const areaOptions = [
  { label: "ステージ", value: "野外ステージ" },
  { label: "コナコピア", value: "コナコピアホール" },
  { label: "中庭", value: "中庭" },
  { label: "体育館", value: "体育館" },
];

export default function AdminTimetablePage() {
  useScrollSmoother();

  const [selectedDate, setSelectedDate] = useState<string>(dateOptions[0].value);
  const [selectedArea, setSelectedArea] = useState<string[]>(areaOptions.map(opt => opt.value));
  const [nowEvents, setNowEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchNowEvents = async () => {
      const { data, error } = await supabase.from('now_events').select('*');
      if (!error) setNowEvents(data ?? []);
    };
    fetchNowEvents();
  }, []);

  // DB登録
  const handleRegister = async (locationtype: string, eventid: number, groupindex?: number) => {
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.from("now_events").upsert([
      { locationtype, eventid, groupindex }
    ], { onConflict: "locationtype" });
    setLoading(false);
    if (error) {
      setMessage("登録失敗: " + error.message);
    } else {
      setMessage("登録しました");
      // 再取得
      const { data } = await supabase.from('now_events').select('*');
      setNowEvents(data ?? []);
    }
  };

  console.log(nowEvents);

  // timetable_clientと同じ詳細レイアウト
  return (
    <div data-smooth-wrapper>
      <div className={styles.main} data-scroll-container>
        <div className={styles.nav}>
          <div className={styles.nav_content}>
            <div className={`${styles.nav_item} ${styles.pre}`}>Date</div>
            <div className={styles.nav_item_back_wrapper}>
              {dateOptions.map(dateOpt => (
                <div
                  key={dateOpt.label}
                  className={`${styles.nav_item} ${selectedDate === dateOpt.value ? styles.selected : ""}`}
                  onClick={() => setSelectedDate(dateOpt.value)}
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
                  className={`${styles.nav_item} ${selectedArea.includes(areaOpt.value) ? styles.selected : ""}`}
                  onClick={() => {
                    setSelectedArea(prev => {
                      const idx = prev.indexOf(areaOpt.value);
                      const newSelected = [...prev];
                      if (idx > -1) {
                        newSelected.splice(idx, 1);
                      } else {
                        newSelected.push(areaOpt.value);
                      }
                      return newSelected;
                    });
                  }}
                >
                  {areaOpt.label}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.eventContentWrapper}>
          {areaOptions.map(areaOpt => {
            if (!selectedArea.includes(areaOpt.value)) return null;
            const events = timetable.filter(ev => {
              return ev.locationType === areaOpt.value && ev.startDate.startsWith(`2025-09-${selectedDate}`);
            });
            return (
              <div key={areaOpt.value} className={styles.detail_wrapper}>
                <div className={styles.eventLocationContainer_detail}>
                  <div className={styles.bar}></div>
                  <div className={styles.label}>
                    <Link href="">
                      <div className={styles.label_inner}>{areaOpt.value}</div>
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
                    <AdminTimeTableContentDetail
                      key={event.id}
                      eventData={{
                        ...event,
                        location: event.locationType,
                        startDate: event.startDate ? new Date(event.startDate.replace(' ', 'T')) : null,
                        endDate: event.endDate ? new Date(event.endDate.replace(' ', 'T')) : null
                      }}
                      nowEvents={nowEvents}
                      locationType={areaOpt.value}
                      onRegister={handleRegister}
                      loading={loading}
                    />
                  ))}
                </div>
                {message && <div className={styles.message}>{message}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
