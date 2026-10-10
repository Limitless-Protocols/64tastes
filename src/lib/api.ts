import { getDeviceId } from './deviceId';

type Listener = (resolve: (ok: boolean) => void) => void;
let listener: Listener | null = null;

export function setVerifyListener(fn: Listener | null) {
  listener = fn;
}

function requestVerification(): Promise<boolean> {
  return new Promise((resolve) => {
    if (!listener) return resolve(false);
    listener(resolve);
  });
}

export async function postJson(url: string, body: Record<string, unknown>): Promise<Response> {
  const init: RequestInit = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deviceId: getDeviceId(), ...body }),
  };
  let res = await fetch(url, init);
  if (res.status === 401 && (await requestVerification())) res = await fetch(url, init);
  return res;
}