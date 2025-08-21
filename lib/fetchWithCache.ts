export async function fetchWithCache(key: string, url: string) {
  const cached = window.localStorage.getItem(key);
  if (cached) {
    return JSON.parse(cached);
  }
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  window.localStorage.setItem(key, JSON.stringify(data));
  return data;
}
