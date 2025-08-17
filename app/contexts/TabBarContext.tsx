"use client";

import { createContext } from "react";

type EventDataForClient = {
  id: number;
  title: string | null;
  host: string | null;
  intro: string | null;
  brief_intro: string | null;
  locationType: string | null;
  tags: string[] | null;
};

// TabBarのrefとアニメーション関数、イベントデータを共有するためのコンテキスト
export const TabBarContext = createContext<{
  tabBarRef: React.RefObject<HTMLDivElement | null>;
  triggerAnimation: (event?: EventDataForClient) => void;
  selectedEvent: EventDataForClient | null;
  isExpanded: boolean;
  closeExpanded: () => void;
} | null>(null);