import { useRef, useEffect } from "react";
import gsap from "gsap";
import styles from "./NewsSlider.module.css";
import { useRouter } from "next/navigation";
import Link from "next/link"

type NewsItem = { id: string | number; title: string; imgUrl?: string; type?: string };

interface NewsSliderProps {
  items: NewsItem[];
  isMobile?: boolean;
  onItemClick?: (item: NewsItem) => void;
}

const NewsSlider = ({ items, isMobile, onItemClick }: NewsSliderProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRefs = [useRef<HTMLUListElement>(null), useRef<HTMLUListElement>(null), useRef<HTMLUListElement>(null)];
  const router = useRouter();
  // ドラッグ解除直後のクリック無効フラグ
  const clickDisabledRef = useRef(false);

  // PCのみ自動スクロール
  useEffect(() => {
    if (isMobile) return;
    const wrapper = wrapperRef.current;
    const lists = listRefs.map(ref => ref.current);
    if (!wrapper || lists.some(l => !l)) return;

    const listWidth = lists[0]!.scrollWidth;
    let xs = [0, listWidth, listWidth * 2];
    let running = true;
    const speed = .5;
    let isDragging = false;
    let dragStartX = 0;
    let dragLastX = 0;
    let rafId: number | null = null;
    let grabTimer: number | null = null;
    let isGrabActive = false;

    const setLists = () => {
      lists.forEach((list, i) => {
        gsap.set(list, { x: xs[i] });
      });
    };

    const animate = () => {
      if (!running || isDragging) return;
      xs = xs.map(x => x - speed);
      for (let i = 0; i < xs.length; i++) {
        if (xs[i] <= -listWidth * 1.5) {
          const maxX = Math.max(...xs);
          xs[i] = maxX + listWidth;
        }
      }
      setLists();
      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);

    // 長押しでgrab状態に
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (grabTimer) clearTimeout(grabTimer);
      grabTimer = window.setTimeout(() => {
        isGrabActive = true;
        lists.forEach(list => list?.classList.add('grabbing'));
        isDragging = true;
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        running = false;
        dragStartX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
        dragLastX = dragStartX;
      }, 100); // 500ms長押しでgrab
    };
    const onPointerUp = () => {
      if (grabTimer) clearTimeout(grabTimer);
      if (isGrabActive) {
        isGrabActive = false;
        lists.forEach(list => list?.classList.remove('grabbing'));
        isDragging = false;
        running = true;
        // ドラッグ解除直後はクリック無効
        clickDisabledRef.current = true;
        setTimeout(() => { clickDisabledRef.current = false; }, 120);
        if (rafId === null) {
          rafId = requestAnimationFrame(animate);
        }
      }
    };
    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const delta = clientX - dragLastX;
      xs = xs.map(x => x + delta);
      setLists();
      dragLastX = clientX;
    };

    // イベントリスナー登録
    wrapper.addEventListener('mousedown', onPointerDown);
    wrapper.addEventListener('touchstart', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('touchmove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchend', onPointerUp);

    return () => {
      running = false;
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (grabTimer) clearTimeout(grabTimer);
      wrapper.removeEventListener('mousedown', onPointerDown);
      wrapper.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchend', onPointerUp);
    };
  }, [items, isMobile]);

  return (
    <div className={styles.wrapper}>
      <div ref={wrapperRef} className={styles.news_list_wrapper} style={{ position: "relative" }}>
        {isMobile ? (
          <ul className={styles.list} style={{ display: 'flex', flexDirection: 'column' }}>
            {items.map(item => (
              <li
                key={item.id}
                className={styles.list_item}
                onClick={e => {
                  if (clickDisabledRef.current) return;
                  if (onItemClick) onItemClick(item);
                  else router.push(`/news/${item.id}`);
                }}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.image}>
                  {item.imgUrl && <img src={item.imgUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <p className={styles.type_text}>{item.type}</p>
                <div className={styles.main_text}>
                  <h4 className={styles.title}>{item.title}</h4>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          [0, 1, 2].map(idx => (
            <ul ref={listRefs[idx]} className={styles.list} key={"list" + idx}>
              {items.map(item => (
                <li
                  key={item.id + "_" + idx}
                  className={styles.list_item}
                  onClick={e => {
                    if (clickDisabledRef.current) return;
                    if (onItemClick) onItemClick(item);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <Link
                    href={`/news/${item.id}`}
                    draggable={false}
                    onClick={e => {
                      if (clickDisabledRef.current) {
                        e.preventDefault();
                        return;
                      }
                    }}
                  >
                    <div className={styles.image}>
                      {item.imgUrl && <img src={item.imgUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>
                    <p className={styles.type_text}>{item.type}</p>
                    <div className={styles.main_text}>
                      <h4 className={styles.title}>{item.title}</h4>
                      <div className={styles.button}>詳細</div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ))
        )}
      </div>
    </div>
  );
};

export default NewsSlider;