import { useEffect, useState } from "react";

export function MapGLMemoryControl() {
  const [memory, setMemory] = useState<{
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapLimit: number;
  } | null>(null);

  useEffect(() => {
    const updateMemoryUsage = () => {
      if ((performance as any).memory) {
        const { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit } = (
          performance as any
        ).memory;
        setMemory({
          usedJSHeapSize,
          totalJSHeapSize,
          jsHeapLimit: jsHeapSizeLimit,
        });
      }
    };

    // Update memory usage every second
    const intervalId = setInterval(updateMemoryUsage, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="m-2 p-2 text-black font-bold bg-white rounded shadow shadow-slate-500">
      {memory ? (
        <>
          <p>
            Used Heap: {(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB
          </p>
          <p>
            Total Heap: {(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB
          </p>
          <p>Heap Limit: {(memory.jsHeapLimit / 1024 / 1024).toFixed(2)} MB</p>
        </>
      ) : (
        <p>Memory API not supported</p>
      )}
    </div>
  );
}
