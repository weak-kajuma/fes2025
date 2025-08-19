import { Suspense } from "react";

import EventReserveClient from "./EventReserveClient";
import { EventProvider } from "../EventContext";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EventProvider>
        <EventReserveClient />
      </EventProvider>
    </Suspense>
  );
}
