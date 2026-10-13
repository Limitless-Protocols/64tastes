import MiniMap from './MiniMap';
import { viewBox, totalDishes } from '@/lib/data';
import { getTier } from '@/lib/tiers';
import { bn } from '@/lib/format';
import { SITE_HOST } from '@/lib/site';

export const FORMATS = {
  landscape: { w: 1200, h: 630, label: 'Facebook post' },
  story: { w: 1080, h: 1920, label: 'Story' },
} as const;
export type Format = keyof typeof FORMATS;

const [, , vbW, vbH] = viewBox.split(' ').map(Number);
const ratio = vbW / vbH;

export default function ShareCard({ eaten, format }: { eaten: Set<number>; format: Format }) {
  const { w, h } = FORMATS[format];
  const story = format === 'story';
  const tier = getTier(eaten.size, totalDishes);
  const mapH = story ? 1050 : 500;

  const header = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
      <div style={{ width: story ? 16 : 12, height: story ? 64 : 48, borderRadius: 10, background: '#D23021' }} />
      <div>
        <div style={{ fontSize: story ? 26 : 19, fontWeight: 800, color: '#596653', letterSpacing: 3 }}>
          KHABAR Passport · EDITION 01
        </div>
        <div style={{ marginTop: 5, fontSize: story ? 56 : 38, fontWeight: 800, color: '#3D852D' }}>
          বাংলাদেশের খাবার মানচিত্র
        </div>
      </div>
    </div>
  );

  const summary = (
    <div style={{ textAlign: story ? 'center' : 'left', color: '#20291f' }}>
      <div style={{ fontSize: story ? 104 : 72, fontWeight: 800, lineHeight: 1.3, color: '#3D852D' }}>
        {tier.bn}
      </div>
      <div style={{ display: 'inline-block', marginTop: 16, padding: '12px 20px', borderRadius: 18, background: '#E1C714', color: '#20291f', fontSize: story ? 64 : 44, fontWeight: 800, lineHeight: 1.3 }}>
        {bn(eaten.size)} <span style={{ fontSize: story ? 40 : 28, fontWeight: 600 }}> / {bn(totalDishes)} খাবার চেখেছি</span>
      </div>
      <div style={{ marginTop: story ? 40 : 28, fontSize: story ? 46 : 32, color: '#596653', lineHeight: 1.4 }}>
        তুমি কতটা চেখেছ?
      </div>
      <div style={{ marginTop: 12, fontSize: story ? 28 : 20, fontWeight: 700, color: '#3D852D' }}>{SITE_HOST}</div>
    </div>
  );

  const map = <MiniMap eaten={eaten} style={{ height: mapH, width: mapH * ratio, flexShrink: 0 }} />;

  return (
    <div
      style={{
        width: w,
        height: h,
        boxSizing: 'border-box',
        background: '#E9EEE0',
        color: '#20291f',
        display: 'flex',
        flexDirection: story ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: story ? 90 : 56,
        gap: 40,
        border: '18px solid #d5ddce',
      }}
    >
      {story ? (
        <>
          {header}
          {map}
          {summary}
        </>
      ) : (
        <>
          <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            {header}
            {summary}
          </div>
          {map}
        </>
      )}
    </div>
  );
}
