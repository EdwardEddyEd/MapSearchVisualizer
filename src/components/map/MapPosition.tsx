import { useState, useCallback, useEffect } from "react";
import { clampLongitude } from "../../util/mapUtils";

export function MapPosition({ map }: { map: L.Map }) {
  const [position, setPosition] = useState(() => map.getCenter());
  const [bbox, setBBox] = useState(() => map.getBounds());

  const onMove = useCallback(() => {
    setPosition(map.getCenter());
    setBBox(map.getBounds());
  }, [map]);

  useEffect(() => {
    map.on("move", onMove);
    return () => {
      map.off("move", onMove);
    };
  }, [map, onMove]);

  return (
    <div className="p-0.5 px-2 m-1 flex flex-col leaflet-bottom leaflet-left text-black bg-slate-100 rounded-3xl shadow shadow-slate-500">
      <p>{`Lat: ${position.lat.toFixed(4)}, Long: ${clampLongitude(map.getCenter().lng).toFixed(4)}`}</p>
      <p></p>
    </div>
  );
}
