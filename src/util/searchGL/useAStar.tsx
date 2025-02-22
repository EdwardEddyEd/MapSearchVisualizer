import { useCallback, useEffect, useRef, useState } from "react";
import { WayId, Graph, Node, NodeId } from "../../components/graph/GraphGL";
import { haversine_distance } from "../mapUtils";
import { Heap } from "heap-js";

export type PrevConnection = {
  nodeId: NodeId;
  connectingEdgeId: WayId;
};

/*
  DIFFERENT SCORING METHODS:
  Distance from Start + Distance from End
  Number of edges travelled + Distance from End
  Distance travelled thus far + Distance from End
*/

type FutureNode = {
  nodeId: NodeId;
  prevConnection: PrevConnection;
  edgeCount: number;
  distanceTravelled: number;
  score: number; // Heuristic score: Number of edges + Distance from end
};

type SearchState = {
  visitedEdges: Record<WayId, number>;
  solution: WayId[];
  timeSolved: number;
};

const minDistanceComparator = (a: FutureNode, b: FutureNode) =>
  a.score - b.score;

export function useAStar(mapGraph: Graph, startNode: Node, endNode: Node) {
  // References are used so that any changes to them during searching do not trigger a re-render.
  const visited = useRef<Record<NodeId, PrevConnection>>({}); // Key = Node.id of visited vertex, Value = [Node.id of previous node, Way.id connecting them]
  const visitedEdges = useRef<Record<WayId, number>>({}); // Key = Way.id of visited edge, Value = unix timestamp in seconds of visit; This is for rendering reasons only
  const solution = useRef<WayId[]>([]);
  const timeSolved = useRef<number>(-1); // Unix seconds of when a solution was reached
  const dequeue = useRef<Heap<FutureNode>>(
    new Heap<FutureNode>(minDistanceComparator)
  ); // Key = Node.id of to-be-visited vertex, Value = [score, Node.id of previous node, Way.id connecting them]

  const [state, setState] = useState<SearchState>(() => ({
    visitedEdges: {},
    solution: [],
    timeSolved: -1,
  }));

  // Update for when startNode and endNode are set or reset
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
      // Initialize the minHeap when startNode and endNodes are set
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
    // Initialize BFS when startNode and endNode change
  }, [mapGraph, startNode, endNode]);

  const iterate = useCallback(
    (steps: number) => {
      if (startNode.id === -1 || endNode.id === -1) return; // Ignore invalid nodes

      for (let i = 0; i < steps; i++) step();
      setState(() => ({
        visitedEdges: { ...visitedEdges.current },
        solution: [...solution.current],
        timeSolved: timeSolved.current,
      }));
    },
    [startNode, endNode]
  );

  const step = () => {
    if (dequeue.current.isEmpty() || solution.current.length > 0) return;

    // Get the next node to visit and it's connecting edge
    const {
      nodeId: currNodeId,
      prevConnection: prevConnection,
      distanceTravelled,
      edgeCount,
      score,
    } = dequeue.current.pop()!;

    // Have to color the edge just travelled
    visitedEdges.current[prevConnection.connectingEdgeId] = Date.now() / 1000;

    // If the node has been visited, color the edge and leave
    if (visited.current[currNodeId]) {
      return;
    }

    // Otherwise, add node to visited nodes
    visited.current[currNodeId] = prevConnection;

    // If the currNode is the endNode, get the solution
    if (currNodeId === endNode.id) {
      getSolution(currNodeId);
      return;
    }

    const neighbors = mapGraph.getNeighborsFromId(currNodeId);
    for (const { neighbor, edge } of neighbors) {
      if (visited.current[neighbor.id] === undefined) {
        // const { lat: latStart, lng: lngStart } = startNode;
        const { lat: lat1, lng: lng1 } = mapGraph.vertices.get(currNodeId)!;
        const { lat: lat2, lng: lng2 } = neighbor;
        const { lat: latEnd, lng: lngEnd } = endNode;

        const edgeTravel = haversine_distance(lat1, lng1, lat2, lng2);
        // const distanceFromStart = haversine_distance(
        //   latStart,
        //   lngStart,
        //   lat1,
        //   lng1
        // );
        const distanceFromEnd = haversine_distance(lat1, lng1, latEnd, lngEnd);

        // const score1 = distanceFromStart + distanceFromEnd;
        // const score2 = edgeCount + 1 + distanceFromEnd / 1000;
        const score3 = distanceTravelled + edgeTravel + distanceFromEnd;

        dequeue.current.add({
          nodeId: neighbor.id,
          prevConnection: {
            nodeId: currNodeId,
            connectingEdgeId: edge.id,
          },
          score: score3,
          edgeCount: edgeCount + 1,
          distanceTravelled: distanceTravelled + edgeTravel,
        });
      }
    }
  };

  const getSolution = (nodeId: NodeId) => {
    const newSolution: WayId[] = [];
    let visitedNode = visited.current[nodeId];

    // If the latest edge = the connecting edge, we've reached the last visitedNode in the path
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
  };
}
