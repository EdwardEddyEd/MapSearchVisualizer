import React from "react";
import { ReactNode } from "react";

type MapButtonProps = {
  icon: ReactNode;
  onClick: () => void;
  hoverText: string;
  disabled?: boolean;
};

export const MapButton = React.memo(
  ({ icon, hoverText, onClick, disabled = false }: MapButtonProps) => {
    return (
      <div
        className={`p-2 bg-slate-100 rounded hover:bg-slate-200 leaflet-control shadow shadow-slate-500 !cursor-pointer ${disabled ? "opacity-15" : ""}`}
        title={hoverText}
        onClick={!disabled ? onClick : undefined}
      >
        {icon}
      </div>
    );
  }
);
