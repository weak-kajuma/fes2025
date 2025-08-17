import { useRef, useEffect } from "react";
import gsap from "gsap";
import styles from "./NewsCarousel.module.css";

type NewsItem = { id: string | number; title: string; imgUrl?: string; type?: string };

interface NewsSliderProps {
  items: NewsItem[];
}

const NewsSlider = ({ items }: NewsSliderProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const list1Ref = useRef<HTMLUListElement>(null);
  const list2Ref = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const list1 = list1Ref.current;
    const list2 = list2Ref.current;
    if (!wrapper || !list1 || !list2) return;

    // 高さをlist1の高さに合わせる
    // const setHeight = () => {
    //   wrapper.style.height = list1.offsetHeight + "px";
    // };
    // setHeight();
    // window.addEventListener("resize", setHeight);

    const listWidth = list1.offsetWidth;
    let x1 = 0;
    let x2 = listWidth;

    let running = true;
    const animate = () => {
      if (!running) return;
      x1 -= 2;
      x2 -= 2;

      // 後ろのul（x2）が画面左端に到達したら、先頭ul（x1）を後ろに並び替え
      if (x2 <= 0) {
        x1 = x2 + listWidth / 2;
      }
      // 逆も同様
      if (x1 <= 0) {
        x2 = x1 + listWidth / 2;
      }

      gsap.set(list1, { x: x1 });
      gsap.set(list2, { x: x2 });
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      running = false;
      // window.removeEventListener("resize", setHeight);
    };
  }, [items]);

  return (
    <div ref={wrapperRef} className={styles.news_list_wrapper} style={{ position: "relative" }}>
      <ul ref={list1Ref} className={styles.list}>
        {items.map(item => (
          <li key={item.id} className={styles.list_item}>
            <div className={styles.image}>
              {item.imgUrl && <img src={item.imgUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            </div>
            <p className={styles.type_text}>{item.type}</p>
            <div className={styles.main_text}>
              <h4 className={styles.title}>{item.title}</h4>
              <div className={styles.button}>詳細</div>
            </div>
          </li>
        ))}
      </ul>
      <ul ref={list2Ref} className={styles.list} >
        {items.map(item => (
          <li key={item.id + "_2"} className={styles.list_item}>
            <div className={styles.image}>
              {item.imgUrl && <img src={item.imgUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            </div>
            <p className={styles.type_text}>{item.type}</p>
            <div className={styles.main_text}>
              <h4 className={styles.title}>{item.title}</h4>
              <div className={styles.button}>詳細</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NewsSlider;