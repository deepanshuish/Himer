function haversineKm(a, b) {
  const R = 6371; // km
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

// Approximate state/UT centroids (India)
// Used for "nearest colleges" without heavy geocoding.
const STATE_CENTROIDS = {
  'ANDHRA PRADESH': { lat: 15.9129, lon: 79.74 },
  'ARUNACHAL PRADESH': { lat: 28.218, lon: 94.7278 },
  ASSAM: { lat: 26.2006, lon: 92.9376 },
  BIHAR: { lat: 25.0961, lon: 85.3131 },
  CHHATTISGARH: { lat: 21.2787, lon: 81.8661 },
  GOA: { lat: 15.2993, lon: 74.124 },
  GUJARAT: { lat: 22.2587, lon: 71.1924 },
  HARYANA: { lat: 29.0588, lon: 76.0856 },
  'HIMACHAL PRADESH': { lat: 31.1048, lon: 77.1734 },
  JHARKHAND: { lat: 23.6102, lon: 85.2799 },
  KARNATAKA: { lat: 15.3173, lon: 75.7139 },
  KERALA: { lat: 10.8505, lon: 76.2711 },
  'MADHYA PRADESH': { lat: 22.9734, lon: 78.6569 },
  MAHARASHTRA: { lat: 19.7515, lon: 75.7139 },
  MANIPUR: { lat: 24.6637, lon: 93.9063 },
  MEGHALAYA: { lat: 25.467, lon: 91.3662 },
  MIZORAM: { lat: 23.1645, lon: 92.9376 },
  NAGALAND: { lat: 26.1584, lon: 94.5624 },
  ODISHA: { lat: 20.9517, lon: 85.0985 },
  PUNJAB: { lat: 31.1471, lon: 75.3412 },
  RAJASTHAN: { lat: 27.0238, lon: 74.2179 },
  SIKKIM: { lat: 27.533, lon: 88.5122 },
  'TAMIL NADU': { lat: 11.1271, lon: 78.6569 },
  TELANGANA: { lat: 18.1124, lon: 79.0193 },
  TRIPURA: { lat: 23.9408, lon: 91.9882 },
  'UTTAR PRADESH': { lat: 26.8467, lon: 80.9462 },
  UTTARAKHAND: { lat: 30.0668, lon: 79.0193 },
  'WEST BENGAL': { lat: 22.9868, lon: 87.855 },
  DELHI: { lat: 28.7041, lon: 77.1025 },
  'JAMMU AND KASHMIR': { lat: 33.7782, lon: 76.5762 },
  LADAKH: { lat: 34.1526, lon: 77.577 },
  'ANDAMAN AND NICOBAR ISLANDS': { lat: 11.7401, lon: 92.6586 },
  CHANDIGARH: { lat: 30.7333, lon: 76.7794 },
  'DADRA AND NAGAR HAVELI AND DAMAN AND DIU': { lat: 20.3974, lon: 72.8328 },
  'LAKSHADWEEP': { lat: 10.5667, lon: 72.6417 },
  PUDUCHERRY: { lat: 11.9416, lon: 79.8083 },
};

function normalizeState(state) {
  if (!state) return '';
  return String(state).trim().toUpperCase();
}

function getCollegeCoord(college) {
  const st = normalizeState(college.location?.state);
  return STATE_CENTROIDS[st] || null;
}

function inferGenderType(collegeName) {
  const n = String(collegeName || '').toLowerCase();
  if (/\b(women|womens|women's|girls|mahila|st\.?\s?mary's|lady)\b/.test(n)) return 'girls';
  if (/\b(boys|men|men's)\b/.test(n)) return 'boys';
  return 'coed';
}

function violatesGenderConstraint(a, b, c) {
  const types = [a.genderType, b.genderType, c.genderType];
  return types.every((t) => t === 'girls') || types.every((t) => t === 'boys');
}

/**
 * Generate clusters of exactly 3 colleges.
 * - Each college appears in exactly one cluster.
 * - Picks 2 nearest unassigned colleges for each anchor (by state centroid distance).
 * - Ensures not all 3 colleges are girls-only or boys-only.
 */
function generateClusters(colleges, { nearestPool = 30 } = {}) {
  if (!Array.isArray(colleges)) throw new Error('colleges must be an array');
  if (colleges.length % 3 !== 0) throw new Error(`College count must be divisible by 3 (got ${colleges.length})`);

  // Normalize to plain objects (Mongoose docs don't spread reliably) and ensure genderType exists
  const normalized = colleges.map((c) => {
    const obj = c && typeof c.toObject === 'function' ? c.toObject() : c;
    return {
      _id: obj?._id,
      name: obj?.name,
      genderType: obj?.genderType || inferGenderType(obj?.name),
      location: obj?.location || {},
    };
  });

  const unassigned = new Map(normalized.map((c) => [String(c._id), c]));
  const clusters = [];

  const orderedIds = normalized
    .slice()
    .sort((a, b) => (normalizeState(a.location?.state) || '').localeCompare(normalizeState(b.location?.state) || '') || String(a.name).localeCompare(String(b.name)))
    .map((c) => String(c._id));

  for (const id of orderedIds) {
    if (!unassigned.has(id)) continue;
    const a = unassigned.get(id);
    unassigned.delete(id);

    const candidates = [];
    const aCoord = getCollegeCoord(a);
    for (const [, c] of unassigned) {
      const cCoord = getCollegeCoord(c);
      const dist = aCoord && cCoord ? haversineKm(aCoord, cCoord) : Number.POSITIVE_INFINITY;
      candidates.push({ c, dist });
    }
    candidates.sort((x, y) => x.dist - y.dist);

    const pool = candidates.slice(0, Math.max(10, nearestPool));
    let chosenB = null;
    let chosenC = null;

    // Try pair combinations in nearest pool
    for (let i = 0; i < pool.length; i++) {
      for (let j = i + 1; j < pool.length; j++) {
        const b = pool[i].c;
        const c = pool[j].c;
        if (violatesGenderConstraint(a, b, c)) continue;
        chosenB = b;
        chosenC = c;
        break;
      }
      if (chosenB) break;
    }

    if (!chosenB || !chosenC) {
      // Fallback: pick two nearest regardless of gender (should be rare)
      if (candidates.length < 2) throw new Error('Not enough colleges left to form a cluster');
      chosenB = candidates[0].c;
      chosenC = candidates[1].c;
    }

    unassigned.delete(String(chosenB._id));
    unassigned.delete(String(chosenC._id));

    clusters.push([a, chosenB, chosenC]);
  }

  if (clusters.length !== colleges.length / 3) {
    throw new Error(`Cluster generation mismatch: expected ${colleges.length / 3} clusters, got ${clusters.length}`);
  }

  return clusters;
}

module.exports = {
  generateClusters,
  inferGenderType,
};


