import { Polyline, Popup } from "react-leaflet";
import type { Polyline as LeafletPolyline } from "leaflet";
import { useRef, useEffect } from "react";
import { Way } from "../graph/Graph";

type MapEdgeProps = {
  edge: Way;
  color: string;
  isVisited: boolean;
  isSolution?: boolean;
};

export function MapEdge({ edge, color, isVisited, isSolution = false }: MapEdgeProps) {
  const polylineRef = useRef<LeafletPolyline>(null);

  const colorLine = isSolution ? "orange" : isVisited ? "yellow" : color;

  useEffect(() => {
    if (polylineRef.current) {
      polylineRef.current.setStyle({
        color: colorLine,
      });
    }
  }, [colorLine]);

  return (
    <Polyline
      ref={polylineRef}
      key={edge.id}
      positions={edge.nodes}
      weight={3}
      color={isVisited ? "yellow" : color}
      className={isVisited ? "glow-visited" : ""}
      children={<Popup autoPan={false}>{edge.id}</Popup>}
      eventHandlers={{
        mouseover: (e) => e.target.openPopup(),
        mouseout: (e) => e.target.closePopup(),
      }}
    />
  );
}
