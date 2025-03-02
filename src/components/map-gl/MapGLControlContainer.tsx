type positionKeys =
  | "top"
  | "top-left"
  | "bottom-left"
  | "bottom"
  | "bottom-right"
  | "top-right";

const positionClass: Record<positionKeys, string> = {
  top: "maplibregl-ctrl-top-left w-full absolute left-1/2 transform top-0",
  "top-left": "maplibregl-ctrl-top-left",
  "bottom-left": "maplibregl-ctrl-bottom-left",
  bottom:
    "maplibregl-ctrl-bottom-left w-full absolute left-1/2 transform bottom-0",
  "bottom-right": "maplibregl-ctrl-bottom-right",
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
