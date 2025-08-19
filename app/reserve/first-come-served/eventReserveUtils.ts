// event情報をURLクエリで渡すためのユーティリティ
export function serializeEvent(event: any): string {
  return encodeURIComponent(JSON.stringify(event));
}

export function deserializeEvent(str: string): any {
  try {
    return JSON.parse(decodeURIComponent(str));
  } catch {
    return null;
  }
}
