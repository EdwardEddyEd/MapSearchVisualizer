import { Node } from "@classes/graph/Graph";

type MapSearchProps = {
  startPoint?: Node;
  endPoint?: Node;
};

export function MapSearch(props: MapSearchProps) {
  return (
    <div className="flex flex-col mt-2 leaflet-top left-1/2 transform -translate-x-1/2 text-black gap-2">
      {props.startPoint && (
        <div className="px-1.5 py-0.5 bg-slate-100 rounded-3xl shadow shadow-slate-500">
          Start point selected!
        </div>
      )}
      {props.endPoint && (
        <div className="px-1.5 py-0.5 bg-slate-100 rounded-3xl shadow shadow-slate-500">
          End point selected!
        </div>
      )}
    </div>
  );
}
