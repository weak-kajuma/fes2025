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
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      maxWidth: '100vw',
      overflowX: 'hidden',
      minHeight: '100vh',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <form onSubmit={handleSubmit} style={{
        maxWidth: '600px',
        width: '100%',
        margin: '0 auto',
        padding: '20px',
        boxSizing: 'border-box'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>予約フォーム</h2>
        <div style={{ marginBottom: '20px' }}>
          <input
            placeholder="名前"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxSizing: 'border-box'
            }}
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <input
            placeholder="メールアドレス"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxSizing: 'border-box'
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '15px',
            fontSize: '16px',
            backgroundColor: '#0068b7',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          予約する
        </button>
      </form>
    </div>
  );
}
