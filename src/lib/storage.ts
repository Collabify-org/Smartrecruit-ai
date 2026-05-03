const PREFIX = "smartrecruit:";

export function lsGet<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(PREFIX + key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function lsSet<T>(key: string, value: T) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {}
}

export function lsRemove(key: string) {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {}
}