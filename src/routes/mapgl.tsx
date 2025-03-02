import { createFileRoute } from "@tanstack/react-router";
import { MapGL } from "@pages/MapGL/MapGL";

export const Route = createFileRoute("/mapgl")({
  component: MapGLComponent,
});

function MapGLComponent() {
  return (
    <div>
      <MapGL />
    </div>
  );
}
