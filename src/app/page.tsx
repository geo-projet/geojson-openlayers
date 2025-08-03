import OLMap from "@/components/Map";

export default function Home() {
  // Exemple simple de GeoJSON
  const geojsonData = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [-73.6, 45.5],
              [-73.4, 45.5],
              [-73.4, 45.7],
              [-73.6, 45.7],
              [-73.6, 45.5],
            ],
          ],
        },
        properties: { name: "Zone test Montréal" },
      },
    ],
  } as GeoJSON.FeatureCollection;

  return (
    <main style={{ padding: "20px" }}>
      <h1>Carte OpenLayers avec GeoJSON</h1>
      <OLMap geojsonData={geojsonData} />
    </main>
  );
}
