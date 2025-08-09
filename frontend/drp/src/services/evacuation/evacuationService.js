const { hitAreasToPolygons } = require('../hitArea/hitAreaToPolygon');
const { getRouteORS } = require('./orsService');
import * as turf from '@turf/turf';
import {
  findClosestHitArea,
  getBorderPoint,
  checkPointsSafety,
  pointsEqual
} from '../hitArea/hitAreaDistances'


// Get evacuation route from user to hit area border
async function getEvacuationRoute(userLocation, hitAreas) {
  // Find closest hit area
  const closestHitArea = findClosestHitArea(userLocation, hitAreas);
  if (!closestHitArea) return null;

  // Generate main escape point (direct bearing)
  const mainBearing = turf.bearing(
    turf.point([closestHitArea.lng, closestHitArea.lat]),
    turf.point([userLocation.lng, userLocation.lat])
  );
  const mainPoint = getBorderPoint(closestHitArea, mainBearing);

  // Generate diameter points (±90° from main bearing)
  const leftPoint = getBorderPoint(closestHitArea, mainBearing - 90);
  const rightPoint = getBorderPoint(closestHitArea, mainBearing + 90);
  console.log("POINTs: ", mainPoint, leftPoint, rightPoint);

  // Safety check and route evaluation
  const safetyResults = checkPointsSafety(
    [mainPoint, leftPoint, rightPoint],
    closestHitArea,
    hitAreas
  );
  console.log("SAFE POINTS:", safetyResults);

  // 5. Handle all cases based on safety results
  return handleSafetyCases(
    userLocation,
    closestHitArea,
    hitAreas,
    safetyResults,
    mainPoint,
    leftPoint,
    rightPoint
  );
}

async function handleSafetyCases(
  userLocation,
  closestHitArea,
  hitAreas,
  safety,
  mainPoint,
  leftPoint,
  rightPoint
) {
  // Case 1: Main point is safe
  if (safety.main.safe) {
    return handleMainSafeCase(
      userLocation,
      closestHitArea,
      hitAreas,
      safety,
      mainPoint,
      leftPoint,
      rightPoint
    );
  }

  // Case 2: Main point not safe, but diameter points might be
  return handleMainUnsafeCase(
    userLocation,
    closestHitArea,
    hitAreas,
    safety,
    mainPoint,
    leftPoint,
    rightPoint
  );
}

// Case 1: Main point is safe
async function handleMainSafeCase(
  userLocation,
  closestHitArea,
  hitAreas,
  safety,
  mainPoint,
  leftPoint,
  rightPoint
) {
  // Collect all safe points
  const safePoints = [mainPoint];
  if (safety.left.safe) safePoints.push(leftPoint);
  if (safety.right.safe) safePoints.push(rightPoint);

  // Evaluate safe points
  const routes = await evaluateSafePoints(userLocation, hitAreas, safePoints);

  // Find fastest route
  const fastest = findFastestRoute(routes);
  if (!fastest) return null;

  // Check if main point is optimal
  if (pointsEqual(fastest.point, mainPoint)) {
    console.log("main case: direct safe point");
    return formatRouteResult(fastest.route, mainPoint, closestHitArea);
  }

  // Refine with 45° point if needed
  return refineWith45DegPoint(
    userLocation,
    closestHitArea,
    hitAreas,
    mainPoint,
    fastest,
    pointsEqual(fastest.left, leftPoint)
  );
}

// Case 2: Main point is not safe
async function handleMainUnsafeCase(
  userLocation,
  closestHitArea,
  hitAreas,
  safety,
  mainPoint,
  leftPoint,
  rightPoint
) {
  // Collect safe diameter points
  const safeDiameterPoints = [];
  if (safety.left.safe) safeDiameterPoints.push(leftPoint);
  if (safety.right.safe) safeDiameterPoints.push(rightPoint);

  // Case: At least one diameter point is safe
  if (safeDiameterPoints.length > 0) {
    const routes = await evaluateSafePoints(userLocation, hitAreas, safeDiameterPoints);
    const fastest = findFastestRoute(routes);
    if (fastest) {
      console.log("not main case: safe point");
      return formatRouteResult(fastest.route, fastest.point, closestHitArea);
    }
  }

  // Case: No safe points at all - use fallback strategy
  return fallbackStrategy(
    userLocation,
    closestHitArea,
    hitAreas,
    mainPoint,
    safety
  );
}

// Fallback strategy when all points are unsafe
async function fallbackStrategy(
  userLocation,
  closestHitArea,
  hitAreas,
  mainPoint,
  safety
) {
  const mainBearing = turf.bearing(
    turf.point([closestHitArea.lng, closestHitArea.lat]),
    turf.point([userLocation.lng, userLocation.lat])
  );

  // Try opposite direction (180°)
  const oppositePoint = getBorderPoint(closestHitArea, mainBearing + 180);

  // Try 75° left and right of opposite
  const left75Point = getBorderPoint(closestHitArea, mainBearing + 180 - 75);
  const right75Point = getBorderPoint(closestHitArea, mainBearing + 180 + 75);

  // Check safety of new points
  const fallbackSafety = checkPointsSafety(
    [oppositePoint, left75Point, right75Point],
    closestHitArea,
    hitAreas
  );

  // Collect safe fallback points
  const safeFallbackPoints = [];
  if (fallbackSafety.main.safe) safeFallbackPoints.push(oppositePoint);
  if (fallbackSafety.left.safe) safeFallbackPoints.push(left75Point);
  if (fallbackSafety.right.safe) safeFallbackPoints.push(right75Point);

  // If we found safe points, evaluate them
  if (safeFallbackPoints.length > 0) {
    const routes = await evaluateSafePoints(userLocation, hitAreas, safeFallbackPoints);
    const fastest = findFastestRoute(routes);
    if (fastest) {
      console.log("fallback 1");
      return formatRouteResult(fastest.route, fastest.point, closestHitArea);
    }
  }

  // Expand radius for original points and check again
  return expandRadiusAndRetry(
    userLocation,
    closestHitArea,
    hitAreas,
    [mainPoint, leftPoint, rightPoint],
    safety
  );
}

async function evaluateSafePoints(userLocation, hitAreas, points) {
  const routes = await Promise.all(
    points.map(point => getRouteORS(userLocation, { lng: point[0], lat: point[1] }, hitAreas))
  );

  return points.map((point, i) => ({
    point,
    route: routes[i],
    duration: routes[i]?.features?.[0]?.properties?.summary?.duration || Infinity,
    distance: routes[i]?.features?.[0]?.properties?.summary?.distance || Infinity
  }));
}

function findFastestRoute(routes) {
  const validRoutes = routes.filter(r => r.duration < Infinity);
  if (validRoutes.length === 0) return null;

  return validRoutes.reduce((best, current) =>
    current.distance < best.distance ? current : best
  );
}

async function expandRadiusAndRetry(
  userLocation,
  closestHitArea,
  hitAreas,
  originalPoints,
  safety
) {
  const EXPANSION_METERS = 250;
  const expandedPoints = originalPoints.map(point =>
    getExpandedPoint(point, closestHitArea, EXPANSION_METERS)
  );

  // Check safety of expanded points
  const expandedSafety = checkPointsSafety(
    expandedPoints,
    closestHitArea,
    hitAreas
  );

  // Collect safe expanded points
  const safeExpandedPoints = [];
  if (expandedSafety.main.safe) safeExpandedPoints.push(expandedPoints[0]);
  if (expandedSafety.left.safe) safeExpandedPoints.push(expandedPoints[1]);
  if (expandedSafety.right.safe) safeExpandedPoints.push(expandedPoints[2]);

  // Evaluate any safe expanded points
  if (safeExpandedPoints.length > 0) {
    const routes = await evaluateSafePoints(userLocation, hitAreas, safeExpandedPoints);
    const fastest = findFastestRoute(routes);
    if (fastest) {
      console.log("fallback 2");
      return formatRouteResult(fastest.route, fastest.point, closestHitArea);
    }
  }

  // Final fallback - try opposite direction with expansion
  const mainBearing = turf.bearing(
    turf.point([closestHitArea.lng, closestHitArea.lat]),
    turf.point([userLocation.lng, userLocation.lat])
  );
  const expandedOpposite = getExpandedPoint(
    getBorderPoint(closestHitArea, mainBearing + 180),
    closestHitArea,
    EXPANSION_METERS
  );

  const route = await getRouteORS(userLocation, expandedOpposite, hitAreas);
  console.log("fallback 3");
  return route?.features?.[0]
    ? formatRouteResult(route, expandedOpposite, closestHitArea)
    : null;
}

function getExpandedPoint(point, hitArea, extraMeters) {
  const center = [hitArea.lng, hitArea.lat];
  const bearing = turf.bearing(
    turf.point(center),
    turf.point(point)
  );
  return turf.destination(
    turf.point(center),
    (hitArea.radius + extraMeters) / 1000,
    bearing,
    { units: 'kilometers' }
  ).geometry.coordinates;
}

async function refineWith45DegPoint(
  userLocation,
  closestHitArea,
  hitAreas,
  mainPoint,
  bestCandidate,
  isLeft
) {
  // Calculate bearing difference
  const center = [closestHitArea.lng, closestHitArea.lat];
  const mainBearing = turf.bearing(turf.point(center), turf.point(mainPoint));
  const bestBearing = turf.bearing(turf.point(center), turf.point(bestCandidate.point));

  // Calculate midpoint bearing (45° between main and best)
  const midBearing = (mainBearing + bestBearing) / 2;
  const midPoint = getBorderPoint(closestHitArea, midBearing);

  // Check safety
  const isMidSafe = checkPointsSafety([midPoint], closestHitArea, hitAreas).main.safe;

  if (!isMidSafe) {
    console.log("main case: not direct safe point");
    return formatRouteResult(bestCandidate.route, bestCandidate.point, closestHitArea);
  }

  // Get route for midpoint
  const midRoute = await getRouteORS(userLocation, { lng: midPoint[0], lat: mainPoint[1] }, hitAreas);
  const midDistance = midRoute?.features?.[0]?.properties?.summary?.distance || Infinity;
  console.log("main case: mid(45) safe point");

  if (bestCandidate.distance < midDistance) {
    const straightLineDist = turf.distance(
      turf.point([userLocation.lng, userLocation.lat]),
      turf.point(bestCandidate.point),
      { units: 'kilometers' }
    ) * 1000;

    const detourRatio = bestCandidate.route.features?.[0]?.properties?.summary?.distance / straightLineDist;
    console.log("detour ratio", detourRatio);

    if (detourRatio < 1.5)
      return formatRouteResult(bestCandidate.route, bestCandidate.point, closestHitArea);
    else {
      console.log("detour detected");
      const center = [closestHitArea.lng, closestHitArea.lat];
      let altBearing = null;
      if (isLeft) {
        altBearing = turf.bearing(
          turf.point(center),
          turf.point(bestCandidate.point)
        ) - 135; // Opposite 45° direction
        console.log("altBearing to the left", altBearing);
      } else {
        altBearing = turf.bearing(
          turf.point(center),
          turf.point(bestCandidate.point)
        ) + 135; // Opposite 45° direction
        console.log("altBearing to the right", altBearing);
      }

      const altPoint = getBorderPoint(closestHitArea, altBearing);
      const shouldRefine = isNearOtherHitArea({ lng: altPoint[0], lat: altPoint[1] }, hitAreas, closestHitArea);
      if (!shouldRefine) {
        const altRoute = await getRouteORS(userLocation, { lng: altPoint[0], lat: altPoint[1] }, hitAreas);

        if (altRoute?.features?.[0]) {
          const altDistance = altRoute.features[0].properties?.summary?.distance;
          if (altDistance < bestCandidate.distance) {
            return formatRouteResult(altRoute, altPoint, closestHitArea);
          }
        }
      }
      return formatRouteResult(bestCandidate.route, bestCandidate.point, closestHitArea);
    }
  }
}

function isNearOtherHitArea(point, hitAreas, currentHitArea) {
  return hitAreas.some(area => {
    if (area === currentHitArea) return false;
    const distance = turf.distance(
      turf.point([point.lng, point.lat]),
      turf.point([area.lng, area.lat]),
      { units: 'kilometers' }
    ) * 1000;
    return distance < area.radius;
  });
}


function formatRouteResult(route, borderPoint, hitArea) {
  return {
    route,
    borderPoint, // [lng, lat]
    hitArea,
    routeMetrics: {
      distance: route.features[0].properties.summary.distance,
      duration: route.features[0].properties.summary.duration
    }
  };
}

// Get safe route to nearest shelter (when user is out of hit area)
async function getSafeRouteToShelter(userLocation, shelters, hitAreas) {
  // Convert hit areas to ORS polygons for avoidance with more points for accuracy
  const avoidPolygons = hitAreasToPolygons(hitAreas);

  // Sort shelters by distance
  const sortedShelters = shelters
    .map(shelter => {
      const shelterDistance = turf.distance(
        turf.point([userLocation.lng, userLocation.lat]),
        turf.point([shelter.location.coordinates[0], shelter.location.coordinates[1]]),
        { units: 'kilometers' }
      ) * 1000; // Convert to meters

      return {
        ...shelter,
        distance: shelterDistance,
      };
    })
    .sort((a, b) => a.distance - b.distance);

  // Try each shelter until we get a valid route
  for (const shelter of sortedShelters) {
    const shelterCoords = {
      lat: shelter.location.coordinates[1],
      lng: shelter.location.coordinates[0],
    };

    const route = await getRouteORS(userLocation, shelterCoords, avoidPolygons, true);
    if (route) {
      return { route, shelter };
    }
  }

  return null;
}

module.exports = {
  getEvacuationRoute,
  getSafeRouteToShelter
};
