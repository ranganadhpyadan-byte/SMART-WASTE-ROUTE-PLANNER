# NASHIK CITY - SMART WASTE ROUTE PLANNER

A college Data Structures micro-project that models selected Nashik, Maharashtra locations and finds efficient waste-collection routes with a graph, a binary min-heap priority queue, and Dijkstra's algorithm.

> **Data note:** Real Nashik place names are used, but coordinates, road distances, estimated times, waste levels, and priorities are **Approximate project data** for academic use. They are not official Nashik Municipal Corporation measurements or live government waste statistics.

**Subtitle:** Graph-based shortest-path planning using Dijkstra's Algorithm.

## Nashik City Case Study
This application models a simplified waste collection routing problem across real Nashik City, Maharashtra place names. Pathardi Waste Processing Facility is the modeled final processing destination. Routes are calculated dynamically from the project's weighted graph, not from a manually predetermined route.

## Data Sources
- Nashik Municipal Corporation official/public documents for civic and solid-waste context.
- Government/public solid-waste documentation for the Pathardi processing-site context.
- Public map/location references such as Google Maps for place-name and approximate coordinate verification only.

No paid Google Maps API is used. Google Maps is not the routing engine.

The Pathardi Waste Processing Facility is modeled as the processing destination because Nashik Municipal Corporation public material identifies the Pathardi site in the context of solid-waste processing. The route network itself remains a simplified student demonstration.

## Data Sources & Limitations
1. Real Nashik locations and area names are used for the case study.
2. Road distances and travel times in this student prototype are approximate project data, not official NMC measurements.
3. Waste-level values and priority values are demonstration values, not official live measurements.
4. The application demonstrates an adjacency-list Graph, Min Heap Priority Queue, and Dijkstra's Algorithm; it does not replace an actual municipal routing or dispatch system.
5. A future version can use live GIS, GPS, traffic, and road-network data.
6. The graph is a simplified representation of the Nashik road network and is not live NMC operational data.
7. Real deployment would require official GIS data, live road networks, traffic, vehicle capacity, collection schedules, and municipal datasets.

### Data Sources
- [Nashik Municipal Corporation](https://nmc.gov.in/) - official municipal portal and civic location context.
- [NMC Solid Waste Management Department](https://nmc.gov.in/home/getfrontpage/11/11/M) - official NMC department reference.
- [NMC SWM service portal](http://www.nmcswmv.com/) - official NMC-linked solid-waste service reference.
- [Ministry of Housing and Urban Affairs - Swachh Bharat Mission](https://mohua.gov.in/offerings/schemes-and-services/details/swachh-bharat-mission-gjN5cTMtQWa) - national urban sanitation context.

The source links establish place, civic, and solid-waste context. They do not validate the approximate distances, coordinates, waste levels, or priorities in `data/`.

## Problem Statement
Waste collection vehicles need a clear way to move between collection points and processing facilities. A road network can be represented as a weighted graph, where locations are vertices, roads are edges, and road distances are weights. This project uses that model to calculate a shortest route between any two locations.

## Objectives
- Represent a waste-management road network with an adjacency list.
- Implement a real binary min-heap priority queue.
- Apply Dijkstra's algorithm without hardcoded route results.
- Visualize the network and the computed route in SVG.
- Present location data, filtering, route history, and validation in a usable dashboard.

## Features
- Nashik City case study with Rajiv Gandhi Bhavan, CBS, Shalimar, Panchavati, Dwarka, Nashik Road, Satpur, CIDCO, Gangapur Road, Pathardi, and the Pathardi Waste Processing Facility.
- Dynamic network metrics and location directory.
- Search and filters for location type and priority.
- Interactive SVG graph with road distance labels.
- Start/destination route planner with visited-node count and estimated time.
- Location detail panel with waste-level progress bar.
- Recent route history stored in browser `localStorage`.
- Friendly handling of missing data, invalid routes, same-node selections, and unavailable paths.

## Technology Stack
HTML5, CSS3, vanilla JavaScript ES modules, JSON, SVG, and browser `localStorage`. No framework, backend, or paid map API is required.

## Data Structures
### Graph and adjacency list
`js/graph.js` contains the `Graph` class. Its `adjacencyList` is a `Map` from a location ID to an array of neighbor edge objects. `addVertex`, `addEdge`, `getNeighbors`, and `getVertices` form the public API. Roads are loaded as bidirectional edges.

### Priority queue
`js/priorityQueue.js` contains `MinHeapPriorityQueue`. `enqueue` inserts an item and bubbles it up; `dequeue` removes the minimum priority item and restores heap order by bubbling down. Dijkstra never sorts the queue on each iteration.

### Dijkstra's Algorithm
`js/dijkstra.js` exports `dijkstra(graph, start, destination)`. It maintains a distance map, previous-node map, visited set, and min-heap. The previous map is followed backwards from the destination to reconstruct the shortest path.

### Shortest Path Reconstruction
The previous-node map is followed from destination to start and reversed for display. Every displayed road, distance, and estimated time comes from `data/roads.json`.

## Algorithm Steps
1. Set every distance to infinity and the start distance to zero.
2. Add the start node to the min-heap with priority zero.
3. Remove the unvisited node with the smallest distance.
4. Relax each unvisited neighbor if the new distance is smaller.
5. Store the current node as the neighbor's previous node when improved.
6. Continue until the heap is empty or the destination is reached.
7. Reconstruct the path by following previous nodes backwards.

## Complexity
Assuming a binary heap priority queue and adjacency-list representation:

- **Time Complexity:** `O((V + E) log V)`
- **Space Complexity:** `O(V + E)`

## Project Structure
```text
index.html                 Dashboard markup
css/style.css              Responsive visual design
js/app.js                  UI state, events, and application flow
js/graph.js                Adjacency-list graph
js/priorityQueue.js         Binary min-heap
js/dijkstra.js              Shortest-path algorithm
js/map.js                   SVG graph visualization
js/data.js                  JSON loading and validation
data/locations.json         Nashik location records with source notes
data/roads.json             Approximate Nashik road records with source notes
documentation/project-notes.md  Academic project notes
```

## How to Run
1. Open the project folder in VS Code.
2. Start a local development server, such as the **Live Server** extension.
3. Open `index.html` through the server URL, usually `http://127.0.0.1:5500/index.html`.
4. Do not open the HTML using `file://`; browser fetch restrictions prevent JSON loading there.

## How to Use
Choose a starting location and destination, then select **Find shortest route**. The result panel shows the path, distance, estimated time, and number of evaluated nodes. Select a node on the graph or a directory row to inspect its waste details. Use the search field and filter tabs to narrow the directory. Route results are saved locally and can be cleared with **Clear history**.

## Testing
The implementation is designed for these checks:
- Rajiv Gandhi Bhavan to Pathardi Waste Processing Facility.
- Panchavati to Pathardi Waste Processing Facility.
- CBS to Nashik Road.
- Satpur to Pathardi.
- Gangapur Road to Pathardi Waste Processing Facility.
- Same start and destination route: one stop, `0.0 km`, and `0 min`.
- No-route behavior when a disconnected node is introduced into a test graph.
- JSON loading, graph construction, heap ordering, path reconstruction, filtering, SVG route highlighting, and local history.

The core modules can also be checked in a browser console or a JavaScript test runner by importing `Graph`, `MinHeapPriorityQueue`, and `dijkstra`.

## Limitations
The network is static approximate project data, travel time is an educational estimate, and the planner does not account for traffic, vehicle capacity, road closures, live GPS, GIS road geometry, or municipal service schedules. The Pathardi destination reflects public NMC solid-waste context, but the modeled access route is not an official municipal route.

## Future Enhancements
Live sensor feeds, vehicle capacity constraints, multiple vehicle routing, traffic-aware weights, authenticated operator accounts, and a backend for shared route history could be added.

## Conclusion
This project demonstrates how an adjacency-list graph, binary min-heap, and Dijkstra's algorithm can support a practical-looking waste collection workflow while keeping the implementation transparent for Data Structures study.
