/**
 * Converts hit areas to polygons using generateCirclePoints.
 * @param {Array} hitAreas - Array of hit areas.
 * @returns {Array} Array of polygons.
 */
function hitAreasToPolygons(hitAreas) {
  // hitAreas: [{ lat, lng, radius }]
  return hitAreas.map(area => ({
    type: "Polygon",
    coordinates: [generateCirclePoints(area.lat, area.lng, area.radius)]
  }));
}

/**
 * Generates polygon coordinates that form a circle.
 * @param {number} lat - Latitude of the center point.
 * @param {number} lng - Longitude of the center point.
 * @param {number} radius - Radius of the circle in meters.
 * @param {number} points - Number of points to generate.
 * @returns {Array} Array of [longitude, latitude] points.
 */
function generateCirclePoints(lat, lng, radius, points = 8) {
  const coords = [];
  const earthRadius = 6371e3; // meters
  const toRad = (deg) => (deg * Math.PI) / 180;
  const toDeg = (rad) => (rad * 180) / Math.PI;

  for (let i = 0; i <= points; i++) {
    const angle = (i * 360) / points;
    const bearing = toRad(angle);

    const lat1 = toRad(lat);
    const lon1 = toRad(lng);

    const lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(radius / earthRadius) +
      Math.cos(lat1) * Math.sin(radius / earthRadius) * Math.cos(bearing)
    );
    const lon2 =
      lon1 +
      Math.atan2(
        Math.sin(bearing) * Math.sin(radius / earthRadius) * Math.cos(lat1),
        Math.cos(radius / earthRadius) - Math.sin(lat1) * Math.sin(lat2)
      );

    coords.push([toDeg(lon2), toDeg(lat2)]); // GeoJSON order: [lon, lat]
  }
  return coords;
}
module.exports = { hitAreasToPolygons, generateCirclePoints };
