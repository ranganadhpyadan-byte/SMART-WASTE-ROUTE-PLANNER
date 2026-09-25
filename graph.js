export class Graph {
  constructor() {
    this.adjacencyList = new Map();
  }

  addVertex(vertex) {
    if (!this.adjacencyList.has(vertex)) this.adjacencyList.set(vertex, []);
    return this;
  }

  addEdge(from, to, weight, metadata = {}) {
    this.addVertex(from).addVertex(to);
    this.adjacencyList.get(from).push({ node: to, weight, ...metadata });
    this.adjacencyList.get(to).push({ node: from, weight, ...metadata });
    return this;
  }

  getNeighbors(vertex) {
    return this.adjacencyList.get(vertex) ?? [];
  }

  getVertices() {
    return [...this.adjacencyList.keys()];
  }

  hasVertex(vertex) {
    return this.adjacencyList.has(vertex);
  }

  getEdgeCount() {
    let directedEdges = 0;
    for (const neighbors of this.adjacencyList.values()) directedEdges += neighbors.length;
    return directedEdges / 2;
  }
}
