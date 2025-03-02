import { Way, Node } from "@classes/graph/GraphGL";

const OVERPASS_API_URL = "https://overpass-api.de/api/interpreter";
const BBOX_LIMIT = 0.5;

/**
 * Function to fetch roads from Overpass API
 * @param latMin Number - Lower range of latitude (south)
 * @param lonMin Number - Lower range of longitude (west)
 * @param latMax Number - Upper range of latitude (north)
 * @param lonMax Number - Upper range of longitude (east)
 * @returns
 */
export async function fetchOSMRoads(
  latMin: number,
  lonMin: number,
  latMax: number,
  lonMax: number
): Promise<Way[]> {
  if (latMax - latMin > BBOX_LIMIT || lonMax - lonMin > BBOX_LIMIT) {
    return Promise.reject(
      "Bounding Box Range too large to query. Try zooming in before requesting roadways."
    );
  }

  const query = `
      [out:json];
      way["highway"]["highway"~"motorway|trunk|primary|secondary|tertiary|residential"](${latMin},${lonMin},${latMax},${lonMax});
      out geom;
  `;

  const response = await fetch(OVERPASS_API_URL, {
    method: "POST",
    body: `data=${encodeURIComponent(query)}`,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  const data = await response.json();

  return data.elements
    .filter((el: any) => el.type === "way" && el.geometry)
    .map(
      (way: any): Way => ({
        id: way.id,
        nodes: way.geometry.map(
          (p: any, i: number): Node => ({
            id: way.nodes[i],
            lat: p.lat,
            lng: p.lon,
          })
        ),
        tags: way.tags,
      })
    );
}
