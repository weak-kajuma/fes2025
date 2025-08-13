import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { v5 as uuidv5 } from 'uuid';
// NextAuth fallback removed to avoid mismatched key types (uuid vs email)

import type { Database } from '@/lib/database.types';

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
  if (supaSession?.user?.id) {
    return { userId: supaSession.user.id, client: supabase } as const;
  }
  const nextAuthSession = await auth();
  if (nextAuthSession?.user?.email) {
    const admin = getAdminClient();
    if (admin) {
      const derivedUserId = uuidv5(nextAuthSession.user.email, NEXTAUTH_UUID_NAMESPACE);
      return { userId: derivedUserId, client: admin } as const;
    }
  }
  return null;
}

export async function GET(request: Request) {
  const userCtx = await getUserContext();
  if (!userCtx) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { userId, client } = userCtx;

  try {
    const { data, error } = await client
      .from('lottery_applications')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // 行が見つからないエラーは無視
      console.error('Error fetching lottery application:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || null);
  } catch (error) {
    console.error('Unexpected error in GET /api/lottery-applications:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userCtx = await getUserContext();
  if (!userCtx) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { userId, client } = userCtx;

  const body = await request.json();
  const event_data = body.event_data ?? body.event_ids; // 後方互換: 旧形式event_idsにも対応
  const user_name: string | undefined = typeof body.user_name === 'string' ? body.user_name : undefined;

  if (!Array.isArray(event_data)) {
    return NextResponse.json({ error: 'event_data must be an array' }, { status: 400 });
  }

  try {
    // ユーザー名のユニークチェック（他ユーザーが同じニックネームを使用していないか）
    if (user_name && user_name.trim().length > 0) {
      const { count, error: dupError } = await client
        .from('lottery_applications')
        .select('user_id', { head: true, count: 'exact' })
        .eq('user_name', user_name)
        .neq('user_id', userId);
      if (dupError) {
        return NextResponse.json({ error: '名前の重複チェックに失敗しました。' }, { status: 500 });
      }
      if ((count ?? 0) > 0) {
        return NextResponse.json({ error: 'このニックネームは既に使用されています。別の名前を入力してください。' }, { status: 409 });
      }
    }

    const upsertPayload: any = { user_id: userId, event_data };
    if (user_name) upsertPayload.user_name = user_name;

    const { data, error } = await client
      .from('lottery_applications')
      .upsert(
        upsertPayload,
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (error) {
      console.error('Error saving lottery application:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error in POST /api/lottery-applications:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
