// app/admin/page.tsx
import { supabase } from "@/lib/supabaseClient";

export default async function AdminPage() {
  const { data: reservations } = await supabase
    .from('reservations')
    .select('*, reservation_slots(title)');

  return (
    <div>
      <h1>管理画面</h1>
      {reservations?.map((r) => (
        <div key={r.id}>
          <p>{r.token} - {r.name}</p>
        </div>
      ))}
    </div>
  );
}
