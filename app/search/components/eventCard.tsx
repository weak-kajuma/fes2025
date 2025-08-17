"use client"

import { useContext } from 'react';
import styles from './eventCard.module.css';
import { TabBarContext } from '../../contexts/TabBarContext';

type EventDataForClient = {
  id: number;
  title: string | null;
  host: string | null;
  intro: string | null;
  brief_intro: string | null;
  locationType: string | null;
  tags: string[] | null;
};

export default function EventCard({ event, onClick }: { event: EventDataForClient, onClick?: (event: EventDataForClient) => void }) {
  const tabBarContext = useContext(TabBarContext);

  const handleClick = () => {
    // TabBarのアニメーションをトリガー（イベントデータを渡す）
    if (tabBarContext?.triggerAnimation) {
      tabBarContext.triggerAnimation(event);
    }

    // 元のonClick関数を実行
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <div className={styles.event_card} onClick={handleClick}>

      <div className={styles.img}></div>

      <h2 className={styles.event_title}>{event.title}</h2>
      {event.host && <p className={styles.event_host}>{event.host}</p>}
      {event.locationType && <p className={styles.event_location}>{event.locationType}</p>}
      {event.brief_intro && <p className={styles.event_brief}>{event.brief_intro}</p>}
      {event.tags && event.tags.length > 0 && (
        <div className={styles.event_tags}>
          {event.tags.map((tag, index) => (
            <span key={index} className={styles.tag}>{tag}</span>
          ))}
        </div>
      )}

      <div className={styles.bottom}>
        <div className={styles.bottom_inner}></div>
      </div>
    </div>
  );
}