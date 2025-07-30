const getDistanceInMeters = (lat1, lon1, lat2, lon2) => {
  const toRad = x => (x * Math.PI) / 180;

  const R = 6371e3; // Earth's radius in meters
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // distance in meters
};

export const isWithinDistance = (lat1, lon1, lat2, lon2, distance) => {
  const dist = getDistanceInMeters(lat1, lon1, lat2, lon2);
  return dist <= distance;
}