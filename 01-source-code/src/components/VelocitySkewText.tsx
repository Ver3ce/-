import { useEffect, useRef } from 'react';

interface VelocitySkewTextProps {
  text: string;
  className?: string;
  lenisInstance: any;
}

export default function VelocitySkewText({ text, className = '', lenisInstance }: VelocitySkewTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!lenisInstance) return;

    const clamp = (num: number, min: number, max: number) =>
      Math.min(Math.max(num, min), max);

    const map = (x: number, a: number, b: number, c: number, d: number) =>
      clamp((x - a) * (d - c) / (b - a) + c, Math.min(c, d), Math.max(c, d));

    const handleScroll = ({ velocity }: { velocity: number }) => {
      const scrollSkewVal = map(velocity, -1000, 1000, -30, 30);
      const scrollScaleYVal = map(Math.abs(velocity), 0, 1000, 1, 1.2);
      const scrollScaleXVal = map(Math.abs(velocity), 0, 1000, 1, 0.7);
      const skewVal = map(velocity, -1000, 1000, 15, -15);
      const xVal = map(velocity, -1000, 1000, 10, -10);

      linesRef.current.forEach((el) => {
        if (!el) return;
        el.style.transform = `skewX(${scrollSkewVal}deg) scaleY(${scrollScaleYVal}) scaleX(${scrollScaleXVal})`;
        el.style.setProperty('--skew', `${skewVal}deg`);
        el.style.setProperty('--x', `${xVal}vw`);
        el.style.setProperty('--scale-y', `${scrollScaleYVal}`);
        el.style.setProperty('--scale-x', `${scrollScaleXVal}`);
      });
    };

    lenisInstance.on('scroll', handleScroll);
    return () => {
      lenisInstance.off('scroll', handleScroll);
    };
  }, [lenisInstance]);

  // Split text into lines of ~20 chars for visual effect
  const words = text.split('');
  const charsPerLine = 40;
  const lines: string[] = [];
  for (let i = 0; i < words.length; i += charsPerLine) {
    lines.push(words.slice(i, i + charsPerLine).join(''));
  }

  return (
    <div ref={containerRef} className={className}>
      {lines.map((line, i) => (
        <div
          key={i}
          className="velocity-line overflow-hidden relative"
          data-text={line}
        >
          <div
            ref={(el) => {
              if (el) linesRef.current[i] = el;
            }}
            className="velocity-line-inner will-change-transform"
            style={{
              transition: 'transform 0.15s ease-out',
            }}
          >
            {line}
          </div>
        </div>
      ))}
    </div>
  );
}
