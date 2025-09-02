// 任意のjsonファイルをfetchで取得し、型安全に返す汎用関数
export async function fetchLocalJson<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) throw new Error('Failed to fetch local json: ' + path);
  return await res.json();
}
