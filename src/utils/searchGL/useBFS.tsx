import { useCallback, useEffect, useRef, useState } from "react";
import { WayId, Graph, Node, NodeId } from "@classes/graph/GraphGL";

export type PrevConnection = {
  nodeId: NodeId;
  connectingEdgeId: WayId;
};

type FutureNode = {
  nodeId: NodeId;
  prevConnection: PrevConnection;
};

type SearchState = {
  visitedEdges: Record<WayId, number>;
  solution: WayId[];
  timeSolved: number;
};

export function useBFS(mapGraph: Graph, startNode: Node, endNode: Node) {
  // References are used so that any changes to them during searching do not trigger a re-render.
  const visited = useRef<Record<NodeId, PrevConnection>>({}); // Key = Node.id of visited vertex, Value = [Node.id of previous node, Way.id connecting them]
  const visitedEdges = useRef<Record<WayId, number>>({}); // Key = Way.id of visited edge, Value = unix timestamp in seconds of visit; This is for rendering reasons only
  const solution = useRef<WayId[]>([]);
  const timeSolved = useRef<number>(-1); // Unix seconds of when a solution was reached
  const dequeue = useRef<FutureNode[]>([
    {
      nodeId: startNode.id,
      prevConnection: { nodeId: -1, connectingEdgeId: -1 },
    },
  ]); // Key = Node.id of to-be-visited vertex, Value = [Node.id of previous node, Way.id connecting them]

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
      dequeue.current = [];
      return;
    } else if (startNode.id !== -1 && endNode.id !== -1) {
      dequeue.current = [
        {
          nodeId: startNode.id,
          prevConnection: { nodeId: -1, connectingEdgeId: -1 },
        },
      ];
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
    if (dequeue.current.length < 1 || solution.current.length > 0) return;

    // Get the next node to visit and it's connecting edge
    const { nodeId: currNodeId, prevConnection: prevConnection } =
      dequeue.current.shift()!;

    // Have to color the edge just travelled
    visitedEdges.current[prevConnection.connectingEdgeId] = Date.now() / 1000;

    // If the node has been visited, color the edge and leave
    if (visited.current[currNodeId]) {
      return;
    }

    // Otherwise, add node to visited nodesed
    visited.current[currNodeId] = prevConnection;

    // If the currNode is the endNode, get the solution
    if (currNodeId === endNode.id) {
      getSolution(currNodeId);
      return;
    }

    const neighbors = mapGraph.getNeighborsFromId(currNodeId);
    for (const { neighbor, edge } of neighbors) {
      if (visited.current[neighbor.id] === undefined) {
        dequeue.current.push({
          nodeId: neighbor.id,
          prevConnection: {
            nodeId: currNodeId,
            connectingEdgeId: edge.id,
          },
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
    startNode,
    endNode,
  };
}
