"use client";

export function TicketButton({ className }: { className?: string }) {
  return (
    <a
      href="/reserve/ticket"
      className={className}
      onClick={() => {
        window.localStorage.clear();
        window.sessionStorage.clear();
      }}
    >
      チケット画面へ進む
    </a>
  );
}
