export type NodeId = number;

export type Node = {
  id: NodeId;
  lat: number;
  lng: number;
};

export type WayId = number | string;

export type Way = {
  id: WayId;
  nodes: Node[];
  tags: Record<string, string>;
};

export type CoordsGL = [number, number];

// A way to represent the segment of lines to edges for WebGL
export type WayGL = {
  wayId: WayId; // Id of the way this line belongs to
  to: CoordsGL;
  from: CoordsGL;
  color: [number, number, number];
};

export class Graph {
  vertices: Map<NodeId, Node>; // Key = Node.id, Value = Node
  edges: Map<WayId, Way>; // Key = Way.id, Value = Way
  graph: Map<NodeId, [NodeId, WayId][]>; // Key = Node.id of the starting vertex, Value = [Neighbor/End vertex Node.id, Connecting Edge Way.id]
  edgesGL: WayGL[];

  constructor(unprocRoads: Way[]) {
    this.vertices = new Map<NodeId, Node>();
    this.edges = new Map<WayId, Way>();
    this.graph = new Map<NodeId, [NodeId, WayId][]>();
    this.edgesGL = [];

    this.generateGraph(unprocRoads);
  }

  /**
   * Add a vertex node (i.e. coordinate point) if it doesn't exist in the graph.
   * @param vertex Node - A vertex node
   */
  addVertex(vertex: Node) {
    if (!this.vertices.has(vertex.id)) {
      this.vertices.set(vertex.id, vertex);
      this.graph.set(vertex.id, []);
    }
  }

  /**
   * Add multiple vertex nodes (i.e. coordinate points).
   * @param vertices Node[] - An array of vertex nodes
   */
  addVertices(vertices: Node[]) {
    vertices.forEach((v) => this.addVertex(v));
  }

  /**
   * Return all vertices from the graph
   * @returns An array of Nodes
   */
  getAllVertices(): Node[] {
    return Array.from(this.vertices).map(([_, vertex]) => vertex);
  }

  /**
   * Add a bi-directional edge to the graph.
   * @param edge Way - A OpenStreeMaps way, serving as an edge between Vertices
   * @param startVertex Node - The start node
   * @param endVertex Node - The end node
   */
  addEdge(edge: Way, startVertex: Node, endVertex: Node) {
    if (!this.edges.has(edge.id)) {
      this.edges.set(edge.id, edge);
      this.graph.get(startVertex.id)?.push([endVertex.id, edge.id]);
      this.graph.get(endVertex.id)?.push([startVertex.id, edge.id]);
    }
  }

  /**
   * Break up an edge into it's individual line segments for rendering with WebGL.
   * @param edge Way - A OpenStreeMaps way, serving as an edge between Vertices
   * @param segmentId WayId - The way's id the line segment belongs to
   */
  addEdgeGL(edge: Way, segmentId: WayId) {
    edge.nodes.forEach((_, i) => {
      if (i < edge.nodes.length - 1) {
        this.edgesGL.push({
          wayId: segmentId,
          from: [edge.nodes[i].lng, edge.nodes[i].lat],
          to: [edge.nodes[i + 1].lng, edge.nodes[i + 1].lat],
          color: [0, 0, 0],
        });
      }
    });
  }

  /**
   * Return all edges from the graph
   * @returns An array of Ways
   */
  getAllEdges(): Way[] {
    return Array.from(this.edges).map(([_, way]) => way);
  }

  /**
   * Return an array of edges from edge/way ids that are valid
   * @param edgeIds An array of edge/way ids
   * @returns An array of edges
   */
  getEdgesFromIds(edgeIds: WayId[]): Way[] {
    return edgeIds
      .map((edgeId) => this.edges.get(edgeId))
      .filter((edge) => edge !== undefined);
  }

  /**
   * Return all the neighboring vertices and their connecting edge from the provided vertex.
   * @param vertex Node - Starting vertex
   * @returns [Node, Way][] Return an array of [neighboring vertex, connecting edge]
   */
  getNeighborsFromVertex(vertex: Node) {
    return (
      this.graph.get(vertex.id)?.map(([endVertexId, edgeId]) => ({
        neighbor: this.vertices.get(endVertexId)!,
        edge: this.edges.get(edgeId)!,
      })) || []
    );
  }

  /**
   * Return all the neighboring vertices and their connecting edge from the connecting vertex id.
   * @param vertex Node - Starting vertex
   * @returns [Node, Way][] Return an array of [neighboring vertex, connecting edge]
   */
  getNeighborsFromId(vertexId: number) {
    return (
      this.graph.get(vertexId)?.map(([endVertexId, edgeId]) => ({
        neighbor: this.vertices.get(endVertexId)!,
        edge: this.edges.get(edgeId)!,
      })) || []
    );
  }

  /**
   * Generate the graph, where intersections and roadends serve as vertices and
   * segments betweeen these vertices are edges.
   * @param ways An array of ways
   * @returns Graph - Returns this graph object
   */
  generateGraph(ways: Way[]) {
    // -------------------------------------------------------------------------------
    // STEP 1: The start of end of ways are vertices. Intersections are also vertices.
    // -------------------------------------------------------------------------------

    // Count the number of times a node appears. If it appears more than once,
    // then it's likely a node that intersects two ways. Thus, add it as a vertex
    // to the graph. Map<Node.id, [Node, count]>
    const nodeUsage: Map<number, [Node, number]> = new Map<
      number,
      [Node, number]
    >();

    ways.forEach((way) => {
      way.nodes.forEach((node, i) => {
        nodeUsage.set(node.id, [node, (nodeUsage.get(node.id)?.[1] || 0) + 1]);
        if (i === 0 || i === way.nodes.length - 1) this.addVertex(node); // Adding vertices from the start and end of roadways
      });
    });

    const intersectionNodesIds = new Set(
      Array.from(nodeUsage)
        .filter(([nodeId, nodeAndCount]) => nodeAndCount[1] > 1)
        .map(([nodeId, nodeAndCount]) => nodeId)
    );
    nodeUsage.forEach((nodeAndCount, nodeId) => {
      if (nodeAndCount[1] > 1) this.addVertex(nodeAndCount[0]); // Add nodes that are intersections
    });

    // ----------------------------------------------------------------------------------
    // STEP 2: Segment roads by intersections. Add these segments as edges between nodes.
    // ----------------------------------------------------------------------------------

    // Every time a segment is created, it should be added as an edge in the graph.
    let segmentCount = 0;
    ways.forEach((way) => {
      let startVertex: Node = way.nodes[0];
      let segment: Node[] = [];
      let segmentId = `seg_${segmentCount}`;

      way.nodes.forEach((node) => {
        segment.push(node);

        if (intersectionNodesIds.has(node.id) && segment.length > 1) {
          const completedSegment = {
            id: segmentId,
            nodes: segment,
            tags: way.tags,
          };
          this.addEdge(completedSegment, startVertex, node);
          this.addEdgeGL(completedSegment, segmentId);

          // Reset the start of the new segment/edge
          segmentCount++;
          segmentId = `seg_${segmentCount}`;
          segment = [node];
          startVertex = node;
        }
      });

      if (segment.length > 1) {
        const completedSegment = {
          id: segmentId,
          nodes: segment,
          tags: way.tags,
        };
        this.addEdge(
          completedSegment,
          startVertex,
          segment[segment.length - 1]
        );
        this.addEdgeGL(completedSegment, segmentId);

        segmentCount++;
        segmentId = `seg_${segmentCount}`;
      }
    });

    return this;
  }

  /**
   * Clears the graph of its vertices, edges, and graph mapping
   */
  clearGraph() {
    this.vertices = new Map<NodeId, Node>();
    this.edges = new Map<WayId, Way>();
    this.graph = new Map<NodeId, [NodeId, WayId][]>();
  }
}
