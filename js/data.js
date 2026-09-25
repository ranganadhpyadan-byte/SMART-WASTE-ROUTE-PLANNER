const DATA_FILES = {
  locations: '../data/locations.json',
  roads: '../data/roads.json'
};

function validateData(locations, roads) {
  if (!Array.isArray(locations) || !Array.isArray(roads)) throw new Error('Network data must contain locations and roads arrays.');
  const locationIds = new Set(locations.map((location) => location.id));
  if (locations.length === 0 || roads.length === 0) throw new Error('Network data is empty.');
  if (locationIds.size !== locations.length) throw new Error('Network data contains duplicate location IDs.');
  for (const location of locations) {
    if (!location.id || !location.name || !location.area || !location.type || !location.wasteType || !location.priority || !location.description || !location.sourceNote || typeof location.latitude !== 'number' || typeof location.longitude !== 'number' || typeof location.wasteLevel !== 'number') throw new Error('A location record is incomplete.');
  }
  for (const road of roads) {
    if (!locationIds.has(road.from) || !locationIds.has(road.to) || !road.roadName || !road.roadType || !road.sourceNote || typeof road.distance !== 'number' || road.distance <= 0 || typeof road.estimatedTime !== 'number') throw new Error('A road record refers to an invalid location, distance, or source note.');
  }
}

export async function loadNetworkData() {
  try {
    const responses = await Promise.all(Object.values(DATA_FILES).map((file) => fetch(file)));
    if (responses.some((response) => !response.ok)) throw new Error('One or more network data files could not be loaded.');
    const [locations, roads] = await Promise.all(responses.map((response) => response.json()));
    validateData(locations, roads);
    return { locations, roads };
  } catch (error) {
    throw new Error(`Failed to load network data: ${error.message}`);
  }
}
