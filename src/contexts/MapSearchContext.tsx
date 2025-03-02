import { Graph, Node } from "@classes/graph/GraphGL";
import {
  createContext,
  useReducer,
  useContext,
  ReactNode,
  Dispatch,
} from "react";

enum MapSearchActionType {
  TOGGLE_FULLSCREEN = "TOGGLE_FULLSCREEN",
  TOGGLE_MAP_VISIBILITY = "TOGGLE_MAP_VISIBILITY",
  TOGGLE_PAUSE = "TOGGLE_PAUSE",
  TOGGLE_STATS = "TOGGLE_STATS",
  SET_LOADING_GRAPH = "SET_LOADING_GRAPH",
  GRAPH_LOADED = "GRAPH_LOADED",
  SET_START_NODE = "SET_START_NODE",
  SET_END_NODE = "SET_END_NODE",

  SET_STEPS_PER_FRAME = "SET_STEPS_PER_FRAME",
  SET_FPS = "SET_FPS",
}

// Define action types
type MapSearchAction =
  | { type: MapSearchActionType.TOGGLE_FULLSCREEN }
  | { type: MapSearchActionType.TOGGLE_MAP_VISIBILITY }
  | { type: MapSearchActionType.TOGGLE_PAUSE }
  | { type: MapSearchActionType.TOGGLE_STATS }
  | { type: MapSearchActionType.SET_LOADING_GRAPH; payload: boolean }
  | {
      type: MapSearchActionType.GRAPH_LOADED;
      payload: { graph: Graph; startNode: Node; endNode: Node };
    }
  | { type: MapSearchActionType.SET_START_NODE; payload: Node }
  | { type: MapSearchActionType.SET_END_NODE; payload: Node }
  | { type: MapSearchActionType.SET_STEPS_PER_FRAME; payload: number }
  | { type: MapSearchActionType.SET_FPS; payload: number };

type MapSearchState = {
  isFullscreen: boolean;
  isMapVisible: boolean;
  isPaused: boolean;
  isStatsVisible: boolean;
  isLoadingGraph: boolean;

  graph: Graph;
  startNode: Node;
  endNode: Node;

  stepsPerFrame: number;
  fps: number;
};

// Initial state
const initialState: MapSearchState = {
  isFullscreen: false,
  isMapVisible: true,
  isPaused: true,
  isStatsVisible: false,
  isLoadingGraph: false,

  graph: new Graph([]),
  startNode: { id: -1, lng: 180, lat: -90 },
  endNode: { id: -1, lng: 180, lat: -90 },

  stepsPerFrame: 10,
  fps: 120,
};

function MapSearchReducer(
  state: MapSearchState,
  action: MapSearchAction
): MapSearchState {
  switch (action.type) {
    case MapSearchActionType.TOGGLE_FULLSCREEN:
      return { ...state, isFullscreen: !state.isFullscreen };
    case MapSearchActionType.TOGGLE_MAP_VISIBILITY:
      return { ...state, isMapVisible: !state.isMapVisible };
    case MapSearchActionType.TOGGLE_PAUSE:
      return { ...state, isPaused: !state.isPaused };
    case MapSearchActionType.TOGGLE_STATS:
      return { ...state, isStatsVisible: !state.isStatsVisible };
    case MapSearchActionType.SET_LOADING_GRAPH:
      return { ...state, isLoadingGraph: action.payload };
    case MapSearchActionType.GRAPH_LOADED:
      return {
        ...state,
        isLoadingGraph: false,
        graph: action.payload.graph,
        startNode: action.payload.startNode,
        endNode: action.payload.endNode,
      };
    case MapSearchActionType.SET_START_NODE:
      return { ...state, startNode: action.payload };
    case MapSearchActionType.SET_END_NODE:
      return { ...state, endNode: action.payload };
    case MapSearchActionType.SET_STEPS_PER_FRAME:
      return { ...state, stepsPerFrame: action.payload };
    case MapSearchActionType.SET_FPS:
      return { ...state, fps: action.payload };
    default:
      return state;
  }
}

type MapSearchContextProps = {
  state: MapSearchState;
  dispatch: Dispatch<MapSearchAction>;
};

const MapSearchContext = createContext<MapSearchContextProps | undefined>(
  undefined
);

type MapSearchProviderProps = {
  children: ReactNode;
};

export function MapSearchProvider({ children }: MapSearchProviderProps) {
  const [state, dispatch] = useReducer(MapSearchReducer, initialState);

  return (
    <MapSearchContext.Provider value={{ state, dispatch }}>
      {children}
    </MapSearchContext.Provider>
  );
}

export function useMapSearchState(): MapSearchContextProps {
  const context = useContext(MapSearchContext);
  if (!context) {
    throw new Error(
      "useMapSearchState must be used within an MapSearchProvider"
    );
  }
  return context;
}

export { MapSearchActionType };
