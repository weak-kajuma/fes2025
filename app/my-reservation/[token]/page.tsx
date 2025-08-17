// app/my-reservation/[token]/page.tsx
import { supabase } from "@/lib/supabaseClient";

export default async function MyReservation({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { data: reservation, error } = await supabase
    .from('reservations')
    .select('*, reservation_slots(*)')
    .eq('token', token)
    .single();

  if (error || !reservation) {
    return <p>予約が見つかりませんでした</p>;
  }

  return (
    <main>
      <h1>{reservation.token}</h1>
      <p>予約者名: {reservation.name}</p>
    </main>
  );
}
