export type TooltipPositions = "top" | "right" | "bottom" | "left";

const tooltipPositionMap: Record<TooltipPositions, string> = {
  top: "tooltip-top",
  right: "tooltip-right",
  bottom: "tooltip-bottom",
  left: "tooltip-left",
};

type TooltipProps = {
  tooltipContent: string | React.ReactNode;
  children: React.ReactNode;
  tooltipClassname?: string;
  tooltipPosition?: TooltipPositions;
};

export function Tooltip({
  tooltipContent,
  children,
  tooltipClassname,
  tooltipPosition = "top",
}: TooltipProps) {
  return (
    <div className={`tooltip ${tooltipPositionMap[tooltipPosition]}`}>
      <div
        className={`tooltip-content ${tooltipClassname} bg-background text-foreground`}
      >
        {tooltipContent}
      </div>
      {children}
    </div>
  );
}
