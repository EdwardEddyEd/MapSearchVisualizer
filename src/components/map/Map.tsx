import {
  MapContainer,
  Polyline,
  Circle,
  Popup,
  TileLayer,
} from "react-leaflet";
import { useState, useMemo, useRef } from "react";
import { useFullScreenHandle, FullScreen } from "react-full-screen";
import { Way, Graph, Node } from "../graph/Graph";
import { MapButton } from "./MapButton";
import { fetchOSMRoads } from "../../api/osmFetch";
import "leaflet/dist/leaflet.css";

import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import TimelineIcon from "@mui/icons-material/Timeline";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import AddRoadIcon from "@mui/icons-material/AddRoad";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LocationOffIcon from "@mui/icons-material/LocationOff";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import { GlowFilter, randomColor } from "../../util/colorUtils";
import { MapPosition } from "./MapPosition";
import { MapSearch } from "./MapSearch";
import { BFS } from "../../util/search/BFS";
import { MapNode } from "./MapNode";
import { MapEdge } from "./MapEdge";
import { useAnimationLoop } from "../../hooks/useAnimationLoop";

const DEFAULT_ZOOM = 17;
const DEFAULT_CENTER = { lat: 35.319, lng: -119.1175 };

type MapProps = {
  initZoom?: number;
  initCenter?: { lat: number; lng: number };
};

export function Map({
  initZoom = DEFAULT_ZOOM,
  initCenter = DEFAULT_CENTER,
}: MapProps) {
  const [map, setMap] = useState<L.Map | null>(null);

  const [roads, setRoads] = useState<Way[]>([]);
  const [showSegments, setShowSegments] = useState(false);
  const [mapVisible, setMapVisible] = useState<boolean>(true);
  const [graph, setGraph] = useState<Graph>(new Graph());
  const [visitedNodes, setVisitedNodes] = useState<Record<number, boolean>>({});
  const [visitedEdges, setVisitedEdges] = useState<
    Record<string | number, boolean>
  >({});
  const [solution, setSolution] = useState<(number | string)[]>([]);

  const [startPoint, setStartPoint] = useState<Node>();
  const [endPoint, setEndPoint] = useState<Node>();

  const handle = useFullScreenHandle();

  // Store function object in a ref
  const [paused, setPaused] = useState(false);
  const [fps, setFps] = useState(10);
  const myObjectRef = useRef<BFS | null>(null);
  const { step } = useAnimationLoop(
    () => {
      if (myObjectRef.current) {
        myObjectRef.current.step();
        setVisitedNodes({ ...myObjectRef.current.visited });
        setVisitedEdges({ ...myObjectRef.current.visitedEdge });
        setSolution([...myObjectRef.current.solution]);
      }
    },
    { fps, paused }
  );

  const TopRightButtonDrawer = () => (
    <div className="flex flex-col leaflet-top leaflet-right">
      <MapButton
        onClick={handle.active ? handle.exit : handle.enter}
        icon={
          handle.active ? (
            <FullscreenExitIcon
              style={{
                color: "black",
              }}
            />
          ) : (
            <FullscreenIcon
              style={{
                color: "black",
              }}
            />
          )
        }
        hoverText={handle.active ? "Exit Fullscreen" : "Enter Fullscreen"}
      />
      <MapButton
        onClick={() => setShowSegments(!showSegments)}
        icon={
          showSegments ? (
            <TimelineIcon
              style={{
                color: "black",
              }}
            />
          ) : (
            <ShowChartIcon
              style={{
                color: "black",
              }}
            />
          )
        }
        hoverText={showSegments ? "Show Original Road" : "Show Segments"}
      />
      <MapButton
        onClick={async () => {
          if (map) {
            fetchOSMRoads(
              map.getBounds().getSouth(),
              map.getBounds().getWest(),
              map.getBounds().getNorth(),
              map.getBounds().getEast()
            ).then((data) => {
              setRoads(data);
              graph.clearGraph();
              setGraph(graph.generateGraph(data));
            });
          }
        }}
        icon={
          <AddRoadIcon
            style={{
              color: "black",
            }}
          />
        }
        hoverText="Get Roadways"
      />
      <MapButton
        onClick={() => setMapVisible(!mapVisible)}
        icon={
          mapVisible ? (
            <LocationOnIcon style={{ color: "black" }} />
          ) : (
            <LocationOffIcon style={{ color: "black" }} />
          )
        }
        hoverText={mapVisible ? "Hide map" : "Show map"}
      />
      {myObjectRef.current && (
        <>
          <MapButton
            onClick={() => {
              setPaused(!paused);
            }}
            icon={
              paused ? (
                <PauseIcon style={{ color: "black" }} />
              ) : (
                <PlayArrowIcon style={{ color: "black" }} />
              )
            }
            hoverText={paused ? "Unpause" : "Pause"}
          />
          <MapButton
            onClick={step}
            icon={<ArrowForwardIcon style={{ color: "black" }} />}
            hoverText="Explore next step"
          />
        </>
      )}
    </div>
  );

  const visibleRoads = !showSegments ? (
    roads.map((road, i) => (
      <MapEdge
        key={road.id}
        edge={road}
        color={randomColor(i + 3)}
        isVisited={false}
      />
    ))
  ) : (
    <>
      {graph
        ?.getAllEdges()
        .map((road, i) => (
          <MapEdge
            key={road.id}
            edge={road}
            color="blue"
            isVisited={!!visitedEdges[road.id]}
            isSolution={!!solution.includes(road.id)}
          />
        ))}
      {graph?.getAllVertices().map((node) => (
        <MapNode
          graph={graph}
          key={node.id}
          node={node}
          isVisited={!!visitedNodes[node.id]}
          isSelected={startPoint?.id === node.id || endPoint?.id === node.id}
          onClick={() => {
            if (!startPoint) {
              setStartPoint(node);
            } else if (!endPoint) {
              setEndPoint(node);
              myObjectRef.current = new BFS(graph, startPoint, node);
            }
          }}
        />
      ))}
      {}
    </>
  );

  const displayMap = useMemo(() => {
    return (
      <MapContainer
        center={initCenter}
        zoom={initZoom}
        minZoom={4}
        style={{
          height: "100%",
          width: "100%",
          minHeight: "608px",
          minWidth: "1080px",
          backgroundColor: "black",
        }}
        ref={setMap}
        maxBounds={[
          [-90, -180],
          [90, 180],
        ]}
      >
        <GlowFilter />
        {mapVisible && (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        )}
        {map && <MapPosition map={map} />}
        <MapSearch startPoint={startPoint} endPoint={endPoint} />
        <TopRightButtonDrawer />
        {visibleRoads}
      </MapContainer>
    );
  }, [
    roads,
    graph,
    showSegments,
    handle.active,
    map,
    mapVisible,
    startPoint?.id,
    endPoint?.id,
    myObjectRef.current,
    visitedEdges,
    visitedNodes,
    paused,
  ]);

  return (
    <div className="flex flex-col m-2">
      <FullScreen handle={handle}>{displayMap}</FullScreen>
    </div>
  );
}
