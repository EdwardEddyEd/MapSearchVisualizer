import { useState, useEffect, useRef, useCallback } from "react";

interface UseAnimationLoopOptions {
  fps?: number;
  paused?: boolean;
  onCancel?: () => void;
}

export const useAnimationLoop = (
  callback: () => void,
  options: UseAnimationLoopOptions = {}
) => {
  const { fps = 30, paused = false, onCancel } = options;
  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const intervalRef = useRef<number>(1000 / fps);
  const pausedRef = useRef(paused);

  // Update interval when fps changes
  useEffect(() => {
    intervalRef.current = 1000 / fps;
  }, [fps]);

  const loop = useCallback(
    (time: number) => {
      if (!frameRef.current || paused) return; // Stop if paused

      if (time - lastTimeRef.current > intervalRef.current) {
        lastTimeRef.current = time;
        callback();
      }
      frameRef.current = requestAnimationFrame(loop);
    },
    [callback, paused]
  );

  useEffect(() => {
    if (!paused) {
      frameRef.current = requestAnimationFrame(loop);
    }
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [loop, paused]);

  const cancel = useCallback(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      if (onCancel) onCancel();
    }
  }, [onCancel]);

  const step = useCallback(() => {
    if (!pausedRef.current) {
      callback();
    }
  }, [callback]);

  return { cancel, step };
};
