import { useState, useMemo, useRef, useCallback } from "react";
import { useFullScreenHandle, FullScreen } from "react-full-screen";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import TimelineIcon from "@mui/icons-material/Timeline";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import AddRoadIcon from "@mui/icons-material/AddRoad";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LocationOffIcon from "@mui/icons-material/LocationOff";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";

import { MapButton } from "./MapButton";
import { MapEdge } from "./MapEdge";
import { MapNode } from "./MapNode";
import { MapPosition } from "./MapPosition";
import { MapSearch } from "./MapSearch";

import { fetchOSMRoads } from "@api/osmFetch";
import { Way, Graph, Node, WayId, NodeId } from "@classes/graph/Graph";
import { useAnimationLoop } from "@hooks";
import { randomColor } from "@utils/colorUtils";
import { BFS } from "@utils/search/BFS";

const DEFAULT_ZOOM = 15;
const DEFAULT_CENTER = { lat: 30.2672, lng: -97.7431 };

type MapProps = {
  initZoom?: number;
  initCenter?: { lat: number; lng: number };
};

type BFSState = {
  visitedNodes: Record<NodeId, boolean>;
  visitedEdges: Record<WayId, boolean>;
  solution: WayId[];
};

export function Map({
  initZoom = DEFAULT_ZOOM,
  initCenter = DEFAULT_CENTER,
}: MapProps) {
  const [map, setMap] = useState<L.Map | null>(null);

  const [roads, setRoads] = useState<Way[]>([]);
  const [showSegments, setShowSegments] = useState(true);
  const [mapVisible, setMapVisible] = useState<boolean>(true);
  const [graph, setGraph] = useState<Graph>(new Graph());
  const [loadingGraph, setLoadingGraph] = useState<boolean>(false);
  const [bfsState, setBFSState] = useState<BFSState>({
    visitedNodes: {},
    visitedEdges: {},
    solution: [],
  });

  const [startPoint, setStartPoint] = useState<Node>();
  const [endPoint, setEndPoint] = useState<Node>();

  const handle = useFullScreenHandle();

  // Store function object in a ref
  const [paused, setPaused] = useState(true);
  const [fps, setFps] = useState(60);
  const searchRef = useRef<BFS | null>(null);

  const animationCallback = useCallback(() => {
    if (searchRef.current) {
      searchRef.current.iterate(5);

      setBFSState({
        visitedNodes: searchRef.current.visited,
        visitedEdges: searchRef.current.visitedEdge,
        solution: searchRef.current.solution,
      });
    }
  }, []);
  useAnimationLoop(animationCallback, { fps, paused });

  const memoPause = useCallback(() => {
    setPaused(!paused);
  }, [paused]);
  const pauseIcon = useMemo(() => {
    return paused ? (
      <PauseIcon style={{ color: "black" }} />
    ) : (
      <PlayArrowIcon style={{ color: "black" }} />
    );
  }, [paused]);

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
        disabled={loadingGraph}
        onClick={async () => {
          if (map) {
            setLoadingGraph(true);
            fetchOSMRoads(
              map.getBounds().getSouth(),
              map.getBounds().getWest(),
              map.getBounds().getNorth(),
              map.getBounds().getEast()
            ).then((data) => {
              setRoads(data);
              graph.clearGraph();
              setGraph(graph.generateGraph(data));
              setLoadingGraph(false);
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
      {searchRef.current && (
        <MapButton
          onClick={memoPause}
          icon={pauseIcon}
          hoverText={paused ? "Unpause" : "Pause"}
        />
      )}
    </div>
  );

  const selectNode = useCallback(
    (node: Node) => {
      if (!startPoint) {
        setStartPoint(node);
      } else if (!endPoint) {
        setEndPoint(node);
        searchRef.current = new BFS(graph, startPoint, node);
      }
    },
    [startPoint, endPoint]
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
            color="#35110C"
            isVisited={!!bfsState.visitedEdges[road.id]}
            isSolution={false}
          />
        ))}
      {!startPoint || !endPoint ? (
        graph
          ?.getAllVertices()
          .map((node) => (
            <MapNode
              key={node.id}
              node={node}
              isVisited={!!bfsState.visitedNodes[node.id]}
              isSelected={
                startPoint?.id === node.id || endPoint?.id === node.id
              }
              onClick={selectNode}
            />
          ))
      ) : (
        <>
          <MapNode
            key={startPoint.id}
            node={startPoint}
            isVisited={!!bfsState.visitedNodes[startPoint.id]}
            isSelected={true}
            onClick={selectNode}
          />
          <MapNode
            key={endPoint.id}
            node={endPoint}
            isVisited={!!bfsState.visitedNodes[endPoint.id]}
            isSelected={true}
            onClick={selectNode}
          />
        </>
      )}
    </>
  );

  const solutionRoad = bfsState.solution.map((road) => (
    <MapEdge
      key={`${road}_solution`}
      edge={graph.edges.get(road)!}
      color="#FFFFFF"
      isVisited={false}
      isSolution={true}
    />
  ));

  const handleKeyDown = (e: any) => {
    if (e.key === " ") {
      // Action to perform on space bar press
      setPaused((pause) => !pause);
    } else if (e.key === "f" || e.key === "F") {
      handle.active ? handle.exit() : handle.enter();
    }
  };

  return (
    <div className="flex flex-col m-2" onKeyDown={handleKeyDown}>
      <FullScreen handle={handle}>
        <MapContainer
          center={initCenter}
          zoom={initZoom}
          minZoom={4}
          style={{
            height: "100%",
            width: "100%",
            minHeight: "608px",
            minWidth: "1080px",
            backgroundColor: "#14060E",
          }}
          ref={setMap}
          maxBounds={[
            [-90, -180],
            [90, 180],
          ]}
        >
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
          {solutionRoad}
        </MapContainer>
      </FullScreen>
    </div>
  );
}
