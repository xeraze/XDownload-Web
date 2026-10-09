import { useRef, useState } from "react";

type Dims = { ow: number; oh: number; rw: number; rh: number };

type Props = {
  original: string;
  result: string;
  dims: Dims;
  alt: string;
};

export default function Compare({ original, result, dims, alt }: Props) {
  const [pos, setPos] = useState(50);
  const boxRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const move = (clientX: number) => {
    const el = boxRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const p = ((clientX - r.left) / r.width) * 100;
    setPos(Math.max(0, Math.min(100, p)));
  };

  return (
    <div
      ref={boxRef}
      className="relative w-full cursor-ew-resize touch-none overflow-hidden rounded-2xl border border-[color:var(--line)] select-none"
      onPointerDown={(e) => {
        dragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        move(e.clientX);
      }}
      onPointerMove={(e) => {
        if (dragging.current) move(e.clientX);
      }}
      onPointerUp={(e) => {
        dragging.current = false;
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      }}
      onPointerCancel={() => {
        dragging.current = false;
      }}
    >
      <img src={original} alt="" draggable={false} className="block w-full" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
        <img src={result} alt={alt} draggable={false} className="block w-full" />
      </div>
      <span className="absolute left-2 top-2 rounded-lg bg-black px-2.5 py-1 text-xs font-medium text-white">
        {dims.ow} x {dims.oh} px
      </span>
      <span className="absolute right-2 top-2 rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-black shadow-md">
        {dims.rw} x {dims.rh} px
      </span>
      <div className="pointer-events-none absolute inset-y-0" style={{ left: `${pos}%` }}>
        <div className="absolute inset-y-0 -left-px w-0.5 bg-white shadow-[0_0_4px_rgba(0,0,0,0.45)]" />
        <div className="absolute top-1/2 -left-5 flex h-8 w-10 -translate-y-1/2 items-center justify-center gap-1.5 rounded-full border border-[color:var(--line)] bg-white text-[10px] text-neutral-500 shadow-md dark:bg-neutral-900 dark:text-neutral-400">
          <span>&#9664;</span>
          <span>&#9654;</span>
        </div>
      </div>
    </div>
  );
}
