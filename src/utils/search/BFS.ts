import { Graph, Node, WayId } from "@classes/graph/Graph";

type FutureNode = {
  nodeId: number;
  wayIds: WayId[];
};

export class BFS {
  startNode: number; // Node.id of starting node
  endNode: number; // Node.id of end node

  visited: Record<number, boolean>; // Key = Node.id of visited vertex, Value = true
  visitedEdge: Record<WayId, boolean>; // Key = Way.id of visited edge, Value = true; This is for rendering reasons only
  dequeue: FutureNode[]; // Key = Node.id of to-be-visited vertex, Value = Array of edges leading up to to-be-visited vertex
  mapGraph: Graph;

  solved: boolean;
  solution: WayId[];

  constructor(graph: Graph, startNode: Node, endNode: Node) {
    this.startNode = startNode.id;
    this.endNode = endNode.id;

    this.visited = {};
    this.visitedEdge = {};
    this.dequeue = [{ nodeId: startNode.id, wayIds: [] }];
    this.mapGraph = graph;

    this.solved = false;
    this.solution = [];
  }

  iterate(steps: number) {
    for (let i = 0; i < steps; i++) this.step();
  }

  step() {
    if (this.dequeue.length < 1 || this.solved) return;

    const { nodeId: currNode, wayIds: currPath } = this.dequeue.shift()!;
    this.visitedEdge[currPath[currPath.length - 1]] = true; // Have to color the edge just travelled

    if (this.visited[currNode]) return;
    else {
      this.visited[currNode] = true;
    }

    if (currNode === this.endNode) {
      this.solved = true;
      this.solution = currPath;
    }

    const neighbors = this.mapGraph.getNeighborsFromId(currNode);
    for (const { neighbor, edge } of neighbors) {
      if (this.visited[neighbor.id] === undefined) {
        this.dequeue.push({
          nodeId: neighbor.id,
          wayIds: [...currPath, edge.id],
        });
      }
    }
  }
}
