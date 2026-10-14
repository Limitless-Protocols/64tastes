import { sql } from '@/lib/db';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dishId = Number(id);
  if (!Number.isInteger(dishId)) return new Response('Not found', { status: 404 });

  const rows = await sql`select data_b64, content_type from dish_photos where dish_id = ${dishId}`;
  if (rows.length === 0) return new Response('Not found', { status: 404 });

  const bytes = new Uint8Array(Buffer.from(rows[0].data_b64, 'base64'));
  return new Response(bytes, {
    headers: {
      'Content-Type': rows[0].content_type,
      'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}