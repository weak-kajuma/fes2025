'use client'

import styles from './page.module.css';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function RiddlePage() {
  const [muzunazo, setMuzunazo] = useState<{id:number}[]>([]);

  useEffect(() => {
    fetch('/riddle/muzunazo.json')
      .then(res => res.json())
      .then(data => setMuzunazo(data));
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.backDesign}>
        <Image src="/riddle/design_1.svg" width={1000} height={1000} alt="謎解きデザイン" className={styles.svg} />
        <div className={styles.back}></div>
        <div className={styles.line_top}></div>
        <div className={styles.line_bottom}></div>
      </div>

      <div className={styles.container}>
        <h1>難謎 正誤判定</h1>

        <div className={styles.content}>
          {muzunazo.map((item) => (
            <Link href={`/riddle/answer/${item.id}`} className={styles.toAnswer} key={item.id}>
              No.{item.id}
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}