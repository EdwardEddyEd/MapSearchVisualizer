import { ReactNode } from "react";

type MapButtonProps = {
  icon: ReactNode;
  onClick: () => void;
  hoverText: string;
};

export function MapButton(props: MapButtonProps) {
  return (
    <div
      className="p-2 bg-slate-100 rounded hover:bg-slate-200 leaflet-control shadow shadow-slate-500 !cursor-pointer"
      title={props.hoverText}
      onClick={props.onClick}
    >
      {props.icon}
    </div>
  );
}
