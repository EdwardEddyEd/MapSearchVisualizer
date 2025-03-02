import React, { useMemo, useState, useRef, useEffect } from "react";
import { MapGLButton } from "./MapGLButton";
import {
  KeyboardDoubleArrowUp,
  KeyboardDoubleArrowDown,
} from "@mui/icons-material";
import { MapGLControlContainer } from "./MapGLControlContainer";
import "./MapGLDrawerController.css";

type MapGLDrawerControllerProps = {
  children?: React.ReactNode;
};

export function MapGLDrawerController(props: MapGLDrawerControllerProps) {
  const [open, setOpen] = useState<boolean>(false);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const drawerHeight = useRef<number>(0);

  const drawerIcon = useMemo(
    () => (open ? <KeyboardDoubleArrowDown /> : <KeyboardDoubleArrowUp />),
    [open]
  );

  useEffect(() => {
    if (drawerRef.current) {
      drawerHeight.current = drawerRef.current.scrollHeight + 8; // 8px = 0.5rem = mb-2 tailwind class
    }
  }, [props.children]);

  return (
    <MapGLControlContainer
      position="bottom"
      className=" text-black transition-all"
    >
      <div className="flex flex-col items-center">
        <div>
          <MapGLButton
            icon={drawerIcon}
            onClick={() => setOpen((prev) => !prev)}
            className="mb-2"
          />
        </div>
        <div
          ref={drawerRef}
          className={`drawer-content ${open ? "open mb-2" : "closed"} bg-white leaflet-control rounded shadow shadow-slate-500`}
          style={{ maxHeight: open ? `${drawerHeight.current}px` : "0" }}
        >
          {props.children}
        </div>
      </div>
    </MapGLControlContainer>
  );
}
