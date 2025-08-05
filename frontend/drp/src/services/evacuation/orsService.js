const axios = require('axios');
import { ORS_API_KEY } from '@env';

/**
 * If shelterBoolean is true, it adds avoid polygons to steer away from hit areas.
 * Gets a route from ORS.
 * @param {object} start - Start point.
 * @param {object} end - End point.
 * @param {Array} avoidPolygons - Array of polygons to avoid.
 * @param {boolean} shelterBoolean - Whether the route is for a shelter.
 * @returns {object} Route.
 */
async function getRouteORS(start, end, avoidPolygons = [], shelterBoolean) {
  let body = null;
  // console.log("avoidPolygons", avoidPolygons);
  if (shelterBoolean) {
    const multiCoords = avoidPolygons
      .map(polygon => {
        if (polygon.type === "Polygon" && Array.isArray(polygon.coordinates)) {
          return polygon.coordinates;
        }
        throw new Error("Invalid polygon object");
      });
    
    body = {
      coordinates: [
        [start.lng, start.lat],
        [end.lng, end.lat],
      ],
      profile: "foot-walking",
      format: "geojson",
      continue_straight: false,
      geometry_simplify: false,
      units: "m",
      suppress_warnings: true,
      options: {
        avoid_polygons: {
          type: "MultiPolygon",
          coordinates: multiCoords,
        }
      },
      maneuvers: true, // turn-by-turn
      instructions: true,
    };
  } else {
    body = {
      coordinates: [
        [start.lng, start.lat],
        [end.lng, end.lat],
      ],
      profile: "foot-walking",
      format: "geojson",
      geometry: true,
      continue_straight: false,
      geometry_simplify: false,
      units: "m",
      suppress_warnings: true,
      maneuvers: true, // turn-by-turn
      instructions: true,
    };
  }

  try {
    const res = await axios.post(
      "https://api.openrouteservice.org/v2/directions/foot-walking/geojson",
      body,
      {
        headers: {
          Authorization: ORS_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );
    return res.data; // GeoJSON route
  } catch (err) {
    console.log("ORS error:", err.response?.data || err.message);
    return null; // failed
  }
}

module.exports = { getRouteORS };
