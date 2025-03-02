import { createFileRoute } from "@tanstack/react-router";
import { MapGL } from "@pages/MapGL/MapGL";
import { MapSearchProvider } from "@contexts/MapSearchContext";

export const Route = createFileRoute("/mapgl")({
  component: MapGLComponent,
});

function MapGLComponent() {
  return (
    <MapSearchProvider>
      <MapGL />
    </MapSearchProvider>
  );
}
