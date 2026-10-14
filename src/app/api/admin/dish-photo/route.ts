import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { sql } from '@/lib/db';
import { isAdminApi } from '@/lib/admin';
import { validDishIds } from '@/lib/validate';
import { dishTag } from '@/lib/dishContent';

const MAX_BYTES = 600_000;

export async function POST(req: Request) {
  if (!(await isAdminApi())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const dishId = Number(form?.get('dishId'));
  const file = form?.get('file');
  const credit = String(form?.get('credit') ?? '').trim().slice(0, 120);

  if (!validDishIds.has(dishId) || !(file instanceof File)) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }
  if (file.size === 0 || file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'too_large' }, { status: 413 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const isJpeg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  const isWebp =
    buf.subarray(0, 4).toString('latin1') === 'RIFF' &&
    buf.subarray(8, 12).toString('latin1') === 'WEBP';
  if (!isJpeg && !isWebp) return NextResponse.json({ error: 'bad_type' }, { status: 415 });

  await sql`
    insert into dish_photos (dish_id, data_b64, content_type, credit)
    values (${dishId}, ${buf.toString('base64')}, ${isWebp ? 'image/webp' : 'image/jpeg'}, ${credit || null})
    on conflict (dish_id) do update set
      data_b64 = excluded.data_b64,
      content_type = excluded.content_type,
      credit = excluded.credit,
      updated_at = now()`;

  revalidateTag(dishTag(dishId), 'max');
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!(await isAdminApi())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => null);
  const dishId = body?.dishId;
  if (!validDishIds.has(dishId)) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  await sql`delete from dish_photos where dish_id = ${dishId}`;
  revalidateTag(dishTag(dishId), 'max');
  return NextResponse.json({ ok: true });
}