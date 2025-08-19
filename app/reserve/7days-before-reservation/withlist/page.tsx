"use client";
import { useEffect, useState, useCallback } from "react";
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';
import { color } from "framer-motion";

// public/data/events.json から読み込むイベントの型
interface EventInfo {
  id: number;
  name: string;
  time: string; // 仮。実際のjsonの構造に合わせてください
  // その他必要なプロパティ
}

// 画面に表示する申し込み情報の型
interface AppliedEvent {
  id: number;
  name: string;
  time: string;
}

export default function Reserve7DaysBeforeWithlistPage() {
  const [appliedList, setAppliedList] = useState<(AppliedEvent | null)[]>([]);
  const [appliedEvents, setAppliedEvents] = useState<{ event_id: number; event_time: string; user_name?: string }[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const router = useRouter();

  const maxWishes = 5;

  // ページ読み込み時にサーバーからデータを取得する関数
  const loadAppliedData = useCallback(async () => {
    setIsPageLoading(true);
    setMessage(null);
    try {
      // 全イベント情報と、申込済みの情報を並行して取得
      const userId = window.localStorage.getItem('user_id');
      const [eventsRes, appliedRes] = await Promise.all([
        fetch('/data/events_7days.json'),
        userId ? fetch(`/api/lottely-applications?user_id=${userId}`) : Promise.resolve({ ok: false, status: 400, json: async () => ({}) })
      ]);

      if (!eventsRes.ok) throw new Error('イベント情報の取得に失敗しました。');
      const allEvents: EventInfo[] = await eventsRes.json();

      let appliedEventsFromApi: { event_id: number; event_time: string; user_name?: string }[] = [];
      if (appliedRes.status === 401) {
        appliedEventsFromApi = [];
      } else if (!appliedRes.ok) {
        throw new Error('申込情報の取得に失敗しました。');
      } else {
        const appliedResult = await appliedRes.json();
        appliedEventsFromApi = Array.isArray(appliedResult?.results) ? appliedResult.results : [];
        // 既存の登録名があれば初期値として反映
        if (appliedEventsFromApi.length > 0 && appliedEventsFromApi[0].user_name) {
          setUserName(appliedEventsFromApi[0].user_name);
          window.localStorage.setItem("google_user_name", appliedEventsFromApi[0].user_name);
        }
      }
      setAppliedEvents(appliedEventsFromApi);

      // セッションの編集中リストを反映
      const sessionListRaw = window.sessionStorage.getItem('appliedEventList');
      const sessionList: ({ id: number; name?: string; time?: string } | null)[] = sessionListRaw ? JSON.parse(sessionListRaw) : [];

      // 申込済みイベントIDリスト
      const appliedEventIds = appliedEventsFromApi.map(ev => ev.event_id);

      // 申込済みイベントは選択不可・表示のみ
      const newAppliedList: (AppliedEvent | null)[] = Array(maxWishes).fill(null);
      for (let i = 0; i < maxWishes; i++) {
        const fromSession = sessionList[i];
        if (fromSession && fromSession.id && !appliedEventIds.includes(fromSession.id)) {
          const eventDetail = allEvents.find(e => e.id === fromSession.id);
          if (eventDetail) {
            newAppliedList[i] = {
              id: eventDetail.id,
              name: eventDetail.name,
              time: fromSession.time ?? eventDetail.time ?? ''
            };
            continue;
          }
        }
        // 申込済みイベントは表示のみ
        const fromApi = appliedEventsFromApi[i];
        if (fromApi && fromApi.event_id) {
          const eventDetail = allEvents.find(e => e.id === fromApi.event_id);
          if (eventDetail) {
            newAppliedList[i] = {
              id: eventDetail.id,
              name: eventDetail.name,
              time: fromApi.event_time ?? eventDetail.time ?? ''
            };
          }
        }
      }
      setAppliedList(newAppliedList);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'データの読み込み中に予期せぬエラーが発生しました';
      setMessage(`エラー: ${errorMessage}`);
      console.error(error);
    } finally {
      setIsPageLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppliedData();
  }, [loadAppliedData]);

  // 「この内容で抽選を申し込む」ボタンの処理
  const handleApplyClick = async () => {
    setIsLoading(true);
    setMessage(null);

    // APIに送る形式: event_id[], event_time[]
    const filteredList = appliedList.filter((item): item is AppliedEvent => item !== null);
    const eventIds = filteredList.map(item => item.id);
    const eventTimes = filteredList.map(item => item.time ?? null);
    const user_id = window.localStorage.getItem('user_id');

    if (eventIds.length === 0) {
      setMessage("申し込むイベントがありません。");
      setIsLoading(false);
      return;
    }

    try {
      // 既存申込内容と新申込内容を比較し、重複するものはDELETE
      for (const ev of appliedEvents) {
        const idx = eventIds.findIndex((id, i) => id === ev.event_id && eventTimes[i] === ev.event_time);
        if (idx !== -1) {
          // 重複する申込内容は一度削除
          await fetch('/api/lottely-applications', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event_id: ev.event_id, event_time: ev.event_time, user_id }),
          });
        }
      }

      // 新しい申込内容をPOST
      const response = await fetch('/api/lottely-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventIds, event_time: eventTimes, user_name: userName, user_id }),
      });
      // 名前をlocalStorageに保存
      if (userName) {
        window.localStorage.setItem('reserved_user_name', userName);
      }
      if (response.status === 401) {
        setMessage('申し込みにはログインが必要です。ログイン後に再度お試しください。');
        setIsLoading(false);
        return;
      }
      if (response.status === 409) {
        const r = await response.json();
        setMessage(r?.error || 'このニックネームは既に使用されています。別の名前を入力してください。');
        setIsLoading(false);
        return;
      }
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || '申し込み処理でエラーが発生しました。');

      setMessage(null);
      // 申し込み完了後、リストを再読み込みして最新の状態を反映
      await loadAppliedData();
      // セッション上の編集中データはクリア
      window.sessionStorage.removeItem('appliedEventList');
      window.sessionStorage.removeItem('selectedWishIndex');
      // 完了モーダルを表示
      setShowCompleteModal(true);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '予期せぬエラーが発生しました';
      setMessage(`エラー: ${errorMessage}`);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 削除ボタンの処理 (API連携)
  const handleDelete = async (index: number) => {
    const item = appliedList[index];
    if (item) {
      // DBからも削除
      try {
        await fetch('/api/lottely-applications', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event_id: item.id, event_time: item.time }),
        });
      } catch (e) {
        setMessage('削除処理でエラーが発生しました');
      }
    }
    const newList = [...appliedList];
    newList[index] = null;
    setAppliedList(newList);
    // セッションの編集中リストも更新
    const sessionListRaw = window.sessionStorage.getItem('appliedEventList');
    const sessionList: (AppliedEvent | null)[] = sessionListRaw ? JSON.parse(sessionListRaw) : Array(maxWishes).fill(null);
    while (sessionList.length < maxWishes) sessionList.push(null);
    sessionList[index] = null;
    window.sessionStorage.setItem('appliedEventList', JSON.stringify(sessionList));
    // 再取得
    await loadAppliedData();
  };

  if (isPageLoading) {
    return <div className={styles.loading}>読み込み中...</div>;
  }

  return (
    <div className={styles.wrapper}>
      {/* Header and other static parts remain the same */}
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

      <div className={styles.main}>
        <div className={styles.main_inner}>
          {/* ... top and middle sections ... */}
          <div className={styles.top}>
            <h1 className={styles.top_title}>7日前<br/>抽選申込</h1>
            <div className={styles.top_info}>来場予定日のパビリオン･イベントの抽選に、第5希望までお申し込みできます。</div>
            <div className={styles.top_info}>当選は1回の抽選で1つです。<br/>
            第1希望が落選の場合に第2希望、第2希望が落選の場合に第3希望と順番に抽選を行います。</div>
            <div className={styles.top_info}>対象のパビリオン･イベントは、以下の登録操作の中で検索して調べることができます。</div>
            <div className={styles.term}>
              <div className={styles.title}>申込期間：</div>
              <div className={styles.values}><span>　2025年7月10日(木) 0:00</span><span>　-　</span><span>2025年8月2日(土) 23:59</span></div>
              <div className={styles.title}>抽選期間：</div>
              <div className={styles.values}><span>　2025年8月3日(日) 0:00</span><span>　-　</span><span>2025年8月6日(水) 11:59</span></div>
            </div>
          </div>

          <div className={styles.middle}>
            <span className={styles.middle_info_bold}>抽選は第5希望まで登録できます。</span>
            <span className={styles.announce}>登録後には必ずこの画面末尾の<br/>
            「この内容で抽選を申し込む」<br/>
            ボタンを押してください。</span>
            <span className={styles.middle_info_normal}>以下の希望リストを登録・変更・削除しただけでは抽選申込は完了しません。<br/>
            必ず「この内容で抽選を申し込む」を押してください。</span>
            <div className={styles.entrance_date}>来場日時：2025年8月10日(日)<br/>
            追加で申込可能な時間帯</div>
          </div>

            <div className={styles.reserve_selector}>
              {[...Array(maxWishes)].map((_, idx) => (
                <div className={styles.selector} key={idx}>
                  <div className={`${styles.circle} ${appliedList[idx] ? styles.circle_registered : ""}`}>
                    <span className={styles.circle_text}>第{idx + 1}希望</span>
                  </div>
                  <div className={`${styles.note} ${appliedList[idx] ? styles.note_registered : ""}`}>
                    <div className={styles.note_inner_sp}>
                      <div className={styles.infoArea}>
                        {appliedList[idx] ? (
                          <p className={styles.noteText_registered}>
                            {appliedList[idx]!.name}<br />
                            {appliedList[idx]!.time}
                          </p>
                        ) : (
                          <p className={styles.noteText}>
                            未登録： 2025年8月2日(土) 23:59までに<br />
                            登録してください。
                          </p>
                        )}
                      </div>
                      <div className={styles.noteContent}>
                        {appliedList[idx] ? (
                          <div className={styles.actionButtonsArea}>
                            <div className={styles.action_button}
                              onClick={() => {
                                router.push(`/reserve/7days-before-reservation/eventSelect?wishIndex=${idx}`);
                              }}
                            >
                              変更
                            </div>
                            <div className={styles.action_button}
                              onClick={() => handleDelete(idx)}
                            >
                              削除
                            </div>
                          </div>
                        ) : (
                          <Link
                            href={`/reserve/7days-before-reservation/eventSelect?wishIndex=${idx}`}
                          >
                            <div className={styles.register_button}>登録する</div>
                          </Link>
                        )}
                      </div>
                    </div>
                    <div className={`${styles.knob} ${appliedList[idx] ? styles.knob_registered : ""}`}></div>
                  </div>
                </div>
              ))}
            </div>


          <div className={styles.buttons}>
            {/* 予約者名の入力欄 */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: 8 }}>
                予約者名
              </label>
              <input
                type="text"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                placeholder="例）山田 太郎"
                style={{
                  width: '100%',
                  maxWidth: 480,
                  padding: '10px 12px',
                  border: '1px solid #ccc',
                  borderRadius: 6,
                }}
              />
              <div style={{ marginTop: 8, color: '#555', fontSize: 14 }}>
                この名前で予約確認を行います。正確に入力してください。ニックネーム可。
              </div>
            </div>
            <button
              className={`${styles.submit_button} ${appliedList.every(item => item === null) || isLoading ? styles.submit_button_disabled : ''}`}
              onClick={handleApplyClick}
              disabled={appliedList.every(item => item === null) || isLoading}
            >
              <span>{isLoading ? '処理中...' : 'この内容で抽選を申し込む'}</span>
            </button>
          </div>

          {message && (
            <div className={styles.message_area}>
              <p style={{ color: 'red' }}>{message}</p>
            </div>
          )}
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.footer_inner}></div>
      </div>

      {showCompleteModal && (
        <div className={styles.modal_overlay}>
          <div className={styles.modal_wrapper}>
            <div className={styles.modal_inner}>
              <div className={styles.modal_close} onClick={() => setShowCompleteModal(false)}>
                <Image src="/images/close.png" alt="close" width={20} height={20} />
              </div>
              <div className={styles.modal_content}>
                <p className={styles.modal_title}>申し込みが完了しました</p>
                <p className={styles.modal_text}>抽選結果は後日ご案内します。マイチケットや申込内容をご確認ください。</p>
                <div className={styles.modal_buttons}>
                  <button className={styles.modal_button} onClick={() => setShowCompleteModal(false)}>閉じる</button>
                  <button className={styles.modal_button} onClick={() => { setShowCompleteModal(false); router.push('/reserve/ticket'); }}>マイチケットへ</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
