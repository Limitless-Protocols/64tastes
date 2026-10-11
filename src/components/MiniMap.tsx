import { districts, paths, viewBox } from '@/lib/data';
import { districtFill } from '@/lib/colors';
import { PALETTE } from '@/lib/palette';

/** The map at any size — same real geoBoundaries paths, palette fills. */
export default function MiniMap({
  eaten,
  style,
  className,
}: {
  eaten: Set<number>;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <svg viewBox={viewBox} style={style} className={className} aria-hidden="true">
      {districts.map((d) => (
        <path
          key={d.id}
          d={paths[d.id]}
          fill={districtFill(d.id, eaten)}
          stroke={PALETTE.cream}
          strokeWidth={1.5}
        />
      ))}
    </svg>
  );
}
