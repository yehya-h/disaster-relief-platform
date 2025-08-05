const { hitAreasToPolygons } = require('../hitArea/hitAreaToPolygon');
const { getRouteORS } = require('./orsService');
import { point as turfPoint } from '@turf/helpers';
import distance from '@turf/distance';
const { generateCirclePoints } = require('../hitArea/hitAreaToPolygon');
import { isInHitArea } from '../location/distanceService';

// Calculate the shortest distance from user location to hit area border
function calculateDistanceToHitAreaCenter(userLocation, hitArea) {
  const { lat: userLat, lng: userLng } = userLocation;
  const { lat: centerLat, lng: centerLng, radius } = hitArea;

  // Calculate distance from user to hit area center using Turf.js
  const distanceToCenter = distance(
    turfPoint([centerLng, centerLat]),
    turfPoint([userLng, userLat]),
    { units: 'kilometers' }
  ) * 1000; // Convert to meters

  return {
    distance: distanceToCenter,
    centerLat,
    centerLng,
    radius
  };
}

// Generate border points for a hit area using the circle generation function
function generateBorderPoints(hitArea, numPoints = 8) {
  const { lat, lng, radius } = hitArea;
  const circlePoints = generateCirclePoints(lat, lng, radius, numPoints);

  // Convert from [lng, lat] to {lat, lng} format
  return circlePoints.map(point => ({
    lat: point[1],
    lng: point[0]
  }));
}

// Get evacuation route from user to hit area border using multiple border points
async function getEvacuationRoute(userLocation, hitAreas) {
  if (!hitAreas || hitAreas.length === 0) {
    return null;
  }

  // Find the closest hit area
  let closestHitArea = null;
  let minDistance = Infinity;

  for (const hitArea of hitAreas) {
    const distanceInfo = calculateDistanceToHitAreaCenter(userLocation, hitArea);
    if (distanceInfo.distance < minDistance) {
      minDistance = distanceInfo.distance;
      closestHitArea = hitArea;
    }
  }

  if (!closestHitArea) {  // No hit area found  
    return null;
  }

  console.log("closestHitArea", closestHitArea);

  // Generate multiple border points around the hit area
  const borderPoints = generateBorderPoints(closestHitArea, 8); // 8 border points
  console.log(`Generated ${borderPoints.length} border points for route optimization`);

  // Pre-filter border points that are in other hit areas
  const safeBorderPoints = borderPoints.filter(borderPoint => {
    const isInDanger = hitAreas.some(hitArea => {
      // Skip the current hit area
      if (hitArea === closestHitArea) return false;
      return isInHitArea(borderPoint.lat, borderPoint.lng, [hitArea]);
    });

    if (isInDanger) {
      console.log(`Border point (${borderPoint.lat},${borderPoint.lng}) is in another hit area - excluded`);
      return false;
    }
    return true;
  });

  if (safeBorderPoints.length === 0) {
    console.warn("No safe border points found outside other hit areas");
    return null;
  }

  // Try to get routes to all border points
  const routePromises = safeBorderPoints.map(async (borderPoint, index) => {
    try {
      const route = await getRouteORS(userLocation, borderPoint, [], false);

      if (route && route.features && route.features[0]) {
        const routeFeature = route.features[0];
        const distance = routeFeature.properties?.summary?.distance || 0; // meters
        const duration = routeFeature.properties?.summary?.duration || 0; // seconds

        return {
          route,
          borderPoint,
          distance,
          duration,
          index
        };
      }
      return null;
    } catch (error) {
      console.error(`Error calculating route to border point ${index + 1}:`, error);
      return null;
    }
  });

  // Wait for all routes to be calculated
  const routeResults = await Promise.all(routePromises);
  const validRoutes = routeResults.filter(result => result !== null);

  if (validRoutes.length === 0) {
    console.warn("No valid routes found to any border point");
    return null;
  }

  console.log(`Found ${validRoutes.length} valid routes out of ${borderPoints.length} border points`);

  // Select the best route based on duration (time) 
  const bestRoute = validRoutes.reduce((best, current) => {
    // Prioritize duration (time) over distance for evacuation
    if (current.duration < best.duration) {
      return current;
    }
    // If durations are equal, prefer shorter distance
    if (current.duration === best.duration && current.distance < best.distance) {
      return current;
    }
    return best;
  });

  console.log(`Selected best route: ${bestRoute.duration}s duration, ${bestRoute.distance}m distance`);
  console.log("Best border point:", bestRoute.borderPoint);

  return {
    route: bestRoute.route,
    borderPoint: bestRoute.borderPoint,
    hitArea: closestHitArea,
    distance: minDistance,
    routeMetrics: {
      duration: bestRoute.duration,
      distance: bestRoute.distance
    },
    allRoutes: validRoutes // Include all routes for debugging/analysis
  };
}

// Get safe route to nearest shelter (when user is out of hit area)
async function getSafeRouteToShelter(userLocation, shelters, hitAreas) {
  // Convert hit areas to ORS polygons for avoidance with more points for accuracy
  const avoidPolygons = hitAreasToPolygons(hitAreas);

  // Sort shelters by distance using Turf.js
  const sortedShelters = shelters
    .map(shelter => {
      const shelterDistance = distance(
        turfPoint([userLocation.lng, userLocation.lat]),
        turfPoint([shelter.location.coordinates[0], shelter.location.coordinates[1]]),
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
  getSafeRouteToShelter,
  calculateDistanceToHitAreaCenter,
  generateBorderPoints
};
