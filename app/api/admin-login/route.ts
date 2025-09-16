import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (!password) return NextResponse.json({ success: false, error: 'パスワード未入力' }, { status: 400 });

  // Supabaseからハッシュ値で検索
  const { data, error } = await supabase
    .from('admin_passwords')
    .select('mode,location_name')
    .eq('password_hash', password)
    .single();

  if (error || !data) {
    return NextResponse.json({ success: false, error: 'パスワードが違います' }, { status: 401 });
  }

  // 認証成功
  return NextResponse.json({ success: true, mode: data.mode, location_name: data.location_name });
}
