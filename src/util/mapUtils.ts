/**
 * @param lng Longitude
 * @returns A longitude clamped between [-180, 180)
 */
export const clampLongitude = (lng: number) => {
  // First %360 could result in negative number. To make positive for sure, +540. Then redo %360 and -180.
  return (((lng % 360) + 540) % 360) - 180;
};
