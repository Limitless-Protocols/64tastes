import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

export async function GET() {
  const font = await readFile(
    path.join(process.cwd(), 'src/assets/NotoSansBengali-Bold.ttf')
  );
  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%',
        alignItems: 'center', justifyContent: 'center',
        background: 'white', fontSize: 96 }}>
        রসমালাই ক্ষীর শ্রীমঙ্গল
      </div>
    ),
    { width: 1200, height: 630,
      fonts: [{ name: 'Noto Bengali', data: font, weight: 700, style: 'normal' }] }
  );
}