import { EventProvider } from "./EventContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <EventProvider>
      {/* ...existing code... */}
      {children}
      {/* ...existing code... */}
    </EventProvider>
  );
}