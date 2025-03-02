import * as React from "react";
import { Link, Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import ThemeToggle from "../components/ThemeToggle/ThemeToggle";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <div className="p-2 flex gap-2 text-lg">
        <Link
          to="/"
          activeProps={{
            className: "font-bold",
          }}
          activeOptions={{ exact: true }}
        >
          Home
        </Link>{" "}
        <Link
          to="/about"
          activeProps={{
            className: "font-bold",
          }}
        >
          About
        </Link>{" "}
        <Link
          to="/map"
          activeProps={{
            className: "font-bold",
          }}
          disabled={true}
        >
          Map
        </Link>
        <Link
          to="/mapgl"
          activeProps={{
            className: "font-bold",
          }}
        >
          MapGL
        </Link>
        <div className="flex-1" />
        <ThemeToggle />
      </div>
      <hr />
      <Outlet />
      {/* <TanStackRouterDevtools position="bottom-right" /> */}
    </>
  );
}
