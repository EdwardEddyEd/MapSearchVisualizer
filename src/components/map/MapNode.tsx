import { CircleMarker, Popup } from "react-leaflet";
import type { CircleMarker as LeafletCircleMarker } from "leaflet";
import { Node, Graph } from "../graph/Graph";
import { useEffect, useRef } from "react";
import React from "react";

type MapNodeProps = {
  node: Node;
  isSelected: boolean;
  isVisited: boolean;
  onClick: (node: Node) => void;
};

export const MapNode = React.memo(
  ({ node, isSelected, isVisited, onClick }: MapNodeProps) => {
    const circleRef = useRef<LeafletCircleMarker>(null);

    const colorCircle = isVisited
      ? "green"
      : isSelected
        ? "yellow"
        : "#FF880033";

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
        // children={
        //   <Popup autoPan={false}>
        //     <p>{node.id}</p>
        //   </Popup>
        // }
        eventHandlers={{
          // mouseover: (e) => e.target.openPopup(),
          // mouseout: (e) => e.target.closePopup(),
          click: () => onClick(node),
        }}
      />
    );
  }
);
