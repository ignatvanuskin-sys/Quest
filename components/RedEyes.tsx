/**
 * Декоративные «красные глаза», выглядывающие из тьмы.
 * Чистый CSS, без JS-логики и без компонентных листенеров:
 * появление/моргание задаются keyframes (см. .red-eyes в globals.css).
 * При prefers-reduced-motion глаза скрыты (opacity гасится CSS).
 * Доступность: aria-hidden, в поток фокуса не попадают.
 */

const eyes: Array<{
  left: string;
  top: string;
  dur: string;
  delay: string;
}> = [
  { left: "6%", top: "16%", dur: "7s", delay: "0.4s" },
  { left: "76%", top: "12%", dur: "8s", delay: "2.2s" },
  { left: "14%", top: "58%", dur: "9s", delay: "4.1s" },
  { left: "82%", top: "62%", dur: "6.6s", delay: "1.4s" },
  { left: "48%", top: "8%", dur: "8.6s", delay: "3.3s" },
  { left: "44%", top: "86%", dur: "7.6s", delay: "5.2s" },
];

export default function RedEyes() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {eyes.map((e, i) => (
        <span
          key={i}
          className="red-eyes"
          style={{
            left: e.left,
            top: e.top,
            ["--eyes-dur" as string]: e.dur,
            ["--eyes-delay" as string]: e.delay,
          }}
        >
          <i className="red-eye" />
          <i className="red-eye" />
        </span>
      ))}
    </div>
  );
}
