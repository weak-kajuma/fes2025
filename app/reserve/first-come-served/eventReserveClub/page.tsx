import { Suspense } from "react";

import EventReserveClubClient from "./EventReserveClubClient";
import { EventProvider } from "../EventContext";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EventProvider>
        <EventReserveClubClient />
      </EventProvider>
    </Suspense>
  );
}
