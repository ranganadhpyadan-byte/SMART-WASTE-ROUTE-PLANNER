# Project Notes: Nashik City Smart Waste Collection Route Planner

## 1. Introduction
Smart waste management depends on collecting material from several points and moving it toward a processing facility. This micro-project uses selected Nashik, Maharashtra locations to demonstrate a route planning view using core Data Structures concepts. It is intended for a second-year B.Tech CSE student and uses only browser technologies.

All numerical records in this project are approximate demonstration data, not official municipal measurements or official government waste statistics.

## Project Objective
Demonstrate how a weighted graph, adjacency list, min-heap priority queue, and Dijkstra's algorithm can support an understandable waste collection route-planning workflow.

## Nashik City Case Study
The prototype uses real Nashik place names: Rajiv Gandhi Bhavan / Nashik Municipal Corporation, CBS, Shalimar, Panchavati, Dwarka, Nashik Road, Satpur, CIDCO, Gangapur Road, Pathardi, and Pathardi Waste Processing Facility. Pathardi is the modeled final processing destination based on public NMC/government solid-waste context.

## 2. Problem Statement
A collection vehicle may have several possible roads between two points. Choosing a route by guess can increase distance and time. The system must represent the network and compute a shortest route from a selected start location to a destination.

## 3. Existing System
In a basic manual system, operators may use printed maps, verbal instructions, or fixed routes. Such approaches do not easily compare alternative roads, show network status, or preserve recently calculated routes.

## 4. Proposed System
The proposed browser dashboard stores locations as graph vertices and roads as weighted edges. When an operator selects two locations, Dijkstra's algorithm finds the minimum-distance route. The route is drawn on an SVG graph and its result is stored in local browser history.

## 5. Objectives
- Understand weighted graph representation.
- Implement an adjacency list from first principles.
- Implement a binary min-heap priority queue.
- Use Dijkstra's algorithm to calculate and reconstruct a path.
- Build a responsive interface around the algorithm.
- Practice validation, JSON loading, modular JavaScript, and browser storage.

## 6. Scope
The project covers eleven real Nashik place names and nineteen simplified road links, including Pathardi Waste Processing Facility as the modeled processing destination. It supports one start point and one destination at a time. It is an educational simulation, not a live municipal operations platform.

The locations are grounded in public Nashik civic context. Road distances, estimated times, coordinates, waste levels, and priorities are explicitly **Approximate project data** and are not official Nashik Municipal Corporation measurements. NMC public material identifies the Pathardi site in the context of solid-waste processing, which is why it is used as the destination in the case study.

## Dataset
`data/locations.json` stores the eleven locations and their coordinates, types, waste values, descriptions, and source notes. `data/roads.json` stores the connected simplified road network, distances, estimated times, road names, road types, and source notes.

## 7. Data Sources & Limitations
The project references the [Nashik Municipal Corporation](https://nmc.gov.in/), its [Solid Waste Management Department](https://nmc.gov.in/home/getfrontpage/11/11/M), the [NMC SWM service portal](http://www.nmcswmv.com/), and the [Ministry of Housing and Urban Affairs Swachh Bharat Mission](https://mohua.gov.in/offerings/schemes-and-services/details/swachh-bharat-mission-gjN5cTMtQWa). These sources provide civic and solid-waste context; they do not certify the prototype's route distances or waste values.

1. Real Nashik locations and area names are used.
2. Road distances in this student prototype are approximate.
3. Waste-level and priority values are demonstration values, not official live measurements.
4. The application demonstrates Graph + Dijkstra rather than replacing an actual municipal routing system.
5. A future version can use live GIS, road-network, traffic, and vehicle data.
6. The graph is a simplified Nashik road network, not official live NMC operational data.
7. Real deployment requires official GIS data, live road networks, traffic, vehicle capacity, collection schedules, and municipal datasets.

## 8. Functional Requirements
1. Load and validate locations and roads from JSON files.
2. Display network totals and average waste level.
3. Populate start and destination controls.
4. Reject missing, identical, invalid, and unreachable selections.
5. Calculate a shortest route with Dijkstra's algorithm.
6. Show distance, estimated time, route steps, and visited nodes.
7. Highlight the calculated route in the SVG graph.
8. Show location details and a waste-level progress bar.
9. Search and filter the location directory.
10. Store, display, and clear recent route history with `localStorage`.

## 9. Non-functional Requirements
The dashboard should be responsive, readable, modular, accessible with keyboard focus for graph nodes, and usable through a local static server. It should not depend on a paid map service, framework, or backend.

## 10. System Architecture
The HTML page provides the interface. `data.js` fetches JSON and validates records. `app.js` coordinates application state and user events. `graph.js` creates the adjacency-list model. `dijkstra.js` calls `priorityQueue.js` and returns a reconstructed path. `map.js` converts the location coordinates and road records into an SVG network view. CSS controls the responsive presentation.

## 11. Data Structures
The `Graph` class uses `Map<string, Edge[]>`. Each vertex is a location ID. Each edge stores the neighbor node, distance weight, and road metadata. Because roads are modeled as bidirectional, one road record creates two adjacency entries.

The `MinHeapPriorityQueue` stores `{ value, priority }` records in an array. For an item at index `i`, its parent is `floor((i - 1) / 2)`, its left child is `2i + 1`, and its right child is `2i + 2`.

Dijkstra uses `Map` instances for distances and previous nodes, plus a `Set` for visited locations.

## 12. Dijkstra Algorithm
Dijkstra's algorithm solves the single-source shortest-path problem for graphs with non-negative edge weights. Road distances in this project are positive, so the algorithm applies correctly.

## 13. Algorithm Steps
1. Check that the start and destination exist.
2. Initialize all distances to infinity and all previous values to null.
3. Set the start distance to zero and enqueue it.
4. Dequeue the smallest-priority unvisited node.
5. For every neighbor, calculate a candidate distance.
6. If the candidate is shorter, update its distance and previous node, then enqueue it.
7. Stop when the destination is reached or the queue is empty.
8. Follow the previous map from destination to start and reverse the collected sequence.

## 14. Complexity Analysis
With `V` vertices, `E` edges, an adjacency list, and a binary heap:

- Time Complexity: **O((V + E) log V)**
- Space Complexity: **O(V + E)**

## 15. Modules
- `graph.js`: Graph and adjacency-list operations only.
- `priorityQueue.js`: Binary min-heap operations only.
- `dijkstra.js`: Shortest-path computation only.
- `data.js`: Fetching and validation of JSON data.
- `map.js`: SVG graph rendering and node interaction.
- `app.js`: UI coordination, filtering, history, and event handling.
- `style.css`: Visual design and responsive layout.

## 16. Testing
Recommended functional checks include Rajiv Gandhi Bhavan to Pathardi Waste Processing Facility, Panchavati to Pathardi Waste Processing Facility, CBS to Nashik Road, Satpur to Pathardi, and Gangapur Road to Pathardi Waste Processing Facility. An identical start and destination should produce a one-node, zero-distance, zero-minute route. A disconnected test graph should return an empty path and an unreachable result. Additional checks cover heap ordering, JSON syntax, filtering, search, clickable nodes, route highlighting, and route persistence after reload.

## 17. Expected Results
A valid selection produces a route sequence, a total distance in kilometres, an estimated time in minutes, and the number of visited nodes. The matching SVG road segments change to orange. The calculated route appears at the top of recent history.

## 18. Limitations
The coordinates and road records are illustrative. The system has no live traffic, vehicle capacity, waste sensor integration, authentication, multi-vehicle optimization, or server-side persistence. The estimated time is a simple presentation estimate rather than a traffic prediction.

## 19. Future Scope
The project could use live bin sensors, a backend database, role-based access, traffic APIs, road closure updates, vehicle capacity constraints, multi-depot planning, and advanced vehicle routing algorithms.

## 20. Conclusion
The Smart Waste Collection Route Planner connects a familiar civic problem with graph fundamentals. The adjacency list keeps the network efficient to traverse, the min-heap gives Dijkstra fast access to the next best candidate, and the SVG interface makes the algorithm's result visible and understandable.
