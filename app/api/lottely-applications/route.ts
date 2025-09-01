import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
// NextAuth fallback removed to avoid mismatched key types (uuid vs email)

import type { Database } from '@/lib/database.types';



export async function DELETE(request: Request) {
  const userCtx = await getUserContext();
  if (!userCtx) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { userId, client } = userCtx;
  try {
    const body = await request.json();
    const event_id = body.event_id;
    const event_time = body.event_time;
    if (typeof event_id !== 'number' || typeof event_time !== 'string') {
      return NextResponse.json({ error: 'event_idとevent_timeは必須です' }, { status: 400 });
    }
    const { error } = await client
      .from('lottery_applications')
      .delete()
      .eq('user_id', userId)
      .eq('event_id', event_id)
      .eq('event_time', event_time);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}



// 固定の名前空間（任意のUUID）: NextAuthのemailから安定的なUUIDv5を生成するため
const NEXTAUTH_UUID_NAMESPACE = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createSupabaseClient<Database>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function getUserContext() {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const { data: { session: supaSession } } = await supabase.auth.getSession();
  const email = supaSession?.user?.email;
  if (email) {
    // user_uuidsテーブルからuuid取得
    const { data, error } = await supabase
      .from('user_uuids')
      .select('uuid')
      .eq('email', email)
      .single<{ uuid: string }>();
    if (data?.uuid) {
      return { userId: data.uuid, client: supabase } as const;
    }
  }
  return null;
}

export async function GET(request: Request) {

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');
  if (!userId) {
    return NextResponse.json({ error: 'user_idは必須です' }, { status: 400 });
  }
  const client = getAdminClient();
  if (!client) {
    return NextResponse.json({ error: 'Supabase管理者クライアントの初期化に失敗しました' }, { status: 500 });
  }
  try {
    const { data, error } = await client
      .from('lottery_applications')
      .select('*')
      .eq('user_id', userId);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ results: data ?? [] });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {

  const body = await request.json();
  const userId = body.user_id;
  const event_ids = body.event_id;
  const event_times = body.event_time;
  const user_name: string | undefined = typeof body.user_name === 'string' ? body.user_name : undefined;

  if (!userId) {
    return NextResponse.json({ error: 'user_idは必須です' }, { status: 400 });
  }
  if (!Array.isArray(event_ids) || !Array.isArray(event_times) || event_ids.length !== event_times.length) {
    return NextResponse.json({ error: 'event_idとevent_timeは同じ長さの配列である必要があります。' }, { status: 400 });
  }

  const client = getAdminClient();
  if (!client) {
    return NextResponse.json({ error: 'Supabase管理者クライアントの初期化に失敗しました' }, { status: 500 });
  }

  try {
    // 同じuser_idで異なるuser_nameが登録できないようにチェック
    if (user_name && user_name.trim().length > 0) {
      const { data: existing, error: dupError } = await client
        .from('lottery_applications')
        .select('user_name')
        .eq('user_id', userId);
      if (dupError) {
        return NextResponse.json({ error: '名前の重複チェックに失敗しました。' }, { status: 500 });
      }
      if (existing && existing.length > 0) {
        const registeredName = typeof existing[0].user_name === 'string' ? existing[0].user_name : undefined;
        if (registeredName && registeredName !== user_name) {
          return NextResponse.json({ error: '同じユーザーIDで異なる名前は登録できません。' }, { status: 409 });
        }
      }
    }

    // event_idとevent_timeの組み合わせごとに1レコードずつ追加
    let allResults: any[] = [];
    for (let i = 0; i < event_ids.length; i++) {
      const payload: any = {
        user_id: userId,
        event_id: event_ids[i],
        event_time: event_times[i],
      };
      if (user_name) payload.user_name = user_name;
      const { data, error } = await client
        .from('lottery_applications')
        .insert(payload)
        .select();
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      allResults.push(data);
    }
    return NextResponse.json({ results: allResults });
  } catch (error) {
    console.error('Unexpected error in POST /api/lottery-applications:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
