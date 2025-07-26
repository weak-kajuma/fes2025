"use client"

import styles from './eventCard.module.css';

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
  return (
    <div className={styles.event_card} onClick={() => onClick?.(event)}>

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