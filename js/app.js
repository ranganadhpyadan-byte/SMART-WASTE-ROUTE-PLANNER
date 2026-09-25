import { Graph } from './graph.js';
import { dijkstra } from './dijkstra.js';
import { loadNetworkData } from './data.js';
import { GraphMap } from './map.js';

const $ = (selector) => document.querySelector(selector);
const state = { locations: [], roads: [], graph: null, map: null, activeFilter: 'All', search: '', lastResult: null };
const HISTORY_KEY = 'smart-waste-route-history';

function normalizeLocationType(type = '') { return String(type).trim().toLowerCase().replace(/\s+/g, '_'); }
function formatLocationType(type = '') { return String(type).replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()); }
function formatDistance(distance) { return `${distance.toFixed(1)} km`; }
function formatLocation(id) { return state.locations.find((location) => location.id === id)?.name ?? id; }
function displayError(message) { const element = $('#plannerMessage'); element.textContent = message; element.className = 'planner-message error'; }
function clearMessage() { const element = $('#plannerMessage'); element.textContent = ''; element.className = 'planner-message'; }

function populateSelects() {
  const options = state.locations.map((location) => `<option value="${location.id}">${location.name}</option>`).join('');
  $('#startSelect').insertAdjacentHTML('beforeend', options);
  $('#destinationSelect').insertAdjacentHTML('beforeend', options);
}

function updateMetrics() {
  $('#totalLocations').textContent = state.locations.length;
  $('#totalRoads').textContent = state.roads.length;
  $('#highPriority').textContent = state.locations.filter((location) => location.priority === 'High').length;
  $('#averageWaste').textContent = `${Math.round(state.locations.reduce((sum, location) => sum + location.wasteLevel, 0) / state.locations.length)}%`;
  $('#mapNodeCount').textContent = state.locations.length;
  $('#mapRoadCount').textContent = state.roads.length;
}

function renderLocations() {
  const query = state.search.toLowerCase();
  const filtered = state.locations.filter((location) => {
    const matchesSearch = `${location.name} ${location.area} ${location.type} ${location.wasteType}`.toLowerCase().includes(query);
    const matchesFilter = state.activeFilter === 'All' || (state.activeFilter === 'High Priority' ? location.priority === 'High' : normalizeLocationType(location.type) === normalizeLocationType(state.activeFilter));
    return matchesSearch && matchesFilter;
  });
  $('#locationCount').textContent = `${filtered.length} location${filtered.length === 1 ? '' : 's'}`;
  $('#locationList').innerHTML = filtered.length ? filtered.map((location) => `<button class="location-item ${location.priority === 'High' ? 'is-high' : ''}" data-location-id="${location.id}"><span class="location-symbol">${location.id.slice(1)}</span><span class="location-item-main"><strong>${location.name}</strong><small>${formatLocationType(location.type)} / ${location.wasteType}</small></span><span class="mini-level"><i style="width:${location.wasteLevel}%"></i></span><span class="priority-tag"><i class="priority-dot ${location.priority.toLowerCase()}"></i>${location.priority.toUpperCase()}</span></button>`).join('') : '<div class="empty-directory">No locations match this search.</div>';
  document.querySelectorAll('[data-location-id]').forEach((item) => item.addEventListener('click', () => selectLocation(state.locations.find((location) => location.id === item.dataset.locationId))));
}

function selectLocation(location) {
  if (!location) return;
  $('#detailId').textContent = location.id;
  $('#detailContent').className = 'detail-content';
  const locationType = formatLocationType(location.type);
  $('#detailContent').innerHTML = `<div class="detail-title"><span class="detail-pin">${location.id.slice(1)}</span><div><h3>${location.name}</h3><span>${location.area} / ${locationType}</span></div></div><div class="detail-level"><div><span>Waste level</span><strong>${location.wasteLevel}%</strong></div><div class="progress"><i style="width:${location.wasteLevel}%"></i></div></div><div class="detail-facts"><div><span>Waste type</span><strong>${location.wasteType}</strong></div><div><span>Priority</span><strong class="${location.priority === 'High' ? 'text-alert' : ''}">${location.priority}</strong></div><div><span>Coordinates</span><strong>${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}</strong></div></div><p class="detail-description">${location.description}</p><p class="detail-source">${location.sourceNote}</p>`;
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  $('#historyList').innerHTML = history.length ? history.map((item) => `<button class="history-item" data-history-start="${item.start}" data-history-destination="${item.destination}"><span class="history-route">${formatLocation(item.start)} <b>-&gt;</b> ${formatLocation(item.destination)}</span><span>${formatDistance(item.distance)} / ${item.time} min</span></button>`).join('') : '<div class="empty-history">Your calculated routes will appear here.</div>';
  document.querySelectorAll('[data-history-start]').forEach((item) => item.addEventListener('click', () => { $('#startSelect').value = item.dataset.historyStart; $('#destinationSelect').value = item.dataset.historyDestination; $('#routeForm').requestSubmit(); }));
}

function saveHistory(start, destination, distance, time) {
  const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]').filter((item) => !(item.start === start && item.destination === destination));
  history.unshift({ start, destination, distance, time });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 5)));
  renderHistory();
}

function getRoad(from, to) {
  return state.roads.find((item) => (item.from === from && item.to === to) || (item.from === to && item.to === from));
}

function getRouteTime(path) {
  return path.slice(1).reduce((total, locationId, index) => total + (getRoad(path[index], locationId)?.estimatedTime ?? 0), 0);
}

function showRoute(result, start, destination) {
  $('#routeSteps').innerHTML = result.path.map((locationId, index) => {
    const isStart = index === 0;
    const isDestination = index === result.path.length - 1;
    const road = index < result.path.length - 1 ? getRoad(locationId, result.path[index + 1]) : null;
    const stateLabel = isStart ? 'START' : isDestination ? 'DESTINATION' : `STOP ${String(index).padStart(2, '0')}`;
    const legDetails = road ? `${road.distance.toFixed(1)} km / ${road.estimatedTime} min` : '';
    return `<div class="route-step ${isStart ? 'route-start' : ''} ${isDestination ? 'route-destination' : ''}"><span class="route-marker">${isStart || isDestination ? '' : String(index + 1).padStart(2, '0')}</span><div><small>${stateLabel}</small><strong>${formatLocation(locationId)}</strong></div></div>${legDetails ? `<div class="route-connector"><i></i><span>${legDetails}</span></div>` : ''}`;
  }).join('');
  $('#resultDistance').textContent = formatDistance(result.distance);
  const totalTime = getRouteTime(result.path);
  $('#resultTime').textContent = `${totalTime} min`;
  $('#routeStops').textContent = result.path.length;
  $('#visitedNodes').textContent = result.visitedNodes.length;
  $('#routeResult').hidden = false;
  $('#lastDistance').textContent = formatDistance(result.distance);
  $('#routeRoads').innerHTML = result.path.slice(1).map((locationId, index) => {
    const from = result.path[index];
    const road = getRoad(from, locationId);
    return road ? `<div class="route-road-detail"><strong>${formatLocation(from)} <span>-&gt;</span> ${formatLocation(locationId)}</strong><small>${road.roadName} / ${road.distance.toFixed(1)} km / ${road.estimatedTime} min</small></div>` : '';
  }).join('');
  saveHistory(start, destination, result.distance, totalTime);
}

function handleRoute(event) {
  event.preventDefault(); clearMessage();
  const start = $('#startSelect').value, destination = $('#destinationSelect').value;
  if (!start || !destination) return displayError('Choose both a starting location and a destination.');
  try {
    const result = dijkstra(state.graph, start, destination);
    if (!result.reachable) return displayError('No route found between these locations.');
    state.lastResult = result; showRoute(result, start, destination); state.map.render(result.path);
  } catch (error) { displayError(`Could not calculate route: ${error.message}`); }
}

function bindEvents() {
  $('#routeForm').addEventListener('submit', handleRoute);
  $('#locationSearch').addEventListener('input', (event) => { state.search = event.target.value; renderLocations(); });
  $('#filterTabs').addEventListener('click', (event) => { const button = event.target.closest('.filter'); if (!button) return; document.querySelectorAll('.filter').forEach((item) => item.classList.remove('active')); button.classList.add('active'); state.activeFilter = button.dataset.filter; renderLocations(); });
  $('#clearHistory').addEventListener('click', () => { localStorage.removeItem(HISTORY_KEY); renderHistory(); });
}

async function init() {
  $('#currentDate').textContent = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(new Date()).toUpperCase();
  bindEvents(); renderHistory();
  try {
    const data = await loadNetworkData(); state.locations = data.locations; state.roads = data.roads;
    state.graph = new Graph(); state.locations.forEach((location) => state.graph.addVertex(location.id));
    state.roads.forEach((road) => state.graph.addEdge(road.from, road.to, road.distance, { estimatedTime: road.estimatedTime, roadName: road.roadName, roadType: road.roadType }));
    populateSelects(); updateMetrics(); renderLocations();
    state.map = new GraphMap($('#graphSvg'), state.locations, state.roads, selectLocation); state.map.render();
    $('#mapLoading').hidden = true;
  } catch (error) {
    $('#mapLoading').textContent = 'Unable to load Nashik route dataset.'; $('#mapLoading').classList.add('load-error'); displayError(`Unable to load Nashik route dataset. ${error.message}`);
  }
}

init();
