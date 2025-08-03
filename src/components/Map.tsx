"use client";

import { useEffect, useRef } from "react";
import Map from "ol/Map";
import View from "ol/View";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { OSM } from "ol/source";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { Style, Fill, Stroke } from "ol/style";
import { FeatureLike } from "ol/Feature";
import "ol/ol.css";

interface MapProps {
  geojsonData: GeoJSON.FeatureCollection;
}

export default function OLMap({ geojsonData }: MapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Source GeoJSON
    const vectorSource = new VectorSource({
      features: new GeoJSON().readFeatures(geojsonData, {
        featureProjection: "EPSG:3857", // reprojection pour Web Mercator
      }),
    });

    // Style simple
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: (feature: FeatureLike) =>
        new Style({
          fill: new Fill({ color: "rgba(0, 150, 255, 0.4)" }),
          stroke: new Stroke({ color: "#003366", width: 2 }),
        }),
    });

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({ source: new OSM() }),
        vectorLayer,
      ],
      view: new View({
        center: [-8230000, 5700000], // exemple: Montréal
        zoom: 6,
      }),
    });

    return () => {
      map.setTarget(undefined);
    };
  }, [geojsonData]);

  return <div ref={mapRef} style={{ width: "100%", height: "500px" }} />;
}
