/**
 * @param lng Longitude
 * @returns A longitude clamped between [-180, 180)
 */
export const clampLongitude = (lng: number) => {
  // First %360 could result in negative number. To make positive for sure, +540. Then redo %360 and -180.
  return (((lng % 360) + 540) % 360) - 180;
};

/**
 * Calculate the distance in meters between two coordinate points using the Haversine Formula.
 * Source: https://stackoverflow.com/a/11172685
 * @param lat1 Number - Starting latitude
 * @param lng1 Number - Starting longitutde
 * @param lat2 Number - Ending latitude
 * @param lng2 Nunber - Ending longitude
 * @returns Number - Distance between two coordinates in meters
 */
export function haversine_distance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) {
  // generally used geo measurement function
  var R = 6378.137; // Radius of earth in KM
  var dLat = (lat2 * Math.PI) / 180 - (lat1 * Math.PI) / 180;
  var dLon = (lng2 * Math.PI) / 180 - (lng1 * Math.PI) / 180;
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d * 1000; // meters
}
