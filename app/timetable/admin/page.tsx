"use client";


import Link from "next/link";
import { useEffect, useState } from "react";

import { useScrollSmoother } from "@/components/ScrollSmoother";
import { supabase } from '@/lib/supabaseClient';
import timetable from "@/public/data/timetable.json";

import AdminTimeTableContentDetail from "../components/content_detail/admin_timetable_content_detail";
import styles from "../components/timetable_client.module.css";

const dateOptions = [
  { label: "20(Sat)", value: "20" },
  { label: "21(Sun)", value: "21" },
];
const areaOptions = [
  { label: "ステージ", value: "グラウンドステージ" },
  { label: "コナコピア", value: "コナコピアホール" },
  { label: "中庭", value: "中庭" },
  { label: "体育館", value: "体育館" },
];


export default function AdminTimetablePage() {
    // ロケーションtypeを固定するstate
  const [selectedLocationType, setSelectedLocationType] = useState<string | null>(null);

  useScrollSmoother();

  // 入力値をSHA-256でハッシュ化する関数
  async function hashPassword(str: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  const [inputPassword, setInputPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [mode, setMode] = useState<string>("");

  // 管理画面のstate
  const [selectedDate, setSelectedDate] = useState<string>(dateOptions[0].value);
  const [selectedArea, setSelectedArea] = useState<string[]>(areaOptions.map(opt => opt.value));
  const [nowEvents, setNowEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchNowEvents = async () => {
      const { data, error } = await supabase.from('now_events').select('*');
      if (!error) setNowEvents(data ?? []);
    };
    fetchNowEvents();
  }, [isAuthenticated]);

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

  // パスワード未認証の場合はフォーム表示
  if (!isAuthenticated) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <h2>管理者ページパスワード入力</h2>
        <input
          type="password"
          value={inputPassword}
          onChange={e => { setInputPassword(e.target.value); }}
          placeholder="パスワード"
          style={{ fontSize: "1.5rem", padding: "0.5rem", marginBottom: "1rem" }}
        />
        <button
          style={{ fontSize: "1.2rem", padding: "0.5rem 1rem" }}
          onClick={async () => {
            const inputHash = await hashPassword(inputPassword);
            // APIへPOST
            const res = await fetch("/api/admin-login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ password: inputHash })
            });
            const result = await res.json();
            if (result.success) {
              setIsAuthenticated(true);
              setMode(result.mode);
              setAuthError("");
              // location_nameの値だけsetSelectedLocationTypeにセットし、選択バーは非表示
              if (result.location_name == null) {
                setSelectedArea(areaOptions.map(opt => opt.value));
                setSelectedLocationType(null);
              } else {
                setSelectedLocationType(result.location_name);
                setSelectedArea([result.location_name]);
              }
            } else {
              setAuthError(result.error || "パスワードが違います");
            }
          }}
        >ログイン</button>
        {authError && <div style={{ color: "red", marginTop: "1rem" }}>{authError}</div>}
      </div>
    );
  }

  // 認証済みの場合は管理画面表示
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
                  onClick={() => { setSelectedDate(dateOpt.value); }}
                >
                  {dateOpt.label}
                </div>
              ))}
            </div>
          </div>
          {/* location_nameがnull（全表示）の場合のみロケーション選択UIを表示。 */}
          {selectedLocationType === null && selectedArea.length > 0 && (
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
                          // 1つだけ残る場合は消さない
                          if (prev.length === 1) return prev;
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
          )}
        </div>
        <div className={styles.eventContentWrapper}>
          {areaOptions.map(areaOpt => {
            // location_nameが指定されている場合はそのロケーションtypeのみ表示
            if (selectedLocationType && areaOpt.value !== selectedLocationType) return null;
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
                        locationType: event.locationType,
                        startDate: event.startDate ? event.startDate.replace(' ', 'T') : null,
                        endDate: event.endDate ? event.endDate.replace(' ', 'T') : null
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
