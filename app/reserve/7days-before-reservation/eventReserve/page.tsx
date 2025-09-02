import { Suspense } from "react";

import EventReserveClient from "./EventReserveClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EventReserveClient />
    </Suspense>
  );
}
