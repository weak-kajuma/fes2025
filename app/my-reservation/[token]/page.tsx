// app/my-reservation/[token]/page.tsx
import { supabase } from "@/lib/supabaseClient";

export default async function MyReservation({ params }: { params: { token: string } }) {
  const { data: reservation, error } = await supabase
    .from('reservations')
    .select('*, reservation_slots(*)')
    .eq('token', params.token)
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
