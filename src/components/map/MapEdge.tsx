import { Polyline, Popup } from "react-leaflet";
import type { Polyline as LeafletPolyline } from "leaflet";
import { useRef, useEffect } from "react";
import { Way } from "../graph/Graph";
import React from "react";
import { lerpColor } from "../../util/colorUtils";

type MapEdgeProps = {
  edge: Way;
  color: string;
  isVisited: boolean;
  isSolution?: boolean;
};

export const MapEdge = React.memo(
  ({ edge, color, isVisited, isSolution = false }: MapEdgeProps) => {
    const mainLineRef = useRef<LeafletPolyline>(null);
    const glowLine1Ref = useRef<LeafletPolyline>(null);
    const glowLine2Ref = useRef<LeafletPolyline>(null);
    const glowLine3Ref = useRef<LeafletPolyline>(null);

    useEffect(() => {
      if (
        mainLineRef.current &&
        glowLine1Ref.current &&
        glowLine2Ref.current &&
        glowLine3Ref.current
      ) {
        const colorLine = isSolution
          ? "#FFFFFF"
          : isVisited
            ? "#FCE40F"
            : color;

        // Main line color
        mainLineRef.current.setStyle({
          color: colorLine,
          weight: 2,
          opacity: 1,
        });

        if (isVisited) {
          // Show glow immediately
          glowLine1Ref.current.setStyle({
            color: "#FF8800",
            weight: 8,
            opacity: 0.1,
          });
          glowLine2Ref.current.setStyle({
            color: "#FF8800",
            weight: 14,
            opacity: 0.06,
          });
          glowLine3Ref.current.setStyle({
            color: "#FF8800",
            weight: 20,
            opacity: 0.03,
          });

          // Smooth fade-out effect
          let fadeDuration = 5000; // 5 second fade-out
          let colorFadeDuration = 2000;
          let steps = 200; // Number of animation steps
          let stepTime = fadeDuration / steps;
          let colorStepTime = colorFadeDuration / steps;
          let step = 0;
          let colorStep = 0;

          const fadeOut = setInterval(() => {
            step++;
            let newOpacity1 = Math.max(0.1 * (1 - step / steps), 0);
            let newOpacity2 = Math.max(0.06 * (1 - step / steps), 0);
            let newOpacity3 = Math.max(0.03 * (1 - step / steps), 0);

            glowLine1Ref.current?.setStyle({ opacity: newOpacity1 });
            glowLine2Ref.current?.setStyle({ opacity: newOpacity2 });
            glowLine3Ref.current?.setStyle({ opacity: newOpacity3 });

            if (step >= steps) {
              clearInterval(fadeOut);
            }
          }, stepTime);

          const colorFadeOut = setInterval(() => {
            colorStep++;
            let newColorMain = lerpColor(
              "#FCE40F",
              "#70321C",
              colorStep / steps
            );

            mainLineRef.current?.setStyle({ color: newColorMain });

            if (colorStep >= steps) {
              clearInterval(colorFadeOut);
            }
          }, colorStepTime);
        }

        if (isSolution) {
          // Show glow immediately
          glowLine1Ref.current.setStyle({
            color: "#AAFFFF",
            weight: 8,
            opacity: 0.1,
          });
          glowLine2Ref.current.setStyle({
            color: "#44FFFF",
            weight: 14,
            opacity: 0.06,
          });
          glowLine3Ref.current.setStyle({
            color: "#00DDFF",
            weight: 20,
            opacity: 0.03,
          });

          // Smooth fade-out effect
          let fadeDuration = 5000; // 5 second fade-out
          let colorFadeDuration = 2000;
          let steps = 200; // Number of animation steps
          let stepTime = fadeDuration / steps;
          let colorStepTime = colorFadeDuration / steps;
          let step = 0;
          let colorStep = 0;

          const fadeOut = setInterval(() => {
            step++;
            let newOpacity1 = Math.max(0.1 * (1 - step / steps), 0);
            let newOpacity2 = Math.max(0.06 * (1 - step / steps), 0);
            let newOpacity3 = Math.max(0.03 * (1 - step / steps), 0);

            glowLine1Ref.current?.setStyle({ opacity: newOpacity1 });
            glowLine2Ref.current?.setStyle({ opacity: newOpacity2 });
            glowLine3Ref.current?.setStyle({ opacity: newOpacity3 });

            if (step >= steps) {
              clearInterval(fadeOut);
            }
          }, stepTime);

          const colorFadeOut = setInterval(() => {
            colorStep++;
            let newColorMain = lerpColor(
              "#FFFFFF",
              "#00AADD",
              colorStep / steps
            );

            mainLineRef.current?.setStyle({ color: newColorMain, weight: 5 });

            if (colorStep >= steps) {
              clearInterval(colorFadeOut);
            }
          }, colorStepTime);
        }
      }
    }, [isVisited, isSolution, color]);

    return (
      <>
        <Polyline
          ref={glowLine3Ref}
          positions={edge.nodes}
          weight={0}
          color={color}
          opacity={0}
        />
        <Polyline
          ref={glowLine2Ref}
          positions={edge.nodes}
          weight={0}
          color={color}
          opacity={0}
        />
        <Polyline
          ref={glowLine1Ref}
          positions={edge.nodes}
          weight={0}
          color={color}
          opacity={0}
        />
        <Polyline
          ref={mainLineRef}
          key={edge.id}
          positions={edge.nodes}
          weight={2}
          opacity={0.1}
          color={color}
        />
      </>
    );
  }
);
