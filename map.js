const SVG_NS = 'http://www.w3.org/2000/svg';

export class GraphMap {
  constructor(svg, locations, roads, onNodeSelect) {
    this.svg = svg;
    this.locations = locations;
    this.roads = roads;
    this.onNodeSelect = onNodeSelect;
    this.route = [];
    this.nodes = new Map(locations.map((location) => [location.id, location]));
    this.positions = this.#calculatePositions();
  }

  #calculatePositions() {
    const padding = 70;
    const width = 900;
    const height = 500;
    const lats = this.locations.map((location) => location.latitude);
    const longs = this.locations.map((location) => location.longitude);
    const minLat = Math.min(...lats), maxLat = Math.max(...lats), minLong = Math.min(...longs), maxLong = Math.max(...longs);
    return new Map(this.locations.map((location) => [location.id, {
      x: padding + ((location.longitude - minLong) / (maxLong - minLong || 1)) * (width - padding * 2),
      y: height - padding - ((location.latitude - minLat) / (maxLat - minLat || 1)) * (height - padding * 2)
    }]));
  }

  render(route = this.route) {
    this.route = route;
    this.svg.setAttribute('viewBox', '0 0 900 500');
    this.svg.replaceChildren();
    const routeEdges = new Set(route.slice(1).map((id, index) => `${route[index]}-${id}`));
    const edgeLayer = document.createElementNS(SVG_NS, 'g');
    const nodeLayer = document.createElementNS(SVG_NS, 'g');
    edgeLayer.setAttribute('class', 'edge-layer');
    nodeLayer.setAttribute('class', 'node-layer');

    for (const road of this.roads) {
      const from = this.positions.get(road.from), to = this.positions.get(road.to);
      const line = document.createElementNS(SVG_NS, 'line');
      line.setAttribute('x1', from.x); line.setAttribute('y1', from.y); line.setAttribute('x2', to.x); line.setAttribute('y2', to.y);
      const isRoute = routeEdges.has(`${road.from}-${road.to}`) || routeEdges.has(`${road.to}-${road.from}`);
      line.setAttribute('class', isRoute ? 'road route-road' : 'road');
      edgeLayer.append(line);
      const label = document.createElementNS(SVG_NS, 'text');
      const midpointX = (from.x + to.x) / 2;
      const midpointY = (from.y + to.y) / 2;
      label.setAttribute('x', midpointX); label.setAttribute('y', midpointY - 7);
      label.setAttribute('class', isRoute ? 'distance-label route-distance-label' : 'distance-label');
      label.textContent = `${road.distance.toFixed(1)} km`;
      edgeLayer.append(label);
    }

    for (const location of this.locations) {
      const position = this.positions.get(location.id);
      const group = document.createElementNS(SVG_NS, 'g');
      const isStart = route[0] === location.id, isDestination = route.at(-1) === location.id;
      const isOnRoute = route.includes(location.id);
      const normalizedType = String(location.type ?? '').trim().toLowerCase().replace(/\s+/g, '_');
      const isTransferCenter = normalizedType === 'transfer_center' || normalizedType === 'processing_facility';
      const stateClass = isStart ? 'start-node' : isDestination ? 'destination-node' : isOnRoute ? 'route-node' : isTransferCenter ? 'transfer-node' : location.priority === 'High' ? 'high-node' : 'normal-node';
      group.setAttribute('class', `node-group ${stateClass}`);
      group.setAttribute('tabindex', '0'); group.setAttribute('role', 'button'); group.setAttribute('aria-label', `Inspect ${location.name}`);
      group.addEventListener('click', () => this.onNodeSelect(location));
      group.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') this.onNodeSelect(location); });
      const halo = document.createElementNS(SVG_NS, 'circle'); halo.setAttribute('cx', position.x); halo.setAttribute('cy', position.y); halo.setAttribute('r', isStart || isDestination ? 25 : 20); halo.setAttribute('class', 'node-halo');
      const circle = document.createElementNS(SVG_NS, 'circle'); circle.setAttribute('cx', position.x); circle.setAttribute('cy', position.y); circle.setAttribute('r', isStart || isDestination ? 12 : isTransferCenter ? 10 : 8); circle.setAttribute('class', 'node-circle');
      const displayName = location.name.replace(' / Nashik Municipal Corporation', '').replace(' Waste Processing Facility', ' Processing Facility');
      const label = document.createElementNS(SVG_NS, 'text'); label.setAttribute('x', position.x); label.setAttribute('y', position.y - (isStart || isDestination ? 30 : 24)); label.setAttribute('class', 'node-label'); label.textContent = displayName;
      group.append(halo, circle, label);
      if (isStart || isDestination) {
        const stateLabel = document.createElementNS(SVG_NS, 'text');
        stateLabel.setAttribute('x', position.x); stateLabel.setAttribute('y', position.y + 29);
        stateLabel.setAttribute('class', 'node-state-label'); stateLabel.textContent = isStart ? 'START' : 'DESTINATION';
        group.append(stateLabel);
      } else if (location.priority === 'High') {
        const badge = document.createElementNS(SVG_NS, 'text');
        badge.setAttribute('x', position.x + 13); badge.setAttribute('y', position.y - 13);
        badge.setAttribute('class', 'priority-badge'); badge.textContent = 'HIGH';
        group.append(badge);
      }
      nodeLayer.append(group);
    }
    this.svg.append(edgeLayer, nodeLayer);
  }
}
