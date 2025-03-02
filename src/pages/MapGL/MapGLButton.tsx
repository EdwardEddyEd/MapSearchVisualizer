import React from "react";
import { ReactNode } from "react";
import { Tooltip, TooltipPositions } from "@components/Tooltip/Tooltip";

type MapGLButtonProps = {
  icon: ReactNode;
  onClick: () => void;
  tooltip?: string;
  tooltipPosition?: TooltipPositions;
  disabled?: boolean;
  debug?: boolean;
  btnDebugText?: string;
  className?: string;
};

export const MapGLButton = React.memo(
  ({
    icon,
    onClick,
    tooltip,
    tooltipPosition = "top",
    disabled = false,
    debug = false,
    btnDebugText,
    className,
  }: MapGLButtonProps) => {
    if (debug) console.log(`Render button: ${btnDebugText}`);

    const renderMapGLButton = (
      <div
        className={`p-1.5 text-black bg-white rounded hover:bg-slate-200 leaflet-control shadow shadow-slate-500 !cursor-pointer ${disabled ? "opacity-15" : ""} ${className}`}
        onClick={!disabled ? onClick : undefined}
      >
        {icon}
      </div>
    );

    return tooltip ? (
      <Tooltip tooltipContent={tooltip} tooltipPosition={tooltipPosition}>
        {renderMapGLButton}
      </Tooltip>
    ) : (
      renderMapGLButton
    );
  }
);
