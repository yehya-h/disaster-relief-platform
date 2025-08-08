import * as turf from '@turf/turf';

function findClosestHitArea(userLocation, hitAreas) {
  if (!hitAreas || hitAreas.length === 0) {
    return null;
  }

  let closestHitArea = null;
  let minDistance = Infinity;

  for (const hitArea of hitAreas) {
    const distanceInfo = calculateDistanceToHitAreaCenter(userLocation, hitArea);
    if (distanceInfo.distance < minDistance) {
      minDistance = distanceInfo.distance;
      closestHitArea = hitArea;
    }
  }

  return closestHitArea;
}

// Calculate the shortest distance from user location to hit area border
function calculateDistanceToHitAreaCenter(userLocation, hitArea) {
  const { lat: userLat, lng: userLng } = userLocation;
  const { lat: centerLat, lng: centerLng, radius } = hitArea;

  // Calculate distance from user to hit area center using Turf.js
  const distanceToCenter = turf.distance(
    turf.point([centerLng, centerLat]),
    turf.point([userLng, userLat]),
    { units: 'kilometers' }
  ) * 1000; // Convert to meters

  return {
    distance: distanceToCenter,
    centerLat,
    centerLng,
    radius
  };
}

function getBorderPoint(hitArea, bearing) {
  return turf.destination(
    turf.point([hitArea.lng, hitArea.lat]),
    hitArea.radius / 1000,
    bearing,
    { units: 'kilometers' }
  ).geometry.coordinates;
}

function checkPointsSafety(points, currentHitArea, allHitAreas) {
  const results = {
    main: { point: points[0], safe: false },
    left: { point: points[1], safe: false },
    right: { point: points[2], safe: false }
  };

  points.forEach((point, index) => {
    const key = index === 0 ? 'main' : index === 1 ? 'left' : 'right';
    results[key].safe = !allHitAreas.some(area => {
      if (area === currentHitArea) return false;
      const distance = turf.distance(
        turf.point([area.lng, area.lat]),
        turf.point(point),
        { units: 'kilometers' }
      ) * 1000;
      return distance <= area.radius;
    });
  });

  return results;
}


function pointsEqual(p1, p2) {
  if (!p1 || !p2) return false;
  return Math.abs(p1[0] - p2[0]) < 1e-6 &&
    Math.abs(p1[1] - p2[1]) < 1e-6;
}

module.exports = {
  calculateDistanceToHitAreaCenter,
  findClosestHitArea,
  getBorderPoint,
  checkPointsSafety,
  pointsEqual
}