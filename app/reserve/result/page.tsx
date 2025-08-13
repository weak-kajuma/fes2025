"use client";
import Image from "next/image";
import Link from "next/link";
import baseStyles from "../7days-before-reservation/withlist/page.module.css";
import styles from "./page.module.css";
import { useEffect, useMemo, useState } from "react";

type AppliedEvent = { id: number; name: string; time?: string };

export default function ReserveResultPage() {
  const [appliedList, setAppliedList] = useState<AppliedEvent[]>([]);
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [eventsRes, appliedRes] = await Promise.all([
          fetch('/data/events.json'),
          fetch('/api/lottely-applications')
        ]);
        const allEvents: any[] = await eventsRes.json();
        if (!appliedRes.ok) {
          setAppliedList([]);
          setLoading(false);
          return;
        }
        const applied = await appliedRes.json();
        const eventData = Array.isArray(applied?.event_data) ? applied.event_data as any[] : [];
        const normalized: { id: number; time?: string }[] = eventData.map((it: any) => (
          typeof it === 'number' ? { id: it } : { id: it.id, time: it.time }
        ));
        const detailed = normalized.map((item) => {
          const e = allEvents.find(ev => ev.id === item.id);
          return e ? { id: e.id, name: e.name, time: item.time ?? (e.ImplementationTime?.split(',')[0] ?? '') } : null;
        }).filter(Boolean) as AppliedEvent[];
        setAppliedList(detailed);
        if (typeof applied?.user_name === 'string') {
          setUserName(applied.user_name);
        }
      } catch (e) {
        setError('結果の取得に失敗しました。');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) return <div style={{ padding: 24 }}>読み込み中...</div>;

  return (
    <div className={baseStyles.wrapper}>
      <div className={baseStyles.header}>
        <div className={baseStyles.header_main}>
          <Image className={baseStyles.logo} src="/images/sparkle_logo.png" width={209} height={108} alt="Sparkle ロゴ" />
          <div className={baseStyles.title}><span>スパークル</span></div>
          <ul className={baseStyles.shortcut}>
            <li>
              <div className={baseStyles.selector}>
                <div className={baseStyles.selector_current}>JP(日本語)</div>
                <div className={baseStyles.selector_list}>
                  <p>EN |</p>
                  <p>CN |</p>
                  <p>KR |</p>
                  <p>TH |</p>
                  <p>VN</p>
                </div>
              </div>
            </li>
            <li className={baseStyles.cart}>
              <Image src="/images/cart.png" width={40} height={40} alt="カート" />
            </li>
            <li></li>
          </ul>
        </div>
        <div className={baseStyles.header_sub}>
          <div className={baseStyles.header_sub_inner}>
            <div className={baseStyles.nav}>
              <ul className={baseStyles.menu}>
                <li>チケットの購入</li>
                <li>予約・抽選の申し込み</li>
                <li>マイチケット</li>
                <li>メッセージ</li>
                <li>よくあるお問い合わせ</li>
                <li><div className={baseStyles.logout}>ログアウト</div></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className={baseStyles.main}>
        <div className={baseStyles.main_inner}>
          <div className={baseStyles.top}>
            <h1 className={baseStyles.top_title}>7日前 抽選申込 結果</h1>
            <div className={baseStyles.top_info}>申し込んだパビリオン・イベントの一覧です。</div>
          </div>

          <div className={baseStyles.middle}>
            <span className={baseStyles.middle_info_bold}>抽選申込内容の確認</span>
            <span className={baseStyles.middle_info_normal}>以下は現在登録されている希望リストです。変更がある場合は「申込内容を変更する」から修正してください。</span>
            <div className={baseStyles.entrance_date}>来場日時：2025年8月10日(日)<br/>申込済みの時間帯一覧</div>
            <div className={baseStyles.entrance_date}>申込者名：{userName || '未設定'}</div>
          </div>

          <div style={{ marginTop: 24 }}>
            {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
            {appliedList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>申し込みはまだありません。</div>
            ) : (
              <ul className={styles.card_list}>
                {appliedList.map((item, idx) => (
                  <li key={`${item.id}-${idx}`} className={styles.card_item}>
                    <div className={styles.card_left}>
                      <div className={styles.wish_label}>第{idx + 1}希望</div>
                      <div className={styles.name}>{item.name}</div>
                      <div className={styles.time}>{item.time || '時間未定'}</div>
                    </div>
                    <Link href="/reserve/7days-before-reservation/withlist">
                      <div className={styles.edit_button}>申込内容を変更する</div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className={baseStyles.footer}>
        <div className={baseStyles.footer_inner}></div>
      </div>
    </div>
  );
}
