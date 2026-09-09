"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Slash = {
  id: number;
  x: number;
  y: number;
  angle: number;
  triple: boolean;
};

let nextId = 1;

function playSwoosh() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const duration = 0.28;
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / data.length;
      data[i] = (Math.random() * 2 - 1) * (1 - t) * 0.5;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(3200, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + duration);
    filter.Q.value = 1.2;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.22, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();
    source.onended = () => void ctx.close();
  } catch {
    // Sin audio: el corte sigue funcionando.
  }
}

export function SlashOverlay() {
  const [slashes, setSlashes] = useState<Slash[]>([]);
  const timeouts = useRef<number[]>([]);

  const spawn = useCallback((x: number, y: number) => {
    const id = nextId++;
    const angle = -35 + Math.random() * 70;
    const triple = Math.random() < 0.45;
    setSlashes((prev) => [...prev.slice(-11), { id, x, y, angle, triple }]);
    const timeout = window.setTimeout(() => {
      setSlashes((prev) => prev.filter((s) => s.id !== id));
    }, 650);
    timeouts.current.push(timeout);
  }, []);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || event.isPrimary === false) return;
      spawn(event.clientX, event.clientY);
      playSwoosh();
    };
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    const pending = timeouts.current;
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      pending.forEach((t) => window.clearTimeout(t));
    };
  }, [spawn]);

  return (
    <div className="slash-layer" aria-hidden="true">
      {slashes.map((slash) => (
        <div
          key={slash.id}
          className="slash"
          style={{ left: slash.x, top: slash.y, ["--slash-angle" as string]: `${slash.angle}deg` }}
        >
          <span className="slash-flash" />
          <span className="slash-blade slash-blade-main" />
          {slash.triple && (
            <>
              <span className="slash-blade slash-blade-top" />
              <span className="slash-blade slash-blade-bottom" />
            </>
          )}
          <span className="slash-spark slash-spark-a" />
          <span className="slash-spark slash-spark-b" />
        </div>
      ))}
    </div>
  );
}
