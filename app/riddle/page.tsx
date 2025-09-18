'use client'

import styles from './page.module.css';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function RiddlePage() {
  const [muzunazo, setMuzunazo] = useState<{id:number}[]>([]);
  const [solvedIds, setSolvedIds] = useState<string[]>([]);

  useEffect(() => {
    fetch('/riddle/muzunazo.json')
      .then(res => res.json())
      .then(data => setMuzunazo(data));
    // localStorageから正解済みIDを取得
    try {
      const correctList = JSON.parse(localStorage.getItem('correctAnswers') || '[]');
      setSolvedIds(correctList.map(String));
    } catch {
      setSolvedIds([]);
    }
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.notice}>※ブラウザ設定で「Cookie・サイトデータの保存」を無効化している場合は有効にしてください</div>

      <div className={styles.backDesign}>
        <Image src="/riddle/design_1.svg" width={1000} height={1000} alt="謎解きデザイン" className={styles.svg} />
        <div className={styles.back}></div>
        <div className={styles.line_top}></div>
        <div className={styles.line_bottom}></div>
      </div>

      <div className={styles.container}>
        <h1>難謎 正誤判定</h1>

        <div className={styles.content}>
          <div className={styles.links}>
            {muzunazo.map((item) => {
              const isSolved = solvedIds.includes(String(item.id));
              return (
                <Link
                  href={`/riddle/answer/${item.id}`}
                  className={isSolved ? `${styles.toAnswer} ${styles.solved}` : styles.toAnswer}
                  key={item.id}
                >
                  No.{item.id}
                </Link>
              );
            })}
          </div>


        </div>

        {muzunazo.length > 0 && solvedIds.length === muzunazo.length && (
          <h2>
            <span>ALL CLEAR !!!!</span><br />
            受付にこの画面を見せてください
          </h2>
        )}
      </div>
    </div>
  );
}