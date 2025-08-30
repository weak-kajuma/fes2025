"use client";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams , useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { deserializeEvent } from "./eventReserveUtils";
import { useEventContext } from "../EventContext";
import { supabase } from "@/lib/supabaseClient";
import styles from "./page.module.css";
import { update } from "three/examples/jsm/libs/tween.module.js";

type HourFilter = "all" | "11" | "12" | "13" | "14";

export default function EventReserveClient() {
  // 予約者名
  const [userName, setUserName] = useState<string>("");
  const [reservedUserName, setReservedUserName] = useState<string>("");
  const { event, setEvent } = useEventContext();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");
  const [hourFilter, setHourFilter] = useState<HourFilter>("all");
  const [showHourMenu, setShowHourMenu] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [showTimeMenu, setShowTimeMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const [currentWishIndex, setCurrentWishIndex] = useState<number>(0);

  // イベント情報はevent変数
  // hourプロパティでフィルタ（event.hourが"11"など）
  const filteredEvent = (!event || hourFilter === "all" || String(event.hour) === hourFilter) ? event : null;

  // ImplementationTime分割
  const times = event?.ImplementationTime?.split(",") ?? [];
  // controllerでフィルター
  const [timeFilter, setTimeFilter] = useState<string>("all");
  type FilteredTimesProps = {
    times: string[];
    timeFilter: string;
  }

  const filteredTimes: string[] = timeFilter === "all" ? times : times.filter((t: string) => t.startsWith(timeFilter));

  // 時間帯リスト（11,12,14など）を自動抽出
  const hourList = Array.from(new Set(times.map((t: string | any[]) => t.slice(0,2))));

    useEffect(() => {
      if (!eventId) return;
      (async () => {
        try {
          const events = await import("@/public/data/events_7days.json");
          const found = events.default?.find((ev: any) => String(ev.id) === String(eventId));
          if (found) setEvent(found);
        } catch (e) {
          // fallback: fetchLocalJson
          try {
            const events = await (await fetch("/data/events_7days.json")).json();
            const found = events.find((ev: any) => String(ev.id) === String(eventId));
            if (found) setEvent(found);
          } catch {}
        }
      })();
    }, [eventId, setEvent]);

  // localStorageのgoogle_user_nameが変化した場合にもuserNameを反映
  useEffect(() => {
    const reservedName = window.localStorage.getItem("reserved_user_name");
    if (reservedName && reservedName !== userName) {
      setUserName(reservedName);
      setReservedUserName(reservedName);
    } else {
      const googleName = window.localStorage.getItem("google_user_name");
      if (googleName && googleName !== userName) {
        setUserName(googleName);
      }
    }
  }, []);

  useEffect(() => {
    const idxStr = window.sessionStorage.getItem("selectedWishIndex");
    if (idxStr !== null) setCurrentWishIndex(Number(idxStr));
  }, []);

  const hasSelectedTime = !!selectedTime;

  // eventReserveの登録処理例
  // 先着順予約ロジック
  const [errorMsg, setErrorMsg] = useState<string>("");
  const handleApply = async () => {
    setErrorMsg("");
    if (!event || !selectedTime) return;
    // 1. reservationsから該当event_id+event_timeの予約数取得
    const { data: reservations, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('event_id', event.id)
      .eq('event_time', selectedTime);
    if (error) {
      setErrorMsg('予約状況の取得に失敗しました');
      return;
    }
    const reservedCount = reservations ? reservations.length : 0;
    // 2. capacity取得（events_7days.jsonから厳密に取得）
    let capacity = event.capacity;
    try {
      const res = await fetch('/data/events_7days.json');
      const eventsJson = await res.json();
      const eventObj = eventsJson.find((e: any) => String(e.id) === String(event.id));
      if (eventObj && typeof eventObj.capacity === 'number') {
        capacity = eventObj.capacity;
      }
    } catch {}
    // 3. 予約数 < capacity ならPOST
    if (reservedCount < capacity) {
      // 予約登録
      const user_id = window.localStorage.getItem('user_id');
      // UUID形式か判定（36文字のハイフン区切り）
      const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
      if (!user_id || !uuidRegex.test(user_id)) {
        setErrorMsg('Googleアカウントでログインしてください（IDが不正です）');
        return;
      }
      const user_name = userName;
      const id = window.crypto?.randomUUID ? window.crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
      const { error: postError } = await supabase
        .from('reservations')
        .insert([
          {
            id,
            event_id: Number(event.id),
            event_time: selectedTime,
            user_id,
            user_name,
            updated_at: new Date().toISOString(),
          }
        ]);
      if (postError) {
        setErrorMsg('予約登録に失敗しました');
        return;
      }
      setShowModal(true);
    } else {
      setErrorMsg('この枠は満員です');
    }
  };




  return (

    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.header_main}>
          <Image
            className={styles.logo}
            src="/images/sparkle_logo.png"
            width={209}
            height={108}
            alt="Sparkle ロゴ"
          />
          <div className={styles.title}>
            <span>スパークル</span>
          </div>
          <ul className={styles.shortcut}>
            <li>
              <div className={styles.selector}>
                <div className={styles.selector_current}>JP(日本語)</div>
                <div className={styles.selector_list}>
                  <p>EN |</p>
                  <p>CN |</p>
                  <p>KR |</p>
                  <p>TH |</p>
                  <p>VN</p>
                </div>
              </div>
            </li>
            <li className={styles.cart}>
              <Image
                src="/images/cart.png"
                width={40}
                height={40}
                alt="カート"
              />
            </li>
            <li></li>
          </ul>
        </div>
        <div className={styles.header_sub}>
          <div className={styles.header_sub_inner}>
            <div className={styles.nav}>
              <ul className={styles.menu}>
                <li>チケットの購入</li>
                <li>予約・抽選の申し込み</li>
                <li>マイチケット</li>
                <li>メッセージ</li>
                <li>よくあるお問い合わせ</li>
                <li>
                  <div className={styles.logout}>ログアウト</div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <ol className={styles.step}>
        <li className={styles.step1}>
          <dl>
            <dt>1</dt>
            <dd>
              <span>
                イベント<br />を選択
              </span>
            </dd>
          </dl>
        </li>
        <li className={styles.step2}>
          <svg
            viewBox="0 0 14 100"
            width="14"
            height="100"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M 0,0 L 2,0 A 120,120 0,0,1 2,100 L 0,100 Z"
            />
            <path
              d="M 0,0 L 2,0 A 180,180 0,0,1 2,100 L 0,100 Z"
            />
          </svg>
          <dl>
            <dt>2</dt>
            <dd>
              <span>
                希望日時<br />を選択
              </span>
            </dd>
          </dl>
        </li>
        <li className={styles.step3}>
          <dl>
            <dt>3</dt>
            <dd>
              <span>
                希望登録<br />完了
              </span>
            </dd>
          </dl>
        </li>
      </ol>

      <div className={styles.main}>
        <div className={styles.main_inner}>
          <div className={styles.top}>
            <h1 className={styles.top_title}><span>＜空き枠先着＞</span><br/>
            時間帯を選択する</h1>

            <div className={styles.entrance_date}>来場日時：2025年8月10日(日)</div>

            <h1 className={styles.top_title}>{event ? event.name : ""}</h1>

            <h2 className={styles.top_sub_title}>イベントからのお知らせ</h2>
            <div className={styles.top_sub_text}>
              <p>{event ? event.description : ""}</p>
            </div>

            <h2 className={styles.top_sub_title}>時間帯</h2>
            <div className={styles.top_sub_text}>
              <p>観覧の所要時間は別に必要なのでご注意ください。<br/>
                所要時間は上記お知らせや<br/>
                前画面「イベント選択」の案内<br/>
                またはVisitorsの各イベント情報の「詳細情報を確認する」からご確認ください。<br/>
                イベントは 開演-終演時間(開場時間) を表示、<br/>
                または 開演-終演時間 を表示しています。<br/>
                詳細はVisitorsの各イベント情報をご確認ください。</p>
            </div>
          </div>

          <div className={styles.controller}>
            <div className={styles.controller_content}>
              <Image
                src="/images/sort.png"
                width={20}
                height={20}
                alt="絞り込み"
              />
              <p>絞り込み</p>
              <div
                className={styles.controller_text}
                style={{ cursor: "pointer" }}
                onClick={() => { setShowTimeMenu(v => !v); }}
              >
                {timeFilter === "all" ? "すべて" : `${timeFilter}時台`}
              </div>
              {showTimeMenu && (
                <ul style={{ position: "absolute", background: "#fff", border: "1px solid #ccc", zIndex: 10, listStyle: "none", padding: "8px", margin: 0 }}>
                  <li style={{ padding: "4px 8px", cursor: "pointer" }} onClick={() => { setTimeFilter("all"); setShowTimeMenu(false); }}>すべて</li>
                  {hourList.map(hour => (
                    <li key={String(hour)} style={{ padding: "4px 8px", cursor: "pointer" }} onClick={() => { setTimeFilter(String(hour)); setShowTimeMenu(false); }}>{String(hour)}時台</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className={styles.time_picker}>
            {filteredTimes.map((time: string, idx: number) => (
              <div key={time} className={styles.time_picker_content_wrapper}>
                <div className={styles.time_picker_content}>
                  <label
                    className={`${styles.time_picker_content_inner} ${selectedTime === time ? styles.selected_time_label : undefined}`}
                    style={selectedTime === time ? { backgroundColor: "#fde6e6", borderRadius: "10px" } : {}}
                  >
                    <input
                      type="radio"
                      name="time"
                      value={time}
                      checked={selectedTime === time}
                      onChange={() => { setSelectedTime(time); }}
                      className={styles.time_picker_radio}
                    />
                    <span>{time}</span>
                  </label>
                </div>
              </div>
            ))}

            <ul className={styles.time_register}>
              <li>
                {/* 予約者名の入力欄（7days抽選申込で登録済みなら変更不可） */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: 8 }}>
                    予約者名
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={e => setUserName(e.target.value)}
                    placeholder="例）山田 太郎"
                    disabled={!!reservedUserName}
                    style={{
                      width: '100%',
                      maxWidth: 480,
                      padding: '10px 12px',
                      border: '1px solid #ccc',
                      borderRadius: 6,
                      background: reservedUserName ? '#f5f5f5' : 'white',
                      color: reservedUserName ? '#888' : 'black',
                    }}
                  />
                  {!reservedUserName && (
                    <div style={{ marginTop: 8, color: '#555', fontSize: 14 }}>
                      この名前で予約確認を行います。正確に入力してください。ニックネーム可。
                    </div>
                  )}
                  {reservedUserName && (
                    <div style={{ marginTop: 8, color: '#888', fontSize: 13 }}>
                      この名前は7日前抽選申込で登録されたため変更できません。
                    </div>
                  )}
                </div>
                <div className={styles.time_register_info}>
                  <p>{event ? event.name : ""}<br/>
                  {hasSelectedTime ? selectedTime : "時間帯を選択してください"}</p>
                </div>
              </li>
              <li>
                {hasSelectedTime ? (
                  <button
                    className={styles.time_register_link}
                    onClick={handleApply}
                    type="button"
                  >
                    選択したチケットで申し込む
                  </button>
                ) : (
                  <div className={`${styles.time_register_link} ${styles.time_register_link_disabled}`}>
                    選択したチケットで申し込む
                  </div>
                )}
                {errorMsg && (
                  <div style={{ color: 'red', marginTop: '8px' }}>{errorMsg}</div>
                )}
              </li>
            </ul>

            {showModal && (
              <div className={styles.modal_overlay}>
                <div className={styles.modal_wrapper}>
                  <div className={styles.modal_inner}>
                    <div className={styles.modal_close} onClick={() => { setShowModal(false); }}>
                      <Image
                        src="/images/close.png"
                        alt="close"
                        width={20}
                        height={20}
                      />
                    </div>
                    <div className={styles.modal_content}>
                      <p className={styles.title}>＜空き枠先着＞<br/>
                        希望のイベントを予約できました</p>
                      <div className={styles.calendar_icon}>
                        <Image
                          src="/images/calendar.png"
                          width={106}
                          height={80}
                          alt="カレンダーアイコン"
                        />
                      </div>
                      <div className={styles.sum}>
                        <p>{event ? event.name : ""} {selectedTime}</p>
                        <div>
                          <p className={styles.annotation}>
                            {/* <Image
                              src="/images/annotation.png"
                              alt="annotation"
                              width={20}
                              height={20}
                            /> */}
                            <span>　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　</span>
                          </p>
                        </div>
                      </div>
                      <ul className={styles.buttons}>
                        <li>
                          <button className={styles.button} onClick={() => { setShowModal(false); }}>
                            <span className={styles.button_text}>同じイベントで別の時間帯を選ぶ</span>
                          </button>
                        </li>
                        <li>
                          <button className={styles.button} onClick={() => { router.push("/reserve/first-come-served/eventSelect"); }}>
                            <span className={styles.button_text}>イベントリストへ戻る<br/>
                            他の予約をする</span>
                          </button>
                        </li>
                      </ul>
                    </div>
                    {/* <h2>申込内容確認</h2>
                    <p>イベントID: {event?.id}</p>
                    <p>選択した時間: {selectedTime}</p>
                    <button type="button" onClick={() => setShowModal(false)} className={styles.modal_close}>閉じる</button> */}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className={styles.buttons}>
            <ul className={styles.button_bottom}>
              <li>
                <Link href={`/reserve/first-come-served/eventSelect`}>
                  <div className={styles.button_other}>イベントの選択にもどる</div>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.footer_inner}>

        </div>
      </div>
    </div>
  );
}