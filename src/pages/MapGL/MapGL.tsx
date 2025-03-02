import { useCallback, useMemo, useRef, useState } from "react";
import { FullScreen, useFullScreenHandle } from "react-full-screen";

import {
  COORDINATE_SYSTEM,
  Position,
  DeckProps,
  PickingInfo,
} from "@deck.gl/core";
import { PointCloudLayer, PathLayer } from "@deck.gl/layers";
import { MapboxOverlay } from "@deck.gl/mapbox";
import {
  Map,
  useControl,
  NavigationControl,
  MapRef,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

import {
  Fullscreen as FullScreenIcon,
  FullscreenExit,
  PlayArrow,
  Pause,
  Public,
  PublicOff,
  AddRoad,
} from "@mui/icons-material";

import { MapGLButton } from "./MapGLButton";
import { MapGLControlContainer } from "./MapGLControlContainer";
import { MapGLDrawerController } from "./MapGLDrawerController";
import { MapGLFPSControl } from "./MapGLFPSControl";
import { MapGLMemoryControl } from "./MapGLMemoryControl";

import { fetchOSMRoads } from "@api/osmFetch";
import { Graph, Way, Node } from "@classes/graph/GraphGL";
import {
  Toaster,
  toast,
  Modal,
  closeModal,
  openModal,
  Range,
} from "@components";
import { useAnimationLoop } from "@hooks/useAnimationLoop";

import {
  convertHexStringToRGBArray,
  lerpColorToRGBArray,
  multiRGBArray,
} from "@utils/colorUtils";
import { useAStar } from "@utils/searchGL/useAStar";
import { useBFS } from "@utils/searchGL/useBFS";
import {
  MapSearchActionType,
  useMapSearchState,
} from "@contexts/MapSearchContext";

const initialViewState = {
  latitude: 30.2672,
  longitude: -97.7431,
  zoom: 13,
  pitch: 0,
};

function DeckGLOverlay(props: DeckProps) {
  // @ts-ignore: Typing error provided by documentation, but works to display deck.gl layers
  const deck = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  deck.setProps(props);
  return null;
}

export function MapGL() {
  const mapRef = useRef<MapRef>(undefined);
  const [mapZoom, setMapZoom] = useState<number>(initialViewState.zoom);
  const { state, dispatch } = useMapSearchState();

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
  const mapVisibleIcon = useMemo(
    () => (state.isMapVisible ? <Public /> : <PublicOff />),
    [state.isMapVisible]
  );
  const setMapVisibleCallback = useCallback(
    () => dispatch({ type: MapSearchActionType.TOGGLE_MAP_VISIBILITY }),
    []
  );

  // Pause Graph Search Memo
  const pauseIcon = useMemo(
    () => (state.isPaused ? <Pause /> : <PlayArrow />),
    [state.isPaused]
  );
  const setPauseCallback = useCallback(
    () => dispatch({ type: MapSearchActionType.TOGGLE_PAUSE }),
    []
  );

  const addGraphIcon = useMemo(() => <AddRoad />, []);
  const setGraphCallback = useCallback(async () => {
    if (mapRef.current) {
      dispatch({ type: MapSearchActionType.SET_LOADING_GRAPH, payload: true });
      openModal("loadingMapModal");

      fetchOSMRoads(
        mapRef.current.getBounds().getSouth(),
        mapRef.current.getBounds().getWest(),
        mapRef.current.getBounds().getNorth(),
        mapRef.current.getBounds().getEast()
      )
        .then((data) => {
          dispatch({
            type: MapSearchActionType.GRAPH_LOADED,
            payload: {
              graph: new Graph(data),
              startNode: { id: -1, lng: 0, lat: 0 },
              endNode: { id: -1, lng: 0, lat: 0 },
            },
          });
          toast.success("Map loaded", {
            description: "Roadways have been added",
            position: "top-center",
          });
        })
        .catch((error) => {
          dispatch({
            type: MapSearchActionType.SET_LOADING_GRAPH,
            payload: false,
          });
          toast.error("Unable to load map", {
            description: error,
            position: "top-center",
          });
        })
        .finally(() => {
          closeModal("loadingMapModal");
        });
    }
  }, []);
  //#endregion

  const { state: searchState, iterate: searchIterate } = useAStar(
    state.graph,
    state.startNode,
    state.endNode
  );

  const animationCallback = useCallback(() => {
    if (!state.isPaused) searchIterate(state.stepsPerFrame);
  }, [searchIterate, state.stepsPerFrame, state.isPaused]);
  const { lastFrameUnixTimeMS } = useAnimationLoop(animationCallback, {
    fps: state.fps,
    paused: state.isPaused,
  });

  const getWidth = (scale: number = 1) => {
    return Math.max(3, Math.min(30, 6 * (16 - (mapZoom || 13)))) * scale;
  };

  const getPointSize = (scale: number = 1) => {
    return Math.min(5, Math.abs(16 - mapZoom) + 4) * scale;
  };

  const vertices = useMemo(() => state.graph.getAllVertices(), [state.graph]);
  const nodesLayer =
    state.startNode.id === -1 || state.endNode.id === -1
      ? new PointCloudLayer<Node>({
          id: "AllVertices",
          data: vertices,
          getColor: [255, 0, 0],
          opacity: 0.2,
          getPosition: (node) => [node.lng, node.lat, 0],
          pointSize: getPointSize(),
          coordinateSystem: COORDINATE_SYSTEM.LNGLAT,
          pickable: true,
          updateTriggers: {
            pointSize: [mapZoom],
          },
          onClick: ({ object }: PickingInfo<Node>) => {
            if (object && state.startNode.id === -1) {
              dispatch({
                type: MapSearchActionType.SET_START_NODE,
                payload: object,
              });
              toast.success("Starting point selected", {
                position: "top-center",
              });
            } else if (
              object &&
              state.endNode.id === -1 &&
              state.startNode.id !== object.id
            ) {
              dispatch({
                type: MapSearchActionType.SET_END_NODE,
                payload: object,
              });
              toast.success("Ending point selected", {
                description:
                  "Searching between the start and end point is enabled",
                position: "top-center",
              });
            }
          },
        })
      : [];

  const startEndVertices = useMemo(
    () => [state.startNode, state.endNode],
    [state.startNode, state.endNode]
  );
  const startEndNodesLayer = new PointCloudLayer<Node>({
    id: "StartAndEndVertices",
    data: startEndVertices,
    getColor: multiRGBArray(
      convertHexStringToRGBArray(state.isMapVisible ? "#ff4400" : "#FFFFFF"),
      2
    ),
    getPosition: (node) => [node.lng, node.lat, 0],
    pointSize: getPointSize(1.3),
    coordinateSystem: COORDINATE_SYSTEM.LNGLAT,
    updateTriggers: {
      pointSize: [mapZoom],
    },
  });

  const edges = useMemo(() => state.graph.getAllEdges(), [state.graph]);
  const roadLayer = searchState.visitedEdges
    ? new PathLayer<Way>({
        id: "RoadLayer",
        data: edges,
        getPath: (way) =>
          way.nodes.map((node) => [node.lng, node.lat]) as Position[],
        opacity: state.isMapVisible ? 0.2 : 1,
        getWidth: getWidth(),
        jointRounded: true,
        capRounded: true,
        getColor: (way) =>
          searchState.visitedEdges[way.id]
            ? lerpColorToRGBArray(
                "#FCE40F",
                "#70321C",
                (lastFrameUnixTimeMS / 1000 -
                  searchState.visitedEdges[way.id]) /
                  5
              )
            : convertHexStringToRGBArray("#35110C"),
        updateTriggers: {
          getColor: [searchState.visitedEdges, lastFrameUnixTimeMS], // Trigger color update when visitedEdges changes
          getWidth: [mapZoom],
        },
      })
    : [];

  const solutionEdges = useMemo(
    () => state.graph.getEdgesFromIds(searchState.solution),
    [state.graph, searchState.solution]
  );
  const solutionLayer =
    searchState.solution.length > 0
      ? new PathLayer<Way>({
          id: "SolutionLayer",
          data: solutionEdges,
          getPath: (way) =>
            way.nodes.map((node) => [node.lng, node.lat]) as Position[],
          getWidth: getWidth(1.5),
          jointRounded: true,
          capRounded: true,
          getColor: (way) =>
            multiRGBArray(
              lerpColorToRGBArray(
                "#FFFFFF",
                "#00AADD",
                (Date.now() / 1000 - searchState.timeSolved) / 5
              ),
              1.1
            ),
          updateTriggers: {
            getColor: [searchState.solution],
          },
        })
      : [];

  const handleKeyDown = (e: any) => {
    if (e.key === "f" || e.key === "F") {
      handle.active ? handle.exit() : handle.enter();
    } else if (
      e.key === " " &&
      state.startNode.id !== -1 &&
      state.endNode.id !== -1
    ) {
      e.preventDefault();
      dispatch({ type: MapSearchActionType.TOGGLE_PAUSE });
    } else if (e.key === "h" || e.key === "H") {
      dispatch({ type: MapSearchActionType.TOGGLE_MAP_VISIBILITY });
    }
  };

  return (
    <div className="mx-10 my-5" onKeyDown={handleKeyDown}>
      <FullScreen handle={handle}>
        <Map
          ref={(ref: MapRef | null) => {
            if (ref) {
              mapRef.current = ref;
            }
          }}
          style={{
            height: handle.active ? "100%" : "608px",
            backgroundColor: "#14060E",
            borderRadius: 10,
          }}
          pitchWithRotate={false}
          rollEnabled={false}
          initialViewState={initialViewState}
          onZoom={(e) => setMapZoom(e.target.getZoom())}
          mapStyle={
            state.isMapVisible
              ? "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
              : undefined
          }
        >
          <DeckGLOverlay
            layers={[roadLayer, nodesLayer, solutionLayer, startEndNodesLayer]}
            parameters={{
              blend: true,
            }}
            pickingRadius={10} // Optimize picking performance
            controller={{ inertia: true }} // Smooth navigation
          />
          <MapGLControlContainer position="top-left">
            <div className="flex flex-col m-2 gap-2">
              <MapGLButton
                icon={fullscreenIcon}
                debug={true}
                btnDebugText="FULL SCREEN BUTTON"
                tooltip={
                  handle.active ? "Exit Fullscreen (F)" : "Enter Fullscreen (F)"
                }
                tooltipPosition="right"
                onClick={setFullscreenCallback}
              />
              <MapGLButton
                onClick={setMapVisibleCallback}
                icon={mapVisibleIcon}
                debug={true}
                btnDebugText="Map Vislble BTN"
                tooltip={state.isMapVisible ? "Hide map (H)" : "Show map (H)"}
                tooltipPosition="right"
              />
              <MapGLButton
                onClick={setGraphCallback}
                icon={addGraphIcon}
                tooltip="Get Roadways"
                tooltipPosition="right"
                disabled={state.isLoadingGraph}
              />
              {state.startNode.id !== -1 && state.endNode.id !== -1 && (
                <MapGLButton
                  icon={pauseIcon}
                  tooltip={
                    state.isPaused
                      ? "Play Search (space)"
                      : "Pause Search (space)"
                  }
                  debug={true}
                  btnDebugText="PAYL BTTN"
                  tooltipPosition="right"
                  onClick={setPauseCallback}
                />
              )}
            </div>
          </MapGLControlContainer>

          <MapGLControlContainer position="bottom-left">
            <MapGLFPSControl newTime={Date.now()} />
            <MapGLMemoryControl />
          </MapGLControlContainer>

          <NavigationControl />

          <MapGLDrawerController>
            <div className="flex flex-col gap-y-3 m-2">
              <div>
                <h3 className="font-medium italic">
                  Steps per Frame:{" "}
                  <span className="font-normal">{state.stepsPerFrame}</span>
                </h3>
                <Range
                  value={state.stepsPerFrame}
                  min={1}
                  max={30}
                  step={1}
                  onChange={(val) =>
                    dispatch({
                      type: MapSearchActionType.SET_STEPS_PER_FRAME,
                      payload: val,
                    })
                  }
                />
              </div>
              <div>
                <h3 className="font-medium italic">
                  Max FPS: <span className="font-normal">{state.fps}</span>
                </h3>
                <Range
                  value={state.fps}
                  min={1}
                  max={240}
                  step={1}
                  onChange={(val) =>
                    dispatch({
                      type: MapSearchActionType.SET_FPS,
                      payload: val,
                    })
                  }
                />
              </div>
            </div>
          </MapGLDrawerController>

          <Modal modalId="loadingMapModal" closeOnClickOutside={false}>
            <div className="flex justify-center items-center gap-x-5">
              <span className="loading loading-spinner loading-lg" />
              <p className="font-medium text-xl">Fetching Roadways...</p>
            </div>
          </Modal>

          <Toaster richColors />
        </Map>
      </FullScreen>
    </div>
  );
}
