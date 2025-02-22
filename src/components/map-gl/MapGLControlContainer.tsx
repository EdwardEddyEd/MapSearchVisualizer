type positionKeys =
  | "top"
  | "top-left"
  | "left"
  | "bottom-left"
  | "bottom"
  | "bottom-right"
  | "right"
  | "top-right";

const positionClass: Record<positionKeys, string> = {
  top: "absolute left-1/2 transform -translate-x-1/2 top-0",
  "top-left": "maplibregl-ctrl-top-left",
  left: "absolute top-1/2 transform -translate-y-1/2 top-0 left-0",
  "bottom-left": "maplibregl-ctrl-bottom-left",
  bottom: "absolute left-1/2 transform -translate-x-1/2 bottom-0",
  "bottom-right": "maplibregl-ctrl-bottom-right",
  right: "absolute top-1/2 transform -translate-y-1/2 top-0 right-0",
  "top-right": "maplibregl-ctrl-top-right",
};

type MapGLControlContainer = {
  children: React.ReactNode;
  position?: positionKeys;
  className?: string;
};

export function MapGLControlContainer({
  children,
  position = "top-left",
  className = "",
}: MapGLControlContainer) {
  return (
    <div className={`${positionClass[position]} ${className}`}>{children}</div>
  );
}
