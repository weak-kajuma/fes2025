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
  { label: "ステージ", value: "stage" },
  { label: "コナコピア", value: "hole" },
  { label: "中庭", value: "yard" },
  { label: "体育館", value: "gym" },
];

// ★ 追加: DBの location_name（label だったり value だったり/空白含む）を
// タイムテーブルで使う正規化済み value に揃える
const normalizeLocationName = (name?: string | null): string | undefined => {
  if (!name) return undefined;
  const trimmed = `${name}`.trim();
  if (trimmed === "all") return "all"; // 明示的な全選択だけ許可
  const hit = areaOptions.find(opt => opt.value === trimmed || opt.label === trimmed);
  return hit?.value; // 見つかったら canonical value を返す
};

export default function AdminTimetablePage() {
  // location_nameの値（APIレスポンス）
  const [selectedLocation, setSelectedLocation] = useState<string | undefined>(undefined); // 初期は未選択
  const [selectedDate, setSelectedDate] = useState<string>(dateOptions[0].value);
  const [inputPassword, setInputPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [mode, setMode] = useState<string>("");
  const [nowEvents, setNowEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useScrollSmoother();

  // 入力値をSHA-256でハッシュ化する関数
  async function hashPassword(str: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

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

  // 認証前
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
            setAuthError("");
            const inputHash = await hashPassword(inputPassword);
            // APIへPOST
            const res = await fetch("/api/admin-login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ password: inputHash })
            });
            const result = await res.json();

            if (result.success) {
              // ★ 修正ポイント：location_name が未設定/空文字のときは "全選択" にしない
              // DBの値を正規化し、マッチしない場合は未選択として扱う
              const normalized = normalizeLocationName(result.location_name);

              if (normalized) {
                setSelectedLocation(normalized);
              } else {
                setSelectedLocation(undefined);
                setAuthError("このアカウントに紐づくロケーションが不正です。管理者に確認してください。");
                return; // ロケーションが確定しない限り認証状態にしない
              }

              setIsAuthenticated(true);
              setMode(result.mode);
            } else {
              setAuthError(result.error || "パスワードが違います");
            }
          }}
        >ログイン</button>
        {authError && <div style={{ color: "red", marginTop: "1rem" }}>{authError}</div>}
      </div>
    );
  }

  // 認証後
  // location未選択なら何も表示しない
  if (selectedLocation === undefined) {
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
          </div>
          <div className={styles.eventContentWrapper}>
            {/* 許可されたロケーションが未設定 */}
            {authError && <div style={{ color: "red", marginTop: "1rem" }}>{authError}</div>}
          </div>
        </div>
      </div>
    );
  }

  // location_nameが"全選択"なら全ロケーション表示（★ 明示的に指定された場合のみ）
  if (selectedLocation === "all") {
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
          </div>
          <div className={styles.eventContentWrapper}>
            {areaOptions.map(areaOpt => {
              const events = (timetable as any[]).filter(ev => {
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

  // 通常はlocation_nameに対応したlocationのみ表示
  const areaOpt = areaOptions.find(opt => opt.value === selectedLocation);
  if (!areaOpt) return null;
  const events = (timetable as any[]).filter(ev => {
    return ev.locationType === areaOpt.value && ev.startDate.startsWith(`2025-09-${selectedDate}`);
  });
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
        </div>
        <div className={styles.eventContentWrapper}>
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
        </div>
      </div>
    </div>
  );
}
