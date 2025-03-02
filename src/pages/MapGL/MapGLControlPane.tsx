import React from "react";
import {
  MapSearchActionType,
  useMapSearchState,
} from "@contexts/MapSearchContext";
import { BASEMAP } from "@deck.gl/carto";
import { SearchType } from "@utils/searchGL/useGraphSearch";

import { MapGLLeftDrawer } from "./MapGLLeftDrawer/MapGLLeftDrawer";
import { Range, Select } from "@components";
import { useCallback, useMemo } from "react";

import {
  Fullscreen,
  FullscreenExit,
  PlayArrow,
  Pause,
  Layers,
  LayersClear,
  Code,
  CodeOff,
  AddRoad,
  Refresh,
  Undo,
} from "@mui/icons-material";
import { FullScreenHandle } from "react-full-screen";
import { MapGLButton } from "./MapGLButton";

type MapGLControlPane = {
  fullscreenHandle: FullScreenHandle;
  restartSearchCallback: () => void;
  setGraphCallback: () => Promise<void>;
};

export const MapGLControlPane = React.memo(
  ({
    fullscreenHandle,
    restartSearchCallback,
    setGraphCallback,
  }: MapGLControlPane) => {
    const { state, dispatch } = useMapSearchState();

    console.log("Control pane rerender");

    // Fullscreen Memo
    const fullscreenIcon = useMemo(
      () => (state.isFullscreen ? <FullscreenExit /> : <Fullscreen />),
      [state.isFullscreen]
    );
    const setFullscreenCallback = useCallback(() => {
      state.isFullscreen ? fullscreenHandle.exit() : fullscreenHandle.enter();
      dispatch({ type: MapSearchActionType.TOGGLE_FULLSCREEN });
    }, [state.isFullscreen, fullscreenHandle]);

    // Map Visible Memo
    const mapVisibleIcon = useMemo(
      () => (state.isMapVisible ? <Layers /> : <LayersClear />),
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

    const statsVisibleIcon = useMemo(
      () => (state.isStatsVisible ? <Code /> : <CodeOff />),
      [state.isStatsVisible]
    );
    const setStatsVisibleCallback = useCallback(
      () => dispatch({ type: MapSearchActionType.TOGGLE_STATS }),
      []
    );

    const mapStyleItems = useMemo(
      () =>
        Object.keys(BASEMAP).map((key) => ({
          key,
          value: key,
        })),
      []
    );
    const setMapStyleCallback = useCallback((value: string | number) => {
      const payload = value as keyof typeof BASEMAP;
      dispatch({
        type: MapSearchActionType.SET_MAP_STYLE,
        payload,
      });
    }, []);

    const searchTypeItems = useMemo(() => {
      const searchTypes: SearchType[] = ["A*", "BFS"];
      return searchTypes.map((key) => ({
        key,
        value: key,
      }));
    }, []);
    const setSearchTypeCallback = useCallback(
      (value: string | number) => {
        const payload = value as SearchType;
        dispatch({
          type: MapSearchActionType.SET_SEARCH_TYPE,
          payload,
        });
        restartSearchCallback();
      },
      [restartSearchCallback]
    );

    const setSelectNewStartEndNodeCallback = useCallback(
      () => dispatch({ type: MapSearchActionType.SELECT_NEW_START_END_NODES }),
      []
    );
    const selectNewStartEndNodeIcon = useMemo(() => <Undo />, []);

    const addGraphIcon = useMemo(() => <AddRoad />, []);
    const restartSearchIcon = useMemo(() => <Refresh />, []);

    return (
      <MapGLLeftDrawer>
        <div className="flex flex-col gap-y-2 m-2">
          <h2 className="text-xl">Map Controls</h2>
          <div className="flex gap-x-3 items-center">
            <MapGLButton
              icon={fullscreenIcon}
              debug={true}
              btnDebugText="FULL SCREEN BUTTON"
              onClick={setFullscreenCallback}
            />
            <h3 className="font-medium text-[14px]">Toggle Fullscreen</h3>
            <div className="flex-1" />
            <kbd className="kbd" data-theme="light">
              F
            </kbd>
          </div>

          <div className="flex gap-x-3 items-center">
            <MapGLButton
              onClick={setGraphCallback}
              icon={addGraphIcon}
              disabled={state.isLoadingGraph}
            />
            <h3 className="font-medium text-[14px]">Fetch Road</h3>
            <div className="flex-1" />
            <kbd className="kbd" data-theme="light">
              G
            </kbd>
          </div>

          <div className="flex gap-x-3 items-center">
            <MapGLButton
              onClick={setStatsVisibleCallback}
              icon={statsVisibleIcon}
            />
            <h3 className="font-medium text-[14px]">Toggle Stats</h3>
            <div className="flex-1" />
            <kbd className="kbd" data-theme="light">
              H
            </kbd>
          </div>

          <div className="flex gap-x-3 items-center">
            <MapGLButton
              onClick={setMapVisibleCallback}
              icon={mapVisibleIcon}
              debug={true}
              btnDebugText="Map Visibility Button"
            />
            <h3 className="font-medium text-[14px]">Toggle Map Visibility</h3>
            <div className="flex-1" />
            <kbd className="kbd" data-theme="light">
              M
            </kbd>
          </div>

          <div className="flex flex-col gap-y">
            <h3 className="font-medium italic">Map Style</h3>
            <Select
              defaultValue="Pick a map style"
              onChange={setMapStyleCallback}
              value={state.mapStyle}
              items={mapStyleItems}
            />
          </div>

          <hr />
          <h2 className="text-xl">Search Controls</h2>

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

          <div className="flex flex-col gap-y">
            <h3 className="font-medium italic">Search Type</h3>
            <Select
              defaultValue="Pick a search algorithm"
              onChange={setSearchTypeCallback}
              value={state.searchType}
              items={searchTypeItems}
            />
          </div>

          <div className="flex gap-x-3 items-center">
            <MapGLButton
              icon={pauseIcon}
              debug={true}
              btnDebugText="Play Search Button"
              onClick={setPauseCallback}
              disabled={state.startNode.id === -1 || state.endNode.id === -1}
            />
            <h3 className="font-medium text-[14px]">
              {state.isPaused ? "Start Search" : "Pause Search"}
            </h3>
            <div className="flex-1" />
            <kbd className="kbd" data-theme="light">
              space
            </kbd>
          </div>
          <div className="flex gap-x-3 items-center">
            <MapGLButton
              icon={restartSearchIcon}
              debug={true}
              btnDebugText="Restart Callback Button"
              onClick={restartSearchCallback}
              disabled={state.startNode.id === -1 || state.endNode.id === -1}
            />
            <h3 className="font-medium text-[14px]">Restart Search</h3>
            <div className="flex-1" />
            <kbd className="kbd" data-theme="light">
              R
            </kbd>
          </div>
          <div className="flex gap-x-3 items-center">
            <MapGLButton
              icon={selectNewStartEndNodeIcon}
              debug={true}
              btnDebugText="Select New Start End Node Button"
              onClick={setSelectNewStartEndNodeCallback}
              disabled={state.startNode.id === -1 || state.endNode.id === -1}
            />
            <h3 className="font-medium text-[14px]">Select New Nodes</h3>
            <div className="flex-1" />
            <kbd className="kbd" data-theme="light">
              S
            </kbd>
          </div>
        </div>
      </MapGLLeftDrawer>
    );
  }
);
