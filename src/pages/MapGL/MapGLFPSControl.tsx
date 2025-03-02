import { useEffect, useRef, useState } from "react";

type MapGLFPSControlProps = {
  newTime: number; // Timestamp from parent component
};

export function MapGLFPSControl({ newTime }: MapGLFPSControlProps) {
  const filterStrength = 3;
  const frameTime = useRef<number>(0);
  const lastTime = useRef<number | null>(null);
  const lastUpdateTime = useRef<number>(Date.now()); // Track the last UI update
  const fpsAccumulator = useRef<number>(0);
  const frameCount = useRef<number>(0);
  const [fps, setFps] = useState<number>(0);

  useEffect(() => {
    if (lastTime.current !== null) {
      const deltaTime = newTime - lastTime.current;
      frameTime.current += (deltaTime - frameTime.current) / filterStrength;
      const currentFps = 1000 / frameTime.current;

      // Accumulate FPS calculations
      fpsAccumulator.current += currentFps;
      frameCount.current += 1;

      // Update the FPS display every second
      const now = Date.now();
      if (now - lastUpdateTime.current >= 1000) {
        setFps(fpsAccumulator.current / frameCount.current); // Average FPS over 1 sec
        fpsAccumulator.current = 0;
        frameCount.current = 0;
        lastUpdateTime.current = now;
      }
    }
    lastTime.current = newTime;
  }, [newTime]);

  const color =
    fps > 30
      ? "text-emerald-600"
      : fps > 20
        ? "text-amber-500"
        : fps > 15
          ? "text-orange-500"
          : "text-red-600";

  return (
    <div
      className={`m-2 p-2  ${color} font-bold bg-white rounded shadow shadow-slate-500`}
    >
      {fps.toFixed(1)} fps
    </div>
  );
}
