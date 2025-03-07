import { PointCloudLayer, PathLayer } from "@deck.gl/layers";
import { COORDINATE_SYSTEM, DeckProps, PickingInfo } from "@deck.gl/core";
import { MapboxOverlay } from "@deck.gl/mapbox";
import {
  Map,
  useControl,
  NavigationControl,
  MapRef,
  MapProvider,
} from "react-map-gl/maplibre";
import { Graph, Way, Node } from "../graph/GraphGL";
import { useCallback, useMemo, useRef, useState } from "react";
import { useAnimationLoop } from "../../hooks/useAnimationLoop";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { useAStar } from "../../util/searchGL/useAStar";
import { useBFS } from "../../util/searchGL/useBFS";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapGLControlContainer } from "./MapGLControlContainer";
import { MapGLButton } from "./MapGLButton";

import {
  Fullscreen as FullScreenIcon,
  FullscreenExit,
  PlayArrow,
  Pause,
  Public,
  PublicOff,
  AddRoad,
} from "@mui/icons-material";
import {
  convertHexStringToRGBArray,
  lerpColorToRGBArray,
} from "../../util/colorUtils";
import { fetchOSMRoads } from "../../api/osmFetch";
import { MapGLFPSControl } from "./MapGLFPSControl";
import { MapGLMemoryControl } from "./MapGLMemoryControl";

const initialViewState = {
  latitude: 30.2672,
  longitude: -97.7431,
  zoom: 13,
  pitch: 0,
};

function DeckGLOverlay(props: DeckProps) {
  const deck = useControl<MapboxOverlay>(() => new MapboxOverlay(props));

  deck.setProps(props);
  return null;
}

export function MapGL() {
  const mapRef = useRef<MapRef>(undefined);

  // #region Map Container Button Memo
  // Fullscreen Memo
  const handle = useFullScreenHandle();
  const fullscreenIcon = useMemo(
    () => (handle.active ? <FullscreenExit /> : <FullScreenIcon />),
    [handle.active]
  );
  const setFullscreenCallback = useCallback(
    () => (handle.active ? handle.exit() : handle.enter()),
    [handle.active]
  );

  // Map Visible Memo
  const [mapVisible, setMapVisible] = useState<boolean>(true);
  const mapVisibleIcon = useMemo(
    () => (mapVisible ? <Public /> : <PublicOff />),
    [mapVisible]
  );
  const setMapVisibleCallback = useCallback(
    () => setMapVisible((mapVisible) => !mapVisible),
    []
  );

  // Pause Graph Search Memo
  const [paused, setPaused] = useState(false);
  const pauseIcon = useMemo(
    () => (paused ? <Pause /> : <PlayArrow />),
    [paused]
  );
  const setPauseCallback = useCallback(
    () => setPaused((paused) => !paused),
    []
  );

  const [loadingGraph, setLoadingGraph] = useState<boolean>(false);
  const [graph, setGraph] = useState<Graph>(new Graph([]));
  const [startNode, setStartNode] = useState<Node>({ id: -1, lng: 0, lat: 0 });
  const [endNode, setEndNode] = useState<Node>({ id: -1, lng: 0, lat: 0 });
  const addGraphIcon = useMemo(() => <AddRoad />, []);
  const setGraphCallback = useCallback(async () => {
    if (mapRef.current) {
      setLoadingGraph(true);
      fetchOSMRoads(
        mapRef.current.getBounds().getSouth(),
        mapRef.current.getBounds().getWest(),
        mapRef.current.getBounds().getNorth(),
        mapRef.current.getBounds().getEast()
      )
        .then((data) => {
          graph.clearGraph();
          setGraph(new Graph(data));
          setStartNode({ id: -1, lng: 0, lat: 0 });
          setEndNode({ id: -1, lng: 0, lat: 0 });
        })
        .finally(() => {
          setLoadingGraph(false);
        });
    }
  }, []);
  //#endregion

  const [fps, setFps] = useState(120);

  const { state: searchState, iterate: searchIterate } = useAStar(
    graph,
    startNode,
    endNode
  );

  const animationCallback = useCallback(() => {
    searchIterate(10);
  }, [searchIterate, paused]);
  const { step } = useAnimationLoop(animationCallback, {
    fps,
    paused,
  });

  const getWidth = (scale: number = 1) => {
    return (
      Math.max(3, Math.min(30, 6 * (16 - (mapRef.current?.getZoom() || 13)))) *
      scale
    );
  };

  const getPointSize = (scale: number = 1) => {
    return (
      Math.max(2, Math.min(6, 16 - (mapRef.current?.getZoom() || 4))) * scale
    );
  };

  const vertices = useMemo(() => graph.getAllVertices(), [graph]);
  const nodesLayer =
    startNode.id === -1 || endNode.id === -1
      ? new PointCloudLayer<Node>({
          data: vertices,
          getColor: [255, 0, 0],
          opacity: 0.2,
          getPosition: (node) => [node.lng, node.lat, 0],
          pointSize: getPointSize(),
          coordinateSystem: COORDINATE_SYSTEM.LNGLAT,
          pickable: true,
          updateTriggers: {
            pointSize: [mapRef.current?.getZoom()],
          },
          onClick: ({ object }: PickingInfo<Node>) => {
            if (object && startNode.id === -1) setStartNode(object);
            else if (object && endNode.id === -1) setEndNode(object);
          },
        })
      : [];

  const edges = useMemo(() => graph.getAllEdges(), [graph]);
  const roadLayer = searchState.visitedEdges
    ? new PathLayer<Way>({
        id: "RoadLayer",
        data: edges,
        getPath: (way) => way.nodes.map((node) => [node.lng, node.lat]),
        getWidth: getWidth(),
        jointRounded: true,
        capRounded: true,
        getColor: (way) =>
          searchState.visitedEdges[way.id]
            ? lerpColorToRGBArray(
                "#FCE40F",
                "#70321C",
                (Date.now() / 1000 - searchState.visitedEdges[way.id]) / 5
              )
            : convertHexStringToRGBArray("#35110C"),
        updateTriggers: {
          getColor: [searchState.visitedEdges], // Trigger color update when visitedEdges changes
          getWidth: [mapRef.current?.getZoom()], // TODO: Seems to only rerender when search is playing
        },
      })
    : [];

  const solutionEdges = useMemo(
    () => graph.getEdgesFromIds(searchState.solution),
    [graph, searchState.solution]
  );
  const solutionLayer =
    searchState.solution.length > 0
      ? new PathLayer<Way>({
          id: "SolutionLayer",
          data: solutionEdges,
          getPath: (way) => way.nodes.map((node) => [node.lng, node.lat]),
          getWidth: getWidth(1.5),
          jointRounded: true,
          capRounded: true,
          getColor: (way) =>
            lerpColorToRGBArray(
              "#FFFFFF",
              "#00AADD",
              (Date.now() / 1000 - searchState.timeSolved) / 5
            ),
          updateTriggers: {
            getColor: [searchState.solution],
          },
        })
      : [];

  const handleKeyDown = (e: any) => {
    if (e.key === "f" || e.key === "F") {
      handle.active ? handle.exit() : handle.enter();
    } else if (e.key === " " && startNode.id !== -1 && endNode.id !== -1) {
      e.preventDefault();
      setPaused((paused) => !paused);
    } else if (e.key === "h" || e.key === "H") {
      setMapVisible((visible) => !visible);
    }
  };

  return (
    <div className="mx-10 my-5" onKeyDown={handleKeyDown}>
      <FullScreen handle={handle}>
        <MapProvider>
          <Map
            ref={(ref: MapRef | null) => {
              if (ref) {
                mapRef.current = ref;
              }
            }}
            style={{
              height: handle.active ? "100%" : "608px",
              backgroundColor: "#14060E",
            }}
            pitchWithRotate={false}
            rollEnabled={false}
            initialViewState={initialViewState}
            mapStyle={
              mapVisible
                ? "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
                : undefined
            }
          >
            <DeckGLOverlay
              layers={[roadLayer, nodesLayer, solutionLayer]}
              parameters={{
                blend: true,
              }}
              pickingRadius={10} // Optimize picking performance
              controller={{ inertia: true }} // Smooth navigation
            />
            <NavigationControl />
            <MapGLControlContainer position="top-left">
              <div className="flex flex-col m-2 gap-2">
                <MapGLButton
                  icon={fullscreenIcon}
                  hoverText={
                    handle.active ? "Exit Fullscreen" : "Enter Fullscreen"
                  }
                  onClick={setFullscreenCallback}
                />
                {startNode.id !== -1 && endNode.id !== -1 && (
                  <MapGLButton
                    icon={pauseIcon}
                    hoverText={paused ? "Unpause" : "Pause"}
                    onClick={setPauseCallback}
                  />
                )}
                <MapGLButton
                  onClick={setMapVisibleCallback}
                  icon={mapVisibleIcon}
                  hoverText={mapVisible ? "Hide map" : "Show map"}
                />
                <MapGLButton
                  onClick={setGraphCallback}
                  icon={addGraphIcon}
                  hoverText="Get Roadways"
                  disabled={loadingGraph}
                />
              </div>
            </MapGLControlContainer>
            <MapGLControlContainer position="bottom-left">
              <MapGLFPSControl newTime={Date.now()} />
              <MapGLMemoryControl />
            </MapGLControlContainer>
          </Map>
        </MapProvider>
      </FullScreen>
    </div>
  );
}
