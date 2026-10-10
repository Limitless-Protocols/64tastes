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
    <div style={{ fontSize: story ? 56 : 38, fontWeight: 700, color: '#047857' }}>
      বাংলাদেশ ফুড ম্যাপ
    </div>
  );

  const summary = (
    <div style={{ textAlign: story ? 'center' : 'left' }}>
      <div style={{ fontSize: story ? 104 : 72, fontWeight: 800, lineHeight: 1.3 }}>
        {tier.bn}
      </div>
      <div style={{ marginTop: 16, fontSize: story ? 64 : 44, fontWeight: 600, lineHeight: 1.4 }}>
        {bn(eaten.size)} / {bn(totalDishes)} খাবার চেখেছি
      </div>
      <div style={{ marginTop: story ? 40 : 28, fontSize: story ? 46 : 32, color: '#4b5563', lineHeight: 1.4 }}>
        তুমি কতটা চেখেছ? {SITE_HOST}
      </div>
    </div>
  );

  const map = <MiniMap eaten={eaten} style={{ height: mapH, width: mapH * ratio, flexShrink: 0 }} />;

  return (
    <div
      style={{
        width: w,
        height: h,
        boxSizing: 'border-box',
        background: '#fffbeb',
        color: '#111827',
        display: 'flex',
        flexDirection: story ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: story ? 90 : 56,
        gap: 40,
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