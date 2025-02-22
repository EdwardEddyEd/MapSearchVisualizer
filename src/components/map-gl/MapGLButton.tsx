import React from "react";
import { ReactNode } from "react";

type MapGLButtonProps = {
  icon: ReactNode;
  onClick: () => void;
  hoverText: string;
  disabled?: boolean;
  debug?: boolean;
};

export const MapGLButton = React.memo(
  ({
    icon,
    hoverText,
    onClick,
    disabled = false,
    debug = false,
  }: MapGLButtonProps) => {
    if (debug) console.log(`Render button: ${hoverText}`);

    return (
      <div
        className={`p-1.5 text-black bg-white rounded hover:bg-slate-200 leaflet-control shadow shadow-slate-500 !cursor-pointer ${disabled ? "opacity-15" : ""}`}
        title={hoverText}
        onClick={!disabled ? onClick : undefined}
      >
        {icon}
      </div>
    );
  }
);
