interface Props {
  stats: { label: string; value: number }[];
  size?: number;
  color?: string;
}

export default function StatRadar({ stats, size = 200, color = 'var(--accent)' }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = size * 0.38;
  const n = stats.length;

  function polarToCart(angle: number, radius: number): [number, number] {
    const rad = (angle - 90) * (Math.PI / 180);
    return [cx + radius * Math.cos(rad), cy + radius * Math.sin(rad)];
  }

  const angleStep = 360 / n;

  // Background grid rings
  const rings = [1, 2, 3, 4, 5].map(level => {
    const r = (level / 5) * maxRadius;
    const points = stats.map((_, i) => polarToCart(i * angleStep, r).join(',')).join(' ');
    return <polygon key={level} points={points}
      fill="none" stroke="var(--border)" strokeWidth="1" opacity={level === 5 ? 0.6 : 0.3} />;
  });

  // Axis lines
  const axes = stats.map((_, i) => {
    const [x, y] = polarToCart(i * angleStep, maxRadius);
    return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--border)" strokeWidth="1" opacity="0.3" />;
  });

  // Data polygon
  const dataPoints = stats.map((s, i) => polarToCart(i * angleStep, (s.value / 5) * maxRadius).join(',')).join(' ');

  // Labels
  const labels = stats.map((s, i) => {
    const [x, y] = polarToCart(i * angleStep, maxRadius + 18);
    return (
      <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
        fill="var(--text-muted)" fontSize="10" fontWeight="600" fontFamily="Inter, sans-serif">
        {s.label}
      </text>
    );
  });

  // Value dots
  const dots = stats.map((s, i) => {
    const [x, y] = polarToCart(i * angleStep, (s.value / 5) * maxRadius);
    return <circle key={i} cx={x} cy={y} r="3" fill={color} />;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {rings}
      {axes}
      <polygon points={dataPoints} fill={`${color}`} fillOpacity="0.15"
        stroke={color} strokeWidth="2" />
      {dots}
      {labels}
    </svg>
  );
}
