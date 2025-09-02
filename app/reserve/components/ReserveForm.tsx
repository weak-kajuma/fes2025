"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";

type Event = {
  id: number;
  name: string;
  capacity: number;
  reserved_count: number;
  reservation_type: "first-come" | "lottery";
};

export default function ReserveForm({ events }: { events: Event[] }) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [token, setToken] = useState<string | null>(null);

  const handleReserve = async () => {
    if (!name || selectedId == null) return alert("すべて入力してください");

    const userToken = uuidv4(); // トークン生成

    const { error } = await supabase.from("reservations").insert([
      {
        event_id: selectedId,
        name,
        token: userToken,
      },
    ]);

    if (error) {
      alert("予約に失敗しました");
      console.error(error);
      return;
    }

    setToken(userToken);
  };

  return (
    <div>
      <h2 className="text-xl font-bold">イベント予約フォーム</h2>
      <input
        type="text"
        placeholder="名前"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 my-2 w-full"
      />
      <select
        className="border p-2 my-2 w-full"
        value={selectedId ?? ""}
        onChange={(e) => setSelectedId(Number(e.target.value))}
      >
        <option value="">イベントを選択</option>
        {events.map((event) => (
          <option key={event.id} value={event.id}>
            {event.name} ({event.reservation_type === "first-come" ? "先着" : "抽選"})
          </option>
        ))}
      </select>
      <button
        onClick={handleReserve}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        予約する
      </button>

      {token && (
        <div className="mt-4">
          <p className="text-green-600 font-bold">予約完了！</p>
          <p>あなたの予約トークン：<code>{token}</code></p>
          <p>このトークンは控えておいてください。</p>
        </div>
      )}
    </div>
  );
}
