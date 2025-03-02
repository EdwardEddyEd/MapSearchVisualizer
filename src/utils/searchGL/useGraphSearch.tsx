import { useCallback, useEffect, useRef, useState } from "react";
import { WayId, Graph, Node, NodeId } from "@classes/graph/GraphGL";
import { haversine_distance } from "@utils/mapUtils";
import { Heap } from "heap-js";
import { toast } from "sonner";

type PrevConnection = {
  nodeId: NodeId;
  connectingEdgeId: WayId;
};

type FutureNode = {
  nodeId: NodeId;
  prevConnection: PrevConnection;
  edgeCount: number;
  distanceTravelled: number;
  score: number;
};

type SearchState = {
  visitedEdges: Record<WayId, number>;
  solution: WayId[];
  timeSolved: number;
};

const minDistanceComparator = (a: FutureNode, b: FutureNode) =>
  a.score - b.score;

export type SearchType = "A*" | "BFS";

export function useGraphSearch(
  mapGraph: Graph,
  startNode: Node,
  endNode: Node,
  searchType: SearchType
) {
  const visited = useRef<Record<NodeId, PrevConnection>>({});
  const visitedEdges = useRef<Record<WayId, number>>({});
  const solution = useRef<WayId[]>([]);
  const timeSolved = useRef<number>(-1);
  const dequeue = useRef<Heap<FutureNode>>(
    new Heap<FutureNode>(minDistanceComparator)
  );

  const [state, setState] = useState<SearchState>(() => ({
    visitedEdges: {},
    solution: [],
    timeSolved: -1,
  }));

  useEffect(() => {
    if (startNode.id === -1 || endNode.id === -1) {
      setState({ visitedEdges: {}, solution: [], timeSolved: -1 });
      visited.current = {};
      visitedEdges.current = {};
      solution.current = [];
      timeSolved.current = -1;
      dequeue.current = new Heap<FutureNode>(minDistanceComparator);
      return;
    } else if (startNode.id !== -1 && endNode.id !== -1) {
      dequeue.current.clear();
      dequeue.current.init([
        {
          nodeId: startNode.id,
          prevConnection: { nodeId: -1, connectingEdgeId: -1 },
          distanceTravelled: 0,
          edgeCount: 0,
          score: 0,
        },
      ]);
      return;
    }
  }, [mapGraph, startNode, endNode]);

  const restartSearch = useCallback(() => {
    setState({ visitedEdges: {}, solution: [], timeSolved: -1 });

    visited.current = {};
    visitedEdges.current = {};
    solution.current = [];
    timeSolved.current = -1;

    dequeue.current.clear();
    dequeue.current.init([
      {
        nodeId: startNode.id,
        prevConnection: { nodeId: -1, connectingEdgeId: -1 },
        distanceTravelled: 0,
        edgeCount: 0,
        score: 0,
      },
    ]);
  }, [startNode]);

  const iterate = useCallback(
    (steps: number) => {
      if (startNode.id === -1 || endNode.id === -1) return;

      for (let i = 0; i < steps; i++) step();
      setState(() => ({
        visitedEdges: { ...visitedEdges.current },
        solution: [...solution.current],
        timeSolved: timeSolved.current,
      }));
    },
    [startNode, endNode, searchType]
  );

  const step = () => {
    if (dequeue.current.isEmpty() || solution.current.length > 0) return;

    const {
      nodeId: currNodeId,
      prevConnection,
      distanceTravelled,
      edgeCount,
    } = dequeue.current.pop()!;

    visitedEdges.current[prevConnection.connectingEdgeId] = Date.now() / 1000;

    if (visited.current[currNodeId]) return;

    visited.current[currNodeId] = prevConnection;

    if (currNodeId === endNode.id) {
      getSolution(currNodeId);
      toast.success("Path found!", { position: "top-center" });
      return;
    }

    const neighbors = mapGraph.getNeighborsFromId(currNodeId);
    for (const { neighbor, edge } of neighbors) {
      if (visited.current[neighbor.id] === undefined) {
        const { lat, lng } = mapGraph.vertices.get(currNodeId)!;
        const { lat: latNeighbor, lng: lngNeighbor } = neighbor;
        const { lat: latEnd, lng: lngEnd } = endNode;

        const edgeTravel = haversine_distance(
          lat,
          lng,
          latNeighbor,
          lngNeighbor
        );
        const distanceFromEnd = haversine_distance(lat, lng, latEnd, lngEnd);

        const newEdgeCount = (edgeCount || 0) + 1;

        if (searchType === "A*") {
          const score = distanceTravelled + edgeTravel + distanceFromEnd;
          dequeue.current.add({
            nodeId: neighbor.id,
            prevConnection: { nodeId: currNodeId, connectingEdgeId: edge.id },
            score,
            edgeCount: newEdgeCount,
            distanceTravelled: distanceTravelled + edgeTravel,
          });
        } else {
          // For BFS, use edgeCount as score
          dequeue.current.add({
            nodeId: neighbor.id,
            prevConnection: { nodeId: currNodeId, connectingEdgeId: edge.id },
            score: newEdgeCount, // BFS score is just the edge count
            edgeCount: newEdgeCount,
            distanceTravelled: distanceTravelled + edgeTravel,
          });
        }
      }
    }
  };

  const getSolution = (nodeId: NodeId) => {
    const newSolution: WayId[] = [];
    let visitedNode = visited.current[nodeId];

    while (visitedNode.connectingEdgeId !== -1) {
      newSolution.push(visitedNode.connectingEdgeId);
      visitedNode = visited.current[visitedNode.nodeId];
    }

    solution.current = newSolution;
    timeSolved.current = Date.now() / 1000;
  };

  return {
    state,
    iterate,
    restartSearch,
  };
}
