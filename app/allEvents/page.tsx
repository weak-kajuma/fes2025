"use client";

import dynamic from "next/dynamic";
import styles from "./page.module.css";

const Scene = dynamic(() => import("@/components/model/Scene"), { ssr: false });

export default function AllEvents() {
  return (
    <div className={styles.container}>
      <Scene />
    </div>
  );
}
