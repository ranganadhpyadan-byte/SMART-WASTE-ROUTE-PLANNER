import { MinHeapPriorityQueue } from './priorityQueue.js';

export function dijkstra(graph, start, destination) {
  if (!graph.hasVertex(start) || !graph.hasVertex(destination)) {
    throw new Error('Start or destination is not a valid graph node.');
  }

  const distances = new Map(graph.getVertices().map((vertex) => [vertex, Infinity]));
  const previous = new Map(graph.getVertices().map((vertex) => [vertex, null]));
  const visited = new Set();
  const queue = new MinHeapPriorityQueue();
  distances.set(start, 0);
  queue.enqueue(start, 0);

  while (!queue.isEmpty()) {
    const current = queue.dequeue();
    if (!current || visited.has(current.value)) continue;
    visited.add(current.value);
    if (current.value === destination) break;

    for (const edge of graph.getNeighbors(current.value)) {
      if (visited.has(edge.node)) continue;
      const candidateDistance = distances.get(current.value) + edge.weight;
      if (candidateDistance < distances.get(edge.node)) {
        distances.set(edge.node, candidateDistance);
        previous.set(edge.node, current.value);
        queue.enqueue(edge.node, candidateDistance);
      }
    }
  }

  const path = [];
  if (distances.get(destination) !== Infinity) {
    let current = destination;
    while (current !== null) {
      path.unshift(current);
      current = previous.get(current);
    }
  }

  return {
    path,
    distance: distances.get(destination),
    visitedNodes: [...visited],
    previous,
    distances,
    reachable: path.length > 0
  };
}
