"use client";

import styles from './page.module.css';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function RiddleHintPage() {
  const [hintData, setHintData] = useState<{id:number;hints:string[]}[]>([]);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [currentId, setCurrentId] = useState<number|null>(null);
  const [currentHintIdx, setCurrentHintIdx] = useState(0);

  useEffect(() => {
    fetch('/riddle/shuyu_hint.json')
      .then(res => res.json())
      .then(data => setHintData(data));
  }, []);

  // ヒントNoクリック時
  const handleHintNoClick = (id:number) => {
    setCurrentId(id);
    setCurrentHintIdx(0);
    setOverlayOpen(true);
  };

  // 次のヒント
  const handleNextHint = () => {
    if (currentId == null) return;
    const hints = hintData.find(h => h.id === currentId)?.hints || [];
    if (currentHintIdx < hints.length - 1) {
      setCurrentHintIdx(currentHintIdx + 1);
    }
  };

  // オーバーレイ閉じる
  const handleClose = () => {
    setOverlayOpen(false);
    setCurrentId(null);
    setCurrentHintIdx(0);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.backDesign}>
        <Image src="/riddle/design_1.svg" width={1000} height={1000} alt="謎解きデザイン" className={styles.svg} />
        <div className={styles.back}></div>
        <div className={styles.line_top}></div>
        <div className={styles.line_bottom}></div>
      </div>

      <div className={styles.container}>
        <h1 className={styles.title}>オリエンテーション<br/>ヒント</h1>

        <div className={styles.hints}>
          {hintData.map(item => (
            <div
              key={item.id}
              className={styles.hintNo}
              onClick={() => handleHintNoClick(item.id)}
              style={{cursor:'pointer'}}
            >No.{item.id}</div>
          ))}
        </div>
      </div>

      {overlayOpen && currentId != null && (() => {
        const currentHintObj = hintData.find(h => h.id === currentId);
        if (!currentHintObj) return null;
        const hints = currentHintObj.hints;
        const isLast = currentHintIdx === hints.length - 1;
        return (
          <>
            <div className={styles.overlay_bg}></div>
            <div className={styles.hint_overlay}>
              <svg width="120" height="120" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M67.788 86.088H52.212V63.24l6.972-.732c3.24-.348 7.68-1.128 9.096-1.74C76.32 57.3 81.264 49.38 80.868 40.62 80.376 29.592 71.34 20.844 60.3 20.688c-5.652-.108-10.956 2.052-14.964 6.012-4.008 3.96-6.228 9.24-6.228 14.88H23.532c0-9.84 3.864-19.056 10.86-25.968C41.4 8.7 50.676 5.004 60.516 5.112 79.8 5.376 95.58 20.676 96.432 39.936c.672 15.048-8.172 29.172-21.984 35.136-1.872.804-4.32 1.428-6.672 1.896V86.1l.012-.012zM60 114.9c5.951 0 10.776-4.824 10.776-10.776 0-5.951-4.825-10.776-10.776-10.776s-10.776 4.825-10.776 10.776c0 5.952 4.825 10.776 10.776 10.776z" fill="#DEB65B"></path></svg>
              <div className={styles.content}>
                <div className={styles.title}>ヒント</div>
                <div className={styles.text}>
                  <span className={styles.no}>{currentHintIdx+1}/{hints.length}</span>
                  <div className={styles.text}>{hints[currentHintIdx]}</div>
                  {hints.length > 1 && (
                    <div className={styles.button_wrapper}>
                      <div className={styles.button}>
                        {isLast ? (
                          <div className={styles.content} onClick={() => setCurrentHintIdx(currentHintIdx - 1)} style={{color:'rgb(172, 139, 64)',backgroundColor:'rgb(252, 248, 239)', cursor:'pointer'}}>
                            前のヒント
                          </div>
                        ) : (
                          <div className={styles.content} onClick={handleNextHint} style={{cursor:'pointer'}}>
                            次のヒント
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.close} onClick={handleClose} style={{cursor:'pointer'}}>
                閉じる
              </div>
            </div>
          </>
        );
      })()}
    </div>
  )
}