import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  KeyboardDoubleArrowRight,
  KeyboardDoubleArrowLeft,
} from "@mui/icons-material";
import { MapGLControlContainer } from "@pages/MapGL/MapGLControlContainer";
import { MapGLButton } from "@pages/MapGL/MapGLButton";
import "./MapGLLeftDrawer.css";

type MapGLLeftDrawerProps = {
  children?: React.ReactNode;
};

export function MapGLLeftDrawer(props: MapGLLeftDrawerProps) {
  const [open, setOpen] = useState<boolean>(false);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const drawerWidth = useRef<number>(0);

  const drawerIcon = useMemo(
    () => (open ? <KeyboardDoubleArrowLeft /> : <KeyboardDoubleArrowRight />),
    [open]
  );

  useEffect(() => {
    if (drawerRef.current) {
      drawerWidth.current = drawerRef.current.scrollWidth + 8; // 8px = 0.5rem = mb-2 tailwind class
    }
  }, [props.children]);

  return (
    <MapGLControlContainer position="top-left" className=" text-black">
      <div className="flex flex-row-reverse mt-2">
        <div
          className={`drawer-button ${open ? "open" : ""}`}
          style={{
            transform: open
              ? `translateX(0px)`
              : `translateX(-${drawerWidth.current}px)`,
          }}
        >
          <MapGLButton
            icon={drawerIcon}
            onClick={() => setOpen((prev) => !prev)}
            className="ml-2"
          />
        </div>
        <div
          ref={drawerRef}
          className={`drawer-content ${open ? "open" : "closed"} bg-white leaflet-control rounded shadow shadow-slate-500 ml-2`}
          style={{
            transform: open
              ? `translateX(0px)`
              : `translateX(-${drawerWidth.current}px)`,
          }}
        >
          {props.children}
        </div>
      </div>
    </MapGLControlContainer>
  );
}
