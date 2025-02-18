import { CircleMarker, Popup } from "react-leaflet";
import type { CircleMarker as LeafletCircleMarker } from "leaflet";
import { Node, Graph } from "../graph/Graph";
import { useEffect, useRef } from "react";

type MapNodeProps = {
  graph: Graph;
  node: Node;
  isSelected: boolean;
  isVisited: boolean;
  onClick: () => void;
};

export function MapNode({
  graph,
  node,
  isSelected,
  isVisited,
  onClick,
}: MapNodeProps) {
  const circleRef = useRef<LeafletCircleMarker>(null);

  const colorCircle = isVisited ? "green" : isSelected ? "yellow" : "blue";

  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.setStyle({
        color: colorCircle,
        fillColor: colorCircle,
      });
    }
  }, [colorCircle]);

  return (
    <CircleMarker
      ref={circleRef}
      center={node}
      radius={3}
      fillOpacity={1}
      weight={2}
      color={colorCircle}
      fillColor={colorCircle}
      children={
        <Popup autoPan={false}>
          <p>{node.id}</p>
          <p>
            {JSON.stringify(
              graph.getNeighborsFromVertex(node).map(({ edge }) => edge.id)
            )}
          </p>
        </Popup>
      }
      eventHandlers={{
        mouseover: (e) => e.target.openPopup(),
        mouseout: (e) => e.target.closePopup(),
        click: onClick,
      }}
    />
  );
}
