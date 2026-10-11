const KEY = 'foodmap:device:v1';
let memoryId: string | null = null;

export function getDeviceId(): string {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return (memoryId ??= crypto.randomUUID());
  }
}