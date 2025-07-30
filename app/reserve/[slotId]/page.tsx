// app/reserve/[slotId]/page.tsx
'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";

export default function ReservationForm({ params }: { params: { slotId: string } }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = uuidv4();
    const { error } = await supabase.from('reservations').insert([{
      slot_id: params.slotId,
      name,
      email,
      token,
      status: 'pending',
    }]);
    if (!error) {
      router.push(`/my-reservation/${token}`);
    } else {
      alert("エラーが発生しました: " + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>予約フォーム</h2>
      <input placeholder="名前" value={name} onChange={(e) => setName(e.target.value)} required />
      <input placeholder="メールアドレス" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button type="submit">予約する</button>
    </form>
  );
}
