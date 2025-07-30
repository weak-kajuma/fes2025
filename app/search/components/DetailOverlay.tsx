"use client";

import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import styles from './DetailOverlay.module.css';
import LiquidGlass from '@/components/LiquidGlass/LiquidGlass';

type EventDataForClient = {
  id: number;
  title: string | null;
  host: string | null;
  intro: string | null;
  brief_intro: string | null;
  locationType: string | null;
  tags: string[] | null;
};

type DetailOverlayProps = {
  event: EventDataForClient;
  onClose: () => void;
};

export default function DetailOverlay({ event, onClose }: DetailOverlayProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const overlayRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
    setStartX(e.touches[0].clientX);
    setCurrentX(e.touches[0].clientX);
    setStartTime(Date.now());
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    e.preventDefault(); // リロードを防ぐ

    const touch = e.touches[0];
    const deltaY = touch.clientY - startY;

    setCurrentX(touch.clientX);

    if (deltaY > 0) {
      setCurrentY(touch.clientY);
      // liquidGlass_wrapperを動かす（transitionを一時的に無効化）
      const liquidGlassWrapper = overlayRef.current?.closest('[class*="liquidGlass_wrapper"]') as HTMLElement;
      if (liquidGlassWrapper) {
        liquidGlassWrapper.style.transition = 'none';
        liquidGlassWrapper.style.transform = `translateY(${deltaY}px)`;
      }
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    setIsDragging(false);
    const deltaY = currentY - startY;
    const deltaX = currentX - startX;
    const deltaTime = Date.now() - startTime;

    // 右から左へのスワイプ（戻るジェスチャー）を検知
    if (deltaX < -50 && deltaTime < 300) {
      onClose();
      return;
    }

    if (deltaY > 100) {
      // 十分に下にドラッグされた場合、閉じる
      setIsClosing(true);
      // GSAPでアニメーション
      const liquidGlassWrapper = overlayRef.current?.closest('[class*="liquidGlass_wrapper"]') as HTMLElement;
      if (liquidGlassWrapper) {
        gsap.to(liquidGlassWrapper, {
          y: '100vh',
          duration: 0.3,
          ease: 'power2.out',
          onComplete: () => {
            onClose();
          }
        });
      }
    } else {
      // 元の位置に戻す（GSAPでアニメーション）
      const liquidGlassWrapper = overlayRef.current?.closest('[class*="liquidGlass_wrapper"]') as HTMLElement;
      if (liquidGlassWrapper) {
        gsap.to(liquidGlassWrapper, {
          y: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartY(e.clientY);
    setCurrentY(e.clientY);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    e.preventDefault(); // デフォルト動作を防ぐ

    const deltaY = e.clientY - startY;

    if (deltaY > 0) {
      setCurrentY(e.clientY);
      // liquidGlass_wrapperを動かす（transitionを一時的に無効化）
      const liquidGlassWrapper = overlayRef.current?.closest('[class*="liquidGlass_wrapper"]') as HTMLElement;
      if (liquidGlassWrapper) {
        liquidGlassWrapper.style.transition = 'none';
        liquidGlassWrapper.style.transform = `translateY(${deltaY}px)`;
      }
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) return;

    setIsDragging(false);
    const deltaY = currentY - startY;

    if (deltaY > 100) {
      // 十分に下にドラッグされた場合、閉じる
      setIsClosing(true);
      // GSAPでアニメーション
      const liquidGlassWrapper = overlayRef.current?.closest('[class*="liquidGlass_wrapper"]') as HTMLElement;
      if (liquidGlassWrapper) {
        gsap.to(liquidGlassWrapper, {
          y: '100vh',
          duration: 0.3,
          ease: 'power2.out',
          onComplete: () => {
            onClose();
          }
        });
      }
    } else {
      // 元の位置に戻す（GSAPでアニメーション）
      const liquidGlassWrapper = overlayRef.current?.closest('[class*="liquidGlass_wrapper"]') as HTMLElement;
      if (liquidGlassWrapper) {
        gsap.to(liquidGlassWrapper, {
          y: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, startY, currentY]);

  // PC版でのスクロール制御
  const handleWheel = (e: WheelEvent) => {
    const eventInfo = overlayRef.current?.querySelector(`.${styles.event_info}`) as HTMLElement;
    if (eventInfo) {
      const { scrollTop, scrollHeight, clientHeight } = eventInfo;
      const deltaY = e.deltaY;

      // 上端で上スクロール、下端で下スクロールを防ぐ
      if ((scrollTop <= 0 && deltaY < 0) || (scrollTop + clientHeight >= scrollHeight && deltaY > 0)) {
        e.preventDefault();
        return;
      }

      // event_infoエリア内でスクロール
      eventInfo.scrollTop += deltaY;
      e.preventDefault();
    }
  };

  // event_infoエリアのスクロール制御
  const handleEventInfoWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
  };

  useEffect(() => {
    const overlayElement = overlayRef.current;
    if (overlayElement) {
      overlayElement.addEventListener('wheel', handleWheel, { passive: false });

      return () => {
        overlayElement.removeEventListener('wheel', handleWheel);
      };
    }
  }, []);

  // スマホ版での戻るジェスチャー制御
  useEffect(() => {
    const handlePopState = () => {
      // ボトムシートが開いている状態で戻るジェスチャーが実行された場合
      if (overlayRef.current) {
        onClose();
        // 履歴を戻す（実際のページ遷移を防ぐ）
        window.history.pushState(null, '', window.location.href);
      }
    };

    // ボトムシートが開いた時に履歴に追加
    window.history.pushState(null, '', window.location.href);

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className={`${styles.detail_overlay} ${isClosing ? styles.closing : ''}`}
    >
      <div
        ref={dragHandleRef}
        className={styles.drag_handle}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        <div className={styles.bar}></div>
      </div>
      <div className={styles.detail_content}>

        <button className={styles.close_button} onClick={() => {
          // GSAPアニメーションで閉じる
          const liquidGlassWrapper = overlayRef.current?.closest('[class*="liquidGlass_wrapper"]') as HTMLElement;
          if (liquidGlassWrapper) {
            gsap.to(liquidGlassWrapper, {
              y: '100vh',
              duration: .3,
              ease: 'power2.inOut',
              onComplete: () => {
                onClose();
              }
            });
          } else {
            onClose();
          }
        }}>
          <LiquidGlass>
            ✕
          </LiquidGlass>
        </button>

        <div className={styles.event_info} onWheel={handleEventInfoWheel}>
          <div className={styles.basic}>
            <div className={styles.img}>
              <LiquidGlass>
                <div className={styles.img_inner}></div>
              </LiquidGlass>
            </div>
            <div className={styles.other}>
              <h2 className={styles.event_title}>{event.title}</h2>
              {event.host && <p className={styles.event_host}>{event.host}</p>}
              {event.tags && event.tags.length > 0 && (
                <div className={styles.event_tags}>
                  {event.tags.map((tag, index) => (
                    <div key={index} className={styles.tag}>
                      <LiquidGlass>
                        {tag}
                      </LiquidGlass>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className={styles.functions}>
            <div className={styles.function}>
              <LiquidGlass>
                <span className={`material-icons ${styles.share_icon}`}>share</span>
                <p className={styles.share_text}>共有</p>
              </LiquidGlass>
            </div>
            <div className={styles.function}>
              <LiquidGlass>
                <span className={`material-icons ${styles.detail_icon}`}>open_in_new</span>
                <p className={styles.detail_text}>詳細ページ</p>
              </LiquidGlass>
            </div>
          </div>
          {event.locationType && (
            <p className={styles.event_location}>
              <span className={styles.location_icon}>location_on</span>
              {event.locationType}
            </p>
          )}
          <div className={styles.text_wrapper}>
            <p className={styles.text_title}><span>● </span>紹介</p>
            {event.intro && <p className={styles.text}>{event.intro}</p>}
          </div>
          <div className={styles.text_wrapper}>
            <p className={styles.text_title}><span>● </span>そのほか追加予定</p>
            <p className={styles.text}>そのほか追加予定</p>
          </div>
          <div className={styles.text_wrapper}>
            <p className={styles.text_title}><span>● </span>そのほか追加予定</p>
            <p className={styles.text}>そのほか追加予定</p>
          </div>
          <div className={styles.text_wrapper}>
            <p className={styles.text_title}><span>● </span>そのほか追加予定</p>
            <p className={styles.text}>そのほか追加予定</p>
          </div>
          <div className={styles.text_wrapper}>
            <p className={styles.text_title}><span>● </span>そのほか追加予定</p>
            <p className={styles.text}>そのほか追加予定</p>
          </div>
        </div>
      </div>
    </div>
  );
}