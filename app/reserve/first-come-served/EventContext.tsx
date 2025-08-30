"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

export type EventType = {
  id: number;
  name: string;
  date?: number | string;
  hour?: number | string;
  description?: string;
  [key: string]: any;
};

interface EventContextProps {
  event: EventType | null;
  setEvent: (event: EventType | null) => void;
}

const EventContext = createContext<EventContextProps | undefined>(undefined);

export const useEventContext = () => {
  const ctx = useContext(EventContext);
  if (!ctx) throw new Error("useEventContext must be used within EventProvider");
  return ctx;
};

export const EventProvider = ({ children }: { children: ReactNode }) => {
  const [event, setEvent] = useState<EventType | null>(null);
  return (
    <EventContext.Provider value={{ event, setEvent }}>
      {children}
    </EventContext.Provider>
  );
};
