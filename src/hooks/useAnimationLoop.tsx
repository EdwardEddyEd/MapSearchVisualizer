import { useState, useEffect, useRef, useCallback } from "react";

interface UseAnimationLoopOptions {
  fps?: number;
  paused?: boolean;
}

export const useAnimationLoop = (
  callback: () => void,
  options: UseAnimationLoopOptions = {}
) => {
  const { fps = 30, paused = false } = options;
  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const intervalRef = useRef<number>(1000 / fps);
  const [lastFrameUnixTimeMS, setLastFrameUnixTimeMS] = useState<number>(0);

  // Update interval when fps changes
  useEffect(() => {
    intervalRef.current = 1000 / fps;
  }, [fps]);

  const loop = useCallback(
    (time: number) => {
      // Force render update as soon as possible
      setLastFrameUnixTimeMS(Date.now());
      frameRef.current = requestAnimationFrame(loop);

      // Don't proceed if paused
      if (!frameRef.current || paused) return;

      // Callback once enough time has passed based on fps
      if (time - lastTimeRef.current > intervalRef.current) {
        lastTimeRef.current = time;
        callback();
      }
    },
    [callback, paused]
  );

  useEffect(() => {
    frameRef.current = requestAnimationFrame(loop);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [loop]);

  return { lastFrameUnixTimeMS };
};
