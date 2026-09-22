/**
 * ���֧ܧ��ѧ�ڧӧߧ�� �ܧ�ѧ�ߧ�� �ԧݧѧ٧�, �ӧ�ԧݧ�է�ӧѧ��ڧ� �ڧ� ���ާ�.
 * ���ڧ���� CSS, �ҧ֧� JS-���ק��ڧܧ�� �� �ҧ֧�ܧ�ߧ֧�ߧ�� �ݧקԧܧڧ� keyframes.
 * ����� prefers-reduced-motion �ԧݧѧ٧� ���ѧ�ڧ�ߧ� (opacity ��֧�֧� CSS).
 * ���֧ܧ��ѧ�ڧӧߧ�: aria-hidden, �ߧ� ����ާ� �ߧ� �ӧݧڧ�֧�.
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