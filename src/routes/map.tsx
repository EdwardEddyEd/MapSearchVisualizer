import { createFileRoute } from "@tanstack/react-router";
import { Map } from "@pages/Map/Map";

export const Route = createFileRoute("/map")({
  component: MapComponent,
});

function MapComponent() {
  return (
    <div className="flex flex-col m-7">
      <Map />
    </div>
  );
}
