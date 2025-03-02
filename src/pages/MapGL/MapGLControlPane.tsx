import React from "react";
import {
  MapSearchActionType,
  useMapSearchState,
} from "@contexts/MapSearchContext";
import { MapGLLeftDrawer } from "./MapGLLeftDrawer/MapGLLeftDrawer";
import { Range } from "@components";
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
} from "@mui/icons-material";
import { FullScreenHandle } from "react-full-screen";
import { MapGLButton } from "./MapGLButton";

type MapGLControlPane = {
  fullscreenHandle: FullScreenHandle;
  setGraphCallback: () => Promise<void>;
};

export const MapGLControlPane = React.memo(
  ({ fullscreenHandle, setGraphCallback }: MapGLControlPane) => {
    const { state, dispatch } = useMapSearchState();

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

    const addGraphIcon = useMemo(() => <AddRoad />, []);

    return (
      <MapGLLeftDrawer>
        <div className="flex flex-col gap-y-2 m-2">
          <h2 className="text-xl">Map Config</h2>
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
              disabled={state.isLoadingGraph}
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
              btnDebugText="Map Vislble BTN"
            />
            <h3 className="font-medium text-[14px]">Toggle Map Visibility</h3>
            <div className="flex-1" />
            <kbd className="kbd" data-theme="light">
              M
            </kbd>
          </div>

          <hr />
          <h2 className="text-xl">Search Control</h2>

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

          <div className="flex gap-x-3 items-center">
            <MapGLButton
              icon={pauseIcon}
              debug={true}
              btnDebugText="PAYL BTTN"
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
        </div>
      </MapGLLeftDrawer>
    );
  }
);
