import { districts, paths, viewBox } from '@/lib/data';
import { districtFill } from '@/lib/colors';

export default function MiniMap({
  eaten,
  style,
}: {
  eaten: Set<number>;
  style?: React.CSSProperties;
}) {
  return (
    <svg viewBox={viewBox} style={style} aria-hidden="true">
      {districts.map((d) => (
        <path
          key={d.id}
          d={paths[d.id]}
          fill={districtFill(d.id, eaten)}
          stroke="#ffffff"
          strokeWidth={1.5}
        />
      ))}
    </svg>
  );
}