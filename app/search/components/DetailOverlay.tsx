"use client";

import styles from './DetailOverlay.module.css';

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
  return (
    <div className={styles.detail_overlay}>
      <div className={styles.detail_content}>
        <button className={styles.close_button} onClick={onClose}>
          ✕
        </button>

        <div className={styles.event_info}>
          <h2 className={styles.event_title}>{event.title}</h2>
          {event.host && <p className={styles.event_host}>{event.host}</p>}
          {event.locationType && (
            <p className={styles.event_location}>
              <span className={styles.location_icon}>📍</span>
              {event.locationType}
            </p>
          )}
          {event.intro && <p className={styles.event_intro}>{event.intro}</p>}
          {event.brief_intro && <p className={styles.event_brief}>{event.brief_intro}</p>}
          {event.tags && event.tags.length > 0 && (
            <div className={styles.event_tags}>
              {event.tags.map((tag, index) => (
                <span key={index} className={styles.tag}>{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}